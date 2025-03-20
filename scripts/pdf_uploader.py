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
PROGRESS_FILE = "upload_progress.json"  # File to save progress
ERROR_LOG_FILE = "error_files.json"  # File to save error list
RETRY_DELAY = 30  # Delay between retries (seconds)

# Initialize client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Global variables for token management
ACCESS_TOKEN = None
TOKEN_REFRESH_INTERVAL = 1800  # Refresh token after 30 minutes
LAST_TOKEN_REFRESH = None

async def refresh_token():
    """Refresh token if needed"""
    global ACCESS_TOKEN, LAST_TOKEN_REFRESH
    
    current_time = time.time()
    
    # If no token or it's time to refresh
    if ACCESS_TOKEN is None or LAST_TOKEN_REFRESH is None or (current_time - LAST_TOKEN_REFRESH > TOKEN_REFRESH_INTERVAL):
        try:
            print("Refreshing authentication token...")
            await sign_in()
            LAST_TOKEN_REFRESH = current_time
            print("Token refreshed successfully.")
        except Exception as e:
            print(f"Error refreshing token: {str(e)}. Trying manual sign in...")
            ACCESS_TOKEN = await manual_sign_in()
            LAST_TOKEN_REFRESH = current_time
            print("Token refreshed successfully using manual method.")

async def sign_in() -> None:
    """Sign in to Supabase with email and password"""
    global ACCESS_TOKEN
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: supabase.auth.sign_in_with_password({
                "email": "admin@example.com",
                "password": "admin123456"
            })
        )
        if not response.user:
            raise Exception("Login failed: No user returned")
        
        # Save token to global variable
        ACCESS_TOKEN = response.session.access_token
    except Exception as e:
        raise Exception(f"Login failed: {str(e)}")

async def manual_sign_in() -> str:
    """Manual sign in to get token"""
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
            raise Exception(f"Login failed: {response.status_code} - {response.text}")
        
        token = response.json()["access_token"]
        return token

def get_auth_headers(content_type=None, prefer=None):
    """Helper function to create authentication headers"""
    global ACCESS_TOKEN
    
    headers = {
        "apikey": SUPABASE_ANON_KEY
    }
    
    # Add Authorization if ACCESS_TOKEN exists
    if ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {ACCESS_TOKEN}"
    
    if content_type:
        headers["Content-Type"] = content_type
    if prefer:
        headers["Prefer"] = prefer
    return headers

async def check_bucket_exists(client: httpx.AsyncClient, bucket_name: str) -> bool:
    """Check if bucket exists"""
    await refresh_token()
    headers = get_auth_headers()

    url = f"{SUPABASE_URL}/storage/v1/bucket/{bucket_name}"
    response = await client.head(url, headers=headers)
    return response.status_code == 200

async def check_file_exists(client: httpx.AsyncClient, bucket_name: str, file_name: str) -> bool:
    """Check if file exists in Supabase Storage"""
    await refresh_token()
    headers = get_auth_headers()

    storage_path = f"{PDF_PREFIX}{file_name}"
    url = f"{SUPABASE_URL}/storage/v1/object/info/public/{bucket_name}/{storage_path}"
    response = await client.head(url, headers=headers)
    return response.status_code == 200

async def upload_file(client: httpx.AsyncClient, file_path: str, bucket_name: str, file_name: str) -> str:
    """Upload a file to Supabase Storage with retries"""
    await refresh_token()
    headers = get_auth_headers()

    storage_path = f"{PDF_PREFIX}{file_name}"
    
    # Check if file already exists
    if await check_file_exists(client, bucket_name, file_name):
        print(f"✓ File already exists: {file_name}")
        return f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{storage_path}"

    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (file_name, f, 'application/pdf')}
                url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{storage_path}"

                response = await client.post(url, headers=headers, files=files)
                if response.status_code not in [200, 201]:
                    print(f"  Attempt {retry_count + 1} failed: {response.status_code}")
                    retry_count += 1
                    if retry_count < max_retries:
                        await asyncio.sleep(RETRY_DELAY)
                        await refresh_token()  # Refresh token before retrying
                    continue
                else:
                    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{storage_path}"
        
        except Exception as e:
            print(f"  Upload attempt {retry_count + 1} failed: {str(e)}")
            retry_count += 1
            if retry_count < max_retries:
                await asyncio.sleep(RETRY_DELAY)
                await refresh_token()
            else:
                raise Exception(f"Failed to upload after {max_retries} attempts: {str(e)}")

    raise Exception(f"Failed to upload after {max_retries} attempts")

async def create_or_get_author(client: httpx.AsyncClient, name: str) -> str:
    """Create or get an author in the database with retries"""
    await refresh_token()
    headers = get_auth_headers(content_type="application/json", prefer="return=representation")

    # Check if author already exists
    url = f"{SUPABASE_URL}/rest/v1/authors?name=eq.{name}"
    response = await client.get(url, headers=headers)

    if response.status_code == 200 and len(response.json()) > 0:
        return response.json()[0]['id']

    # Create new author
    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        try:
            now = datetime.datetime.now().isoformat()
            data = {
                'name': name, 
                'biography': f'Author of hymns',
                'created_at': now
            }
            
            url = f"{SUPABASE_URL}/rest/v1/authors"
            response = await client.post(url, headers=headers, json=data)

            if response.status_code != 201:
                retry_count += 1
                if retry_count < max_retries:
                    await asyncio.sleep(RETRY_DELAY)
                    await refresh_token()
                    continue
                else:
                    raise Exception(f"Error creating author: {response.status_code} - {response.text}")
            else:
                return response.json()[0]['id']
        except Exception as e:
            retry_count += 1
            if retry_count < max_retries:
                await asyncio.sleep(RETRY_DELAY)
                await refresh_token()
            else:
                raise Exception(f"Failed to create author after {max_retries} attempts: {str(e)}")

async def get_hymn_from_title_and_author(client: httpx.AsyncClient, title: str, author_name: str) -> str:
    """Check if hymn already exists with title and author combination"""
    await refresh_token()
    headers = get_auth_headers(content_type="application/json")

    # Find author by name
    url_author = f"{SUPABASE_URL}/rest/v1/authors?name=eq.{author_name}"
    author_response = await client.get(url_author, headers=headers)
    
    if author_response.status_code != 200 or len(author_response.json()) == 0:
        return None
    
    author_id = author_response.json()[0]['id']
    
    # Find hymn by title
    url_hymn = f"{SUPABASE_URL}/rest/v1/hymns?title=eq.{title}"
    hymn_response = await client.get(url_hymn, headers=headers)
    
    if hymn_response.status_code != 200 or len(hymn_response.json()) == 0:
        return None
    
    # Find all hymns with this title
    for hymn in hymn_response.json():
        hymn_id = hymn['id']
        
        # Check if linked with this author
        url_link = f"{SUPABASE_URL}/rest/v1/hymn_authors?hymn_id=eq.{hymn_id}&author_id=eq.{author_id}"
        link_response = await client.get(url_link, headers=headers)
        
        if link_response.status_code == 200 and len(link_response.json()) > 0:
            return hymn_id
    
    return None

async def process_pdf_with_retries(client: httpx.AsyncClient, file_path: str) -> bool:
    """Process a PDF file with multiple retries and careful error handling"""
    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        try:
            return await process_pdf(client, file_path)
        except Exception as e:
            retry_count += 1
            print(f"  Retry {retry_count}/{max_retries} for file {os.path.basename(file_path)}: {str(e)}")
            
            if retry_count < max_retries:
                # Increase wait time between retries
                await asyncio.sleep(RETRY_DELAY * retry_count)
                await refresh_token()
            else:
                print(f"  Failed after {max_retries} attempts: {os.path.basename(file_path)}")
                # Log error file for later processing
                log_error_file(file_path, str(e))
                return False

async def process_pdf(client: httpx.AsyncClient, file_path: str) -> bool:
    """Process a single PDF file"""
    await refresh_token()
    
    try:
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        parts = name_without_ext.split('_')

        # Extract author and title from filename
        author_name = parts[-1].strip().title() if len(parts) > 1 else "Unknown"
        title_parts = parts[:-1] if len(parts) > 1 else parts
        hymn_title = ' '.join(title_parts).strip().title()

        # Find existing hymn with this title and author
        existing_hymn_id = await get_hymn_from_title_and_author(client, hymn_title, author_name)
        
        # If hymn and author already exist, check if PDF is already linked
        if existing_hymn_id:
            pdf_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{PDF_PREFIX}{base_name}"
            pdf_files_url = f"{SUPABASE_URL}/rest/v1/pdf_files?hymn_id=eq.{existing_hymn_id}"
            headers = get_auth_headers()
            pdf_response = await client.get(pdf_files_url, headers=headers)
            
            if pdf_response.status_code == 200 and len(pdf_response.json()) > 0:
                print(f"✓ Already processed: {base_name}")
                return True
        
        # Extract category from filename
        category_name = "Uncategorized"  # Default
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
        
        # Upload PDF to Supabase Storage
        pdf_url = await upload_file(client, file_path, BUCKET_NAME, base_name)
        
        # 1. Create or get author
        author_id = await create_or_get_author(client, author_name)
        
        # 2. Create or get hymn
        if existing_hymn_id:
            hymn_id = existing_hymn_id
        else:
            await refresh_token()
            headers = get_auth_headers(content_type="application/json", prefer="return=representation")
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
                raise Exception(f"Error creating hymn: {response.status_code} - {response.text}")

            hymn_id = response.json()[0]['id']
        
        # 3. Create link between hymn and author
        await refresh_token()
        headers = get_auth_headers(content_type="application/json", prefer="return=representation")
        link_url = f"{SUPABASE_URL}/rest/v1/hymn_authors?hymn_id=eq.{hymn_id}&author_id=eq.{author_id}"
        link_response = await client.get(link_url, headers=headers)
        
        if not (link_response.status_code == 200 and len(link_response.json()) > 0):
            link_data = {
                'hymn_id': hymn_id,
                'author_id': author_id
            }
            url = f"{SUPABASE_URL}/rest/v1/hymn_authors"
            await client.post(url, headers=headers, json=link_data)
        
        # 4. Create or update PDF record
        await refresh_token()
        headers = get_auth_headers(content_type="application/json", prefer="return=representation")
        pdf_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{PDF_PREFIX}{base_name}"
        
        pdf_check_url = f"{SUPABASE_URL}/rest/v1/pdf_files?hymn_id=eq.{hymn_id}"
        pdf_check_response = await client.get(pdf_check_url, headers=headers)
        
        now = datetime.datetime.now().isoformat()
        if pdf_check_response.status_code == 200 and len(pdf_check_response.json()) > 0:
            # Update existing record
            existing = pdf_check_response.json()[0]
            current_version = existing.get('version', 0) or 0
            
            update_data = {
                'file_url': pdf_url,
                'updated_at': now,
                'version': current_version + 1
            }
            
            update_url = f"{SUPABASE_URL}/rest/v1/pdf_files?id=eq.{existing['id']}"
            await client.patch(update_url, headers=headers, json=update_data)
        else:
            # Create new record
            pdf_data = {
                'hymn_id': hymn_id,
                'file_url': pdf_url,
                'created_at': now,
                'updated_at': now,
                'version': 1
            }
            
            pdf_url = f"{SUPABASE_URL}/rest/v1/pdf_files"
            await client.post(pdf_url, headers=headers, json=pdf_data)
        
        # 5. Create or get category and link with hymn
        try:
            await refresh_token()
            headers = get_auth_headers(content_type="application/json", prefer="return=representation")
            
            # Find category
            cat_url = f"{SUPABASE_URL}/rest/v1/categories?name=eq.{category_name}"
            cat_response = await client.get(cat_url, headers=headers)
            
            category_id = None
            if cat_response.status_code == 200 and len(cat_response.json()) > 0:
                category_id = cat_response.json()[0]['id']
            else:
                # Create new category
                cat_data = {
                    'name': category_name,
                    'description': f'Category for {category_name}',
                    'created_at': now
                }
                
                cat_create_url = f"{SUPABASE_URL}/rest/v1/categories"
                cat_create_response = await client.post(cat_create_url, headers=headers, json=cat_data)
                if cat_create_response.status_code == 201:
                    category_id = cat_create_response.json()[0]['id']
            
            if category_id:
                # Check existing link
                cat_link_url = f"{SUPABASE_URL}/rest/v1/hymn_categories?hymn_id=eq.{hymn_id}&category_id=eq.{category_id}"
                cat_link_response = await client.get(cat_link_url, headers=headers)
                
                if not (cat_link_response.status_code == 200 and len(cat_link_response.json()) > 0):
                    # Create new link
                    cat_link_data = {
                        'hymn_id': hymn_id,
                        'category_id': category_id
                    }
                    
                    cat_link_create_url = f"{SUPABASE_URL}/rest/v1/hymn_categories"
                    await client.post(cat_link_create_url, headers=headers, json=cat_link_data)
        except Exception as e:
            print(f"  Warning: Could not process categories: {str(e)}")

        print(f"✓ Processed: {base_name}")
        return True

    except Exception as e:
        print(f"✗ Error processing {os.path.basename(file_path)}: {str(e)}")
        raise e

def get_error_files():
    """Get list of error files"""
    try:
        if os.path.exists(ERROR_LOG_FILE):
            with open(ERROR_LOG_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def log_error_file(file_path, error_message):
    """Log error file for later processing"""
    error_files = get_error_files()
    error_files[file_path] = {
        'error': error_message,
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    with open(ERROR_LOG_FILE, 'w') as f:
        json.dump(error_files, f, indent=2)

def get_processed_files():
    """Get list of successfully processed files"""
    try:
        if os.path.exists(PROGRESS_FILE):
            with open(PROGRESS_FILE, 'r') as f:
                data = json.load(f)
                return set(data.get('processed_files', []))
    except Exception:
        pass
    return set()

def save_progress(processed_files, success_count):
    """Save current progress to file"""
    data = {
        'processed_files': list(processed_files),
        'success_count': success_count,
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

async def process_failed_files():
    """Retry processing failed files"""
    error_files = get_error_files()
    processed_files = get_processed_files()
    
    if not error_files:
        print("No error files found to process.")
        return
    
    total = len(error_files)
    print(f"Found {total} error files to retry.")
    
    success_count = 0
    newly_processed = set()
    
    async with httpx.AsyncClient() as client:
        # Login
        await sign_in()
        
        # Check bucket
        if not await check_bucket_exists(client, BUCKET_NAME):
            print("Bucket does not exist. Please create it first.")
            return
        
        for i, (file_path, error_info) in enumerate(list(error_files.items())):
            if file_path in processed_files:
                print(f"Already processed: {os.path.basename(file_path)}")
                continue
                
            print(f"Processing {i+1}/{total}: {os.path.basename(file_path)}")
            try:
                success = await process_pdf_with_retries(client, file_path)
                if success:
                    success_count += 1
                    newly_processed.add(file_path)
                    
                    # Remove from error list
                    error_files.pop(file_path, None)
                    
                    # Update error file
                    with open(ERROR_LOG_FILE, 'w') as f:
                        json.dump(error_files, f, indent=2)
                
            except Exception as e:
                print(f"Failed to process {os.path.basename(file_path)}: {str(e)}")
            
            # Update progress
            all_processed = processed_files.union(newly_processed)
            save_progress(all_processed, len(all_processed))
            
            # Wait between files to reduce server load
            await asyncio.sleep(2)
    
    print(f"\nRetry completed. Successfully processed {success_count}/{total} files")

async def process_remaining_files(pdf_dir):
    """Process remaining PDF files that haven't been processed yet"""
    # Get all PDF files
    pdf_files = [str(p) for p in Path(pdf_dir).glob('*.pdf')]
    
    # Get list of processed files
    processed_files = get_processed_files()
    
    # Identify unprocessed files
    remaining_files = [f for f in pdf_files if f not in processed_files]
    
    if not remaining_files:
        print("No remaining files to process.")
        return
    
    total = len(remaining_files)
    print(f"Found {total} remaining files to process.")
    
    batch_size = 5
    success_count = len(processed_files)
    newly_processed = set()
    
    async with httpx.AsyncClient() as client:
        # Login
        await sign_in()
        
        # Check bucket
        if not await check_bucket_exists(client, BUCKET_NAME):
            print("Bucket does not exist. Please create it first.")
            return
        
        for i in range(0, total, batch_size):
            batch = remaining_files[i:i + batch_size]
            print(f"Processing batch {i//batch_size + 1}/{(total-1)//batch_size + 1} ({i+1}-{min(i+batch_size, total)}/{total})")
            
            for file_path in batch:
                try:
                    success = await process_pdf_with_retries(client, file_path)
                    if success:
                        success_count += 1
                        newly_processed.add(file_path)
                except Exception as e:
                    print(f"Failed to process {os.path.basename(file_path)}: {str(e)}")
            
            # Update progress
            all_processed = processed_files.union(newly_processed)
            save_progress(all_processed, success_count)
            
            print(f"Progress: {success_count}/{len(pdf_files)} files processed successfully.")
            
            # Wait between batches
            if i + batch_size < total:
                await asyncio.sleep(2)
    
    print(f"\nProcessing completed. Total success: {success_count}/{len(pdf_files)} files")

async def main():
    # Parse command line arguments
    if len(sys.argv) > 1:
        # Check for --retry flag
        if sys.argv[1] == '--retry':
            print("Starting retry process for failed files...")
            await process_failed_files()
            return
        # Check for --help flag
        elif sys.argv[1] in ['--help', '-h']:
            print("Usage:")
            print("  python uploader.py [PDF_DIRECTORY]  - Process PDF files in the specified directory")
            print("  python uploader.py --retry          - Retry processing failed files")
            print("  python uploader.py --help           - Show this help message")
            return
        else:
            # First argument is the PDF directory
            pdf_dir = sys.argv[1]
    else:
        # Default directory
        pdf_dir = r'./pdf_files'
        # Check if directory exists
        if not os.path.exists(pdf_dir):
            os.makedirs(pdf_dir)
            print(f"Created default directory: {pdf_dir}")
            print("Please place PDF files in this directory and run the script again.")
            return
    
    # Process remaining files
    print(f"Processing PDF files from: {pdf_dir}")
    await process_remaining_files(pdf_dir)

if __name__ == "__main__":
    asyncio.run(main())