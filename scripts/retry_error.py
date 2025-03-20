import os
import sys
import httpx
import asyncio
import datetime
import json
import time
from pathlib import Path
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://fwoxlggleieoztmcvsju.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI"

# Constants
BUCKET_NAME = "hymn"
PDF_PREFIX = "pdf/"
PROGRESS_FILE = "upload_progress.json"
RETRY_DELAY = 5  # seconds

# Variables
ACCESS_TOKEN = None
LAST_TOKEN_REFRESH = None
TOKEN_REFRESH_INTERVAL = 1800  # 30 minutes

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

async def refresh_token():
    """Refresh authentication token"""
    global ACCESS_TOKEN, LAST_TOKEN_REFRESH
    
    current_time = time.time()
    if ACCESS_TOKEN is None or LAST_TOKEN_REFRESH is None or (current_time - LAST_TOKEN_REFRESH > TOKEN_REFRESH_INTERVAL):
        try:
            print("Refreshing authentication token...")
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: supabase.auth.sign_in_with_password({
                    "email": "admin@example.com",
                    "password": "admin123456"
                })
            )
            if not response.user:
                raise Exception("Login failed: No user returned")
            
            ACCESS_TOKEN = response.session.access_token
            LAST_TOKEN_REFRESH = current_time
            print("Token refreshed successfully")
        except Exception as e:
            # Try manual sign in
            print(f"Error with Supabase client: {str(e)}. Trying manual sign in...")
            url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
            headers = {
                "apikey": SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
            data = {
                "email": "admin@example.com",
                "password": "admin123456"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=data)
                if response.status_code != 200:
                    raise Exception(f"Manual login failed: {response.status_code} - {response.text}")
                
                ACCESS_TOKEN = response.json()["access_token"]
                LAST_TOKEN_REFRESH = current_time
                print("Token refreshed manually")

def get_auth_headers(content_type=None, prefer=None):
    """Get authentication headers"""
    headers = {"apikey": SUPABASE_ANON_KEY}
    
    if ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {ACCESS_TOKEN}"
    
    if content_type:
        headers["Content-Type"] = content_type
    if prefer:
        headers["Prefer"] = prefer
    
    return headers

def analyze_progress_file():
    """Analyze upload_progress.json to find processed files and success count"""
    if not os.path.exists(PROGRESS_FILE):
        return [], 0
    
    with open(PROGRESS_FILE, 'r') as f:
        data = json.load(f)
    
    processed_files = data.get('processed_files', [])
    success_count = data.get('success_count', 0)
    
    # Calculate error files count
    error_files_count = len(processed_files) - success_count
    
    print(f"Progress file analysis:")
    print(f"- Total processed: {len(processed_files)}")
    print(f"- Success count: {success_count}")
    print(f"- Error files: {error_files_count}")
    
    return processed_files, success_count

def update_progress(processed_files, success_count):
    """Update progress file with new data"""
    data = {
        'processed_files': processed_files,
        'success_count': success_count,
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(data, f)

async def identify_error_files(pdf_dir, processed_files):
    """Identify files that need to be reprocessed"""
    # Find all PDF files in directory
    all_pdf_files = [str(p) for p in Path(pdf_dir).glob('*.pdf')]
    
    # 1. Files that weren't processed at all (not in processed_files)
    unprocessed_files = [f for f in all_pdf_files if f not in processed_files]
    
    # 2. Potential error files (in processed_files but might have failed)
    potential_error_files = []
    
    # Create a simple check for files that might have had errors
    # This approach is faster than checking the database for each file
    async with httpx.AsyncClient() as client:
        await refresh_token()
        headers = get_auth_headers()
        
        # Check if the bucket exists
        url = f"{SUPABASE_URL}/storage/v1/bucket/{BUCKET_NAME}"
        response = await client.head(url, headers=headers)
        if response.status_code != 200:
            print(f"Warning: Bucket '{BUCKET_NAME}' may not exist")
    
    print(f"\nFile analysis:")
    print(f"- Total PDF files: {len(all_pdf_files)}")
    print(f"- Unprocessed files: {len(unprocessed_files)}")
    
    return unprocessed_files, potential_error_files

async def check_file_exists(client, file_name):
    """Check if file already exists in storage"""
    await refresh_token()
    headers = get_auth_headers()
    
    storage_path = f"{PDF_PREFIX}{file_name}"
    url = f"{SUPABASE_URL}/storage/v1/object/info/public/{BUCKET_NAME}/{storage_path}"
    
    response = await client.head(url, headers=headers)
    return response.status_code == 200

async def upload_file(client, file_path, file_name):
    """Upload file to storage"""
    await refresh_token()
    headers = get_auth_headers()
    
    storage_path = f"{PDF_PREFIX}{file_name}"
    
    # Check if already exists
    if await check_file_exists(client, file_name):
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
    
    # Upload file
    with open(file_path, 'rb') as f:
        files = {'file': (file_name, f, 'application/pdf')}
        url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{storage_path}"
        
        response = await client.post(url, headers=headers, files=files)
        if response.status_code not in [200, 201]:
            raise Exception(f"Upload failed: {response.status_code} - {response.text}")
        
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"

async def process_pdf(client, file_path):
    """Process a PDF file completely"""
    try:
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        parts = name_without_ext.split('_')

        # Extract author and title
        author_name = parts[-1].strip().title() if len(parts) > 1 else "Unknown"
        title_parts = parts[:-1] if len(parts) > 1 else parts
        hymn_title = ' '.join(title_parts).strip().title()
        
        # Determine category
        category_name = "Uncategorized"
        if "TV" in name_without_ext:
            category_name = "Thánh Vịnh"
        elif "TL" in name_without_ext:
            category_name = "Thánh Lễ"
        elif "CN" in name_without_ext:
            category_name = "Chúa Nhật"
        elif "MC" in name_without_ext:
            category_name = "Mùa Chay"
        elif "PS" in name_without_ext:
            category_name = "Phục Sinh"
        
        # Step 1: Upload PDF
        await refresh_token()
        pdf_url = await upload_file(client, file_path, base_name)
        
        # Step 2: Create or get author
        await refresh_token()
        headers = get_auth_headers(content_type="application/json", prefer="return=representation")
        
        # Check if author exists
        url = f"{SUPABASE_URL}/rest/v1/authors?name=eq.{author_name}"
        response = await client.get(url, headers=headers)
        
        if response.status_code == 200 and len(response.json()) > 0:
            author_id = response.json()[0]['id']
        else:
            # Create new author
            now = datetime.datetime.now().isoformat()
            data = {
                'name': author_name, 
                'biography': f'Author of hymns',
                'created_at': now
            }
            
            url = f"{SUPABASE_URL}/rest/v1/authors"
            response = await client.post(url, headers=headers, json=data)
            
            if response.status_code != 201:
                raise Exception(f"Failed to create author: {response.status_code}")
            
            author_id = response.json()[0]['id']
        
        # Step 3: Create or get hymn
        await refresh_token()
        
        # Check if hymn exists
        url = f"{SUPABASE_URL}/rest/v1/hymns?title=eq.{hymn_title}"
        response = await client.get(url, headers=headers)
        
        if response.status_code == 200 and len(response.json()) > 0:
            hymn_id = response.json()[0]['id']
        else:
            # Create new hymn
            now = datetime.datetime.now().isoformat()
            data = {
                'title': hymn_title,
                'lyrics': f'Lyrics for {hymn_title}',
                'created_at': now,
                'updated_at': now
            }
            
            url = f"{SUPABASE_URL}/rest/v1/hymns"
            response = await client.post(url, headers=headers, json=data)
            
            if response.status_code != 201:
                raise Exception(f"Failed to create hymn: {response.status_code}")
            
            hymn_id = response.json()[0]['id']
        
        # Step 4: Link hymn and author
        await refresh_token()
        
        # Check if link exists
        url = f"{SUPABASE_URL}/rest/v1/hymn_authors?hymn_id=eq.{hymn_id}&author_id=eq.{author_id}"
        response = await client.get(url, headers=headers)
        
        if not (response.status_code == 200 and len(response.json()) > 0):
            # Create link
            data = {
                'hymn_id': hymn_id,
                'author_id': author_id
            }
            
            url = f"{SUPABASE_URL}/rest/v1/hymn_authors"
            response = await client.post(url, headers=headers, json=data)
            
            if response.status_code != 201:
                raise Exception(f"Failed to create hymn-author link: {response.status_code}")
        
        # Step 5: Create or update PDF file record
        await refresh_token()
        
        # Check if pdf record exists
        url = f"{SUPABASE_URL}/rest/v1/pdf_files?hymn_id=eq.{hymn_id}"
        response = await client.get(url, headers=headers)
        
        now = datetime.datetime.now().isoformat()
        
        if response.status_code == 200 and len(response.json()) > 0:
            # Update existing
            existing = response.json()[0]
            current_version = existing.get('version', 0) or 0
            
            update_data = {
                'file_url': pdf_url,
                'updated_at': now,
                'version': current_version + 1
            }
            
            update_url = f"{SUPABASE_URL}/rest/v1/pdf_files?id=eq.{existing['id']}"
            await client.patch(update_url, headers=headers, json=update_data)
        else:
            # Create new
            data = {
                'hymn_id': hymn_id,
                'file_url': pdf_url,
                'created_at': now,
                'updated_at': now,
                'version': 1
            }
            
            url = f"{SUPABASE_URL}/rest/v1/pdf_files"
            response = await client.post(url, headers=headers, json=data)
            
            if response.status_code != 201:
                raise Exception(f"Failed to create PDF record: {response.status_code}")
        
        # Step 6: Handle category
        try:
            await refresh_token()
            
            # Check if category exists
            url = f"{SUPABASE_URL}/rest/v1/categories?name=eq.{category_name}"
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200 and len(response.json()) > 0:
                category_id = response.json()[0]['id']
            else:
                # Create category
                data = {
                    'name': category_name,
                    'description': f'Category for {category_name}',
                    'created_at': now
                }
                
                url = f"{SUPABASE_URL}/rest/v1/categories"
                response = await client.post(url, headers=headers, json=data)
                
                if response.status_code != 201:
                    raise Exception(f"Failed to create category: {response.status_code}")
                
                category_id = response.json()[0]['id']
            
            # Link hymn to category
            url = f"{SUPABASE_URL}/rest/v1/hymn_categories?hymn_id=eq.{hymn_id}&category_id=eq.{category_id}"
            response = await client.get(url, headers=headers)
            
            if not (response.status_code == 200 and len(response.json()) > 0):
                data = {
                    'hymn_id': hymn_id,
                    'category_id': category_id
                }
                
                url = f"{SUPABASE_URL}/rest/v1/hymn_categories"
                response = await client.post(url, headers=headers, json=data)
        except Exception as e:
            print(f"Warning: Category processing failed: {str(e)}")
        
        print(f"✓ Successfully processed: {base_name}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {os.path.basename(file_path)}: {str(e)}")
        return False

async def retry_processing_files(files_to_process, processed_files, success_count):
    """Process a list of files with retry logic"""
    if not files_to_process:
        print("No files to process")
        return
    
    print(f"\nProcessing {len(files_to_process)} files...")
    batch_size = 5
    new_success_count = 0
    
    async with httpx.AsyncClient() as client:
        await refresh_token()
        
        # Process in batches
        for i in range(0, len(files_to_process), batch_size):
            batch = files_to_process[i:i + batch_size]
            print(f"\nBatch {i//batch_size + 1}/{(len(files_to_process)-1)//batch_size + 1}")
            
            for file_path in batch:
                # Try processing with retries
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        success = await process_pdf(client, file_path)
                        if success:
                            new_success_count += 1
                            
                            # Add to processed files if not already there
                            if file_path not in processed_files:
                                processed_files.append(file_path)
                                
                            break
                        else:
                            if attempt < max_retries - 1:
                                print(f"  Retrying {os.path.basename(file_path)} (attempt {attempt+2}/{max_retries})")
                                await asyncio.sleep(RETRY_DELAY)
                                await refresh_token()
                    except Exception as e:
                        if attempt < max_retries - 1:
                            print(f"  Error on attempt {attempt+1}: {str(e)}, retrying...")
                            await asyncio.sleep(RETRY_DELAY)
                            await refresh_token()
                        else:
                            print(f"  Failed after {max_retries} attempts: {str(e)}")
                
                # Update progress after each file
                update_progress(processed_files, success_count + new_success_count)
            
            # Delay between batches
            if i + batch_size < len(files_to_process):
                await asyncio.sleep(2)
    
    print(f"\nProcessing complete")
    print(f"- Successfully processed: {new_success_count}/{len(files_to_process)}")
    print(f"- Total success count: {success_count + new_success_count}")

async def main():
    if len(sys.argv) > 1:
        pdf_dir = sys.argv[1]
    else:
        pdf_dir = r'C:\thanhcapdf\1project-bolt-sb1-73r37zzh\project\scripts\temp_pdf'
    
    print(f"Using PDF directory: {pdf_dir}")
    
    # Analyze progress file
    processed_files, success_count = analyze_progress_file()
    
    # Identify files that need processing
    unprocessed_files, potential_error_files = await identify_error_files(pdf_dir, processed_files)
    
    # Combine lists
    files_to_process = unprocessed_files + potential_error_files
    
    if not files_to_process:
        print("No files need processing")
        return
    
    print(f"\nFound {len(files_to_process)} files to process")
    choice = input("Do you want to process these files? (y/n): ")
    
    if choice.lower() != 'y':
        print("Operation cancelled")
        return
    
    # Process files
    await retry_processing_files(files_to_process, processed_files, success_count)

if __name__ == "__main__":
    asyncio.run(main())