import os
import sys
import httpx
import asyncio
import datetime
import json
import time
from pathlib import Path

# Cấu hình Supabase
SUPABASE_URL = "https://fwoxlggleieoztmcvsju.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI"

# Hằng số
BUCKET_NAME = "hymn"
PDF_PREFIX = "pdf/"
LOG_FILE = "detailed_upload.log"

# Biến toàn cục
ACCESS_TOKEN = None
success_count = 0
error_count = 0

def log_message(message):
    """Log message to file and print to console"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_line + "\n")

async def get_token():
    """Get authentication token"""
    global ACCESS_TOKEN
    
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": "admin@example.com",
        "password": "admin123456"
    }
    
    log_message("Getting authentication token...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=data, timeout=30.0)
            if response.status_code != 200:
                log_message(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
            
            ACCESS_TOKEN = response.json()["access_token"]
            log_message("✅ Authentication successful")
            return True
        except Exception as e:
            log_message(f"❌ Authentication error: {str(e)}")
            return False

def get_auth_headers(content_type=None, prefer=None):
    """Get request headers"""
    headers = {"apikey": SUPABASE_ANON_KEY}
    
    if ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {ACCESS_TOKEN}"
    
    if content_type:
        headers["Content-Type"] = content_type
    
    if prefer:
        headers["Prefer"] = prefer
    
    return headers

async def upload_pdf(client, file_path):
    """Upload a PDF file and create all necessary records"""
    global success_count, error_count
    
    try:
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        parts = name_without_ext.split('_')
        
        # Extract title and author
        author_name = parts[-1].strip().title() if len(parts) > 1 else "Unknown"
        title_parts = parts[:-1] if len(parts) > 1 else parts
        hymn_title = ' '.join(title_parts).strip().title()
        
        log_message(f"Processing: {base_name}")
        log_message(f"  Title: {hymn_title}")
        log_message(f"  Author: {author_name}")
        
        # Step 1: Upload to storage
        storage_path = f"{PDF_PREFIX}{base_name}"
        storage_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
        
        # Check if file exists in storage
        check_url = f"{SUPABASE_URL}/storage/v1/object/info/public/{BUCKET_NAME}/{storage_path}"
        check_response = await client.head(check_url, headers=get_auth_headers())
        
        if check_response.status_code == 200:
            log_message(f"  File already exists in storage")
            pdf_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        else:
            log_message(f"  Uploading file to storage...")
            
            with open(file_path, "rb") as f:
                files = {"file": (base_name, f, "application/pdf")}
                upload_response = await client.post(storage_url, headers=get_auth_headers(), files=files, timeout=60.0)
                
                if upload_response.status_code not in [200, 201]:
                    log_message(f"  ❌ Upload failed: {upload_response.status_code} - {upload_response.text}")
                    error_count += 1
                    return False
                
                log_message(f"  ✅ Upload successful")
                pdf_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        
        # Step 2: Create or get author
        log_message(f"  Looking for author: {author_name}")
        author_url = f"{SUPABASE_URL}/rest/v1/authors?name=eq.{author_name}"
        author_response = await client.get(author_url, headers=get_auth_headers())
        
        if author_response.status_code == 200 and len(author_response.json()) > 0:
            author_id = author_response.json()[0]["id"]
            log_message(f"  ✅ Author exists, ID: {author_id}")
        else:
            log_message(f"  Creating new author...")
            
            now = datetime.datetime.now().isoformat()
            author_data = {
                "name": author_name,
                "biography": f"Author of hymns",
                "created_at": now
            }
            
            create_author_url = f"{SUPABASE_URL}/rest/v1/authors"
            create_author_response = await client.post(
                create_author_url,
                headers=get_auth_headers(content_type="application/json", prefer="return=representation"),
                json=author_data,
                timeout=30.0
            )
            
            if create_author_response.status_code != 201:
                log_message(f"  ❌ Author creation failed: {create_author_response.status_code} - {create_author_response.text}")
                error_count += 1
                return False
                
            author_id = create_author_response.json()[0]["id"]
            log_message(f"  ✅ Author created, ID: {author_id}")
        
        # Step 3: Create or get hymn
        log_message(f"  Looking for hymn: {hymn_title}")
        hymn_url = f"{SUPABASE_URL}/rest/v1/hymns?title=eq.{hymn_title}"
        hymn_response = await client.get(hymn_url, headers=get_auth_headers())
        
        if hymn_response.status_code == 200 and len(hymn_response.json()) > 0:
            hymn_id = hymn_response.json()[0]["id"]
            log_message(f"  ✅ Hymn exists, ID: {hymn_id}")
        else:
            log_message(f"  Creating new hymn...")
            
            now = datetime.datetime.now().isoformat()
            hymn_data = {
                "title": hymn_title,
                "lyrics": f"Lyrics for {hymn_title}",
                "created_at": now,
                "updated_at": now
            }
            
            create_hymn_url = f"{SUPABASE_URL}/rest/v1/hymns"
            create_hymn_response = await client.post(
                create_hymn_url,
                headers=get_auth_headers(content_type="application/json", prefer="return=representation"),
                json=hymn_data,
                timeout=30.0
            )
            
            if create_hymn_response.status_code != 201:
                log_message(f"  ❌ Hymn creation failed: {create_hymn_response.status_code} - {create_hymn_response.text}")
                error_count += 1
                return False
                
            hymn_id = create_hymn_response.json()[0]["id"]
            log_message(f"  ✅ Hymn created, ID: {hymn_id}")
        
        # Step 4: Link hymn and author
        log_message(f"  Checking hymn-author link...")
        link_check_url = f"{SUPABASE_URL}/rest/v1/hymn_authors?hymn_id=eq.{hymn_id}&author_id=eq.{author_id}"
        link_check_response = await client.get(link_check_url, headers=get_auth_headers())
        
        if link_check_response.status_code == 200 and len(link_check_response.json()) > 0:
            log_message(f"  ✅ Hymn-author link exists")
        else:
            log_message(f"  Creating hymn-author link...")
            
            link_data = {
                "hymn_id": hymn_id,
                "author_id": author_id
            }
            
            link_url = f"{SUPABASE_URL}/rest/v1/hymn_authors"
            link_response = await client.post(
                link_url,
                headers=get_auth_headers(content_type="application/json", prefer="return=representation"),
                json=link_data,
                timeout=30.0
            )
            
            if link_response.status_code != 201:
                log_message(f"  ❌ Hymn-author link failed: {link_response.status_code} - {link_response.text}")
                # Continue anyway as this isn't critical
            else:
                log_message(f"  ✅ Hymn-author link created")
        
        # Step 5: Create or update PDF file record
        log_message(f"  Checking PDF record...")
        pdf_check_url = f"{SUPABASE_URL}/rest/v1/pdf_files?hymn_id=eq.{hymn_id}"
        pdf_check_response = await client.get(pdf_check_url, headers=get_auth_headers())
        
        now = datetime.datetime.now().isoformat()
        
        if pdf_check_response.status_code == 200 and len(pdf_check_response.json()) > 0:
            log_message(f"  Updating existing PDF record...")
            
            existing = pdf_check_response.json()[0]
            current_version = existing.get("version", 0) or 0
            
            update_data = {
                "file_url": pdf_url,
                "updated_at": now,
                "version": current_version + 1
            }
            
            update_url = f"{SUPABASE_URL}/rest/v1/pdf_files?id=eq.{existing['id']}"
            update_response = await client.patch(
                update_url,
                headers=get_auth_headers(content_type="application/json"),
                json=update_data,
                timeout=30.0
            )
            
            if update_response.status_code != 200:
                log_message(f"  ❌ PDF record update failed: {update_response.status_code} - {update_response.text}")
                error_count += 1
                return False
                
            log_message(f"  ✅ PDF record updated")
        else:
            log_message(f"  Creating new PDF record...")
            
            pdf_data = {
                "hymn_id": hymn_id,
                "file_url": pdf_url,
                "created_at": now,
                "updated_at": now,
                "version": 1
            }
            
            pdf_url_api = f"{SUPABASE_URL}/rest/v1/pdf_files"
            pdf_response = await client.post(
                pdf_url_api,
                headers=get_auth_headers(content_type="application/json", prefer="return=representation"),
                json=pdf_data,
                timeout=30.0
            )
            
            if pdf_response.status_code != 201:
                log_message(f"  ❌ PDF record creation failed: {pdf_response.status_code} - {pdf_response.text}")
                error_count += 1
                return False
                
            log_message(f"  ✅ PDF record created")
        
        log_message(f"✓ Successfully processed: {base_name}")
        success_count += 1
        return True
        
    except Exception as e:
        log_message(f"❌ Error processing {os.path.basename(file_path)}: {str(e)}")
        error_count += 1
        return False

async def process_sample_files(pdf_dir, limit=10):
    """Process a sample of files to test"""
    # Reset the log file
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write("=== Detailed Upload Log ===\n")
    
    # Get authentication token
    if not await get_token():
        return
    
    # Find PDF files
    pdf_files = list(Path(pdf_dir).glob("*.pdf"))
    if not pdf_files:
        log_message(f"No PDF files found in {pdf_dir}")
        return
    
    # Select a limited sample
    sample_files = pdf_files[:min(limit, len(pdf_files))]
    log_message(f"Processing {len(sample_files)} sample files from {pdf_dir}")
    
    # Process files
    async with httpx.AsyncClient() as client:
        for file_path in sample_files:
            await upload_pdf(client, str(file_path))
            # Wait a bit between files
            await asyncio.sleep(1)
    
    log_message(f"Processing complete. Success: {success_count}, Errors: {error_count}")

async def main():
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else "temp_pdf"
    
    # Process 10 files as a sample to debug
    await process_sample_files(pdf_dir, 10)

if __name__ == "__main__":
    asyncio.run(main())