import os
import sys
import httpx
import asyncio
from pathlib import Path

# Supabase configuration
SUPABASE_URL = "https://fwoxlggleieoztmcvsju.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI"

# Constants
BUCKET_NAME = "hymn"  # Bucket chính
PDF_PREFIX = "pdf/"   # Tiền tố để mô phỏng thư mục 'pdf'

async def create_bucket(client, bucket_name):
    """Attempt to create a bucket if it does not exist"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    data = {'name': bucket_name, 'public': True}
    
    response = await client.post(url, headers=headers, json=data)
    if response.status_code == 201:
        print(f"Successfully created bucket '{bucket_name}'.")
        return True
    else:
        print(f"Failed to create bucket '{bucket_name}'. Status: {response.status_code}, Message: {response.text}")
        return False

async def check_bucket_exists(client, bucket_name):
    """Check if bucket exists and create it if it doesn't"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    
    url = f"{SUPABASE_URL}/storage/v1/bucket/{bucket_name}"
    response = await client.head(url, headers=headers)
    if response.status_code == 200:
        print(f"Bucket '{bucket_name}' exists.")
        return True
    else:
        print(f"Bucket '{bucket_name}' does not exist. Attempting to create...")
        if await create_bucket(client, bucket_name):
            return True
        else:
            print(f"Please create bucket '{bucket_name}' manually in Supabase Dashboard at {SUPABASE_URL} and configure it as public with 'anon' role permissions (SELECT, INSERT).")
            return False

async def check_file_exists(client, bucket_name, file_name):
    """Check if file exists in Supabase Storage"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    
    storage_path = f"{PDF_PREFIX}{file_name}"
    url = f"{SUPABASE_URL}/storage/v1/object/info/public/{bucket_name}/{storage_path}"
    response = await client.head(url, headers=headers)
    return response.status_code == 200

async def upload_file(client, file_path, bucket_name, file_name):
    """Upload a file to Supabase Storage"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }

    storage_path = f"{PDF_PREFIX}{file_name}"

    # Check if file already exists
    if await check_file_exists(client, bucket_name, file_name):
        print(f"File {file_name} already exists, skipping upload.")
        return f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{storage_path}"

    with open(file_path, 'rb') as f:
        files = {'file': (file_name, f, 'application/pdf')}
        url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{storage_path}"
        
        response = await client.post(url, headers=headers, files=files)
        if response.status_code not in [200, 201]:
            raise Exception(f"Error uploading file: {response.status_code} - {response.text}")
        
        # Get public URL
        return f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{storage_path}"

async def create_or_get_author(client, name):
    """Create or get an author in the database"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/authors?name=eq.{name}"
    response = await client.get(url, headers=headers)
    
    if response.status_code == 200 and len(response.json()) > 0:
        return response.json()[0]['id']
    
    data = {'name': name, 'biography': f'Author of hymns'}
    url = f"{SUPABASE_URL}/rest/v1/authors"
    response = await client.post(url, headers=headers, json=data)
    
    if response.status_code != 201:
        raise Exception(f"Error creating author: {response.status_code} - {response.text}")
    
    return response.json()[0]['id']

async def create_or_get_hymn(client, title, author_id, pdf_url):
    """Create or get a hymn in the database"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/hymns?title=eq.{title}"
    response = await client.get(url, headers=headers)
    
    if response.status_code == 200 and len(response.json()) > 0:
        return response.json()[0]['id']

    data = {
        'title': title,
        'author_id': author_id,
        'lyrics': f'Lyrics for {title}',
        'pdf_url': pdf_url
    }
    
    url = f"{SUPABASE_URL}/rest/v1/hymns"
    response = await client.post(url, headers=headers, json=data)
    
    if response.status_code != 201:
        raise Exception(f"Error creating hymn: {response.status_code} - {response.text}")
    
    return response.json()[0]['id']

async def process_pdf(client, file_path):
    """Process a single PDF file"""
    try:
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        parts = name_without_ext.split('_')
        
        author_name = parts[-1].strip().title()
        title_parts = parts[:-1]
        hymn_title = ' '.join(title_parts).strip().title() if title_parts else name_without_ext
        
        author_id = await create_or_get_author(client, author_name)
        file_name = base_name  # Giữ nguyên tên file gốc
        pdf_url = await upload_file(client, file_path, BUCKET_NAME, file_name)
        await create_or_get_hymn(client, hymn_title, author_id, pdf_url)
        
        print(f"Successfully processed: {base_name}")
        return True
        
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

async def main():
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else 'C:/thanhcapdf/project/scripts/temp_pdf'
    
    pdf_files = list(Path(pdf_dir).glob('*.pdf'))
    total_files = len(pdf_files)
    
    print(f"Found {total_files} PDF files to process")
    
    batch_size = 5
    success_count = 0
    
    async with httpx.AsyncClient() as client:
        # Check and create bucket if it doesn't exist
        if not await check_bucket_exists(client, BUCKET_NAME):
            raise Exception("Bucket creation failed or manual creation required. Please check the logs.")

        for i in range(0, total_files, batch_size):
            batch = pdf_files[i:i + batch_size]
            tasks = [process_pdf(client, str(pdf)) for pdf in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count += sum(1 for r in results if r is True)
            
            print(f"Processed {i + len(batch)}/{total_files} files. Success: {success_count}")
            
            await asyncio.sleep(1)
    
    print(f"\nImport completed. Successfully processed {success_count}/{total_files} files")

if __name__ == "__main__":
    asyncio.run(main())