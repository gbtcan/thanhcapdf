# Cách sử dụng script đã sửa
# Lưu script này vào một file mới tên là fix_error_files.py

# Chạy script:

# Điểm chính của script đã sửa
# Phát hiện file lỗi chính xác hơn:

# Kiểm tra cả trong storage và database
# Tìm các file đã xử lý nhưng chưa hoàn tất
# Xử lý thông minh:

# Chỉ xử lý lại một số lượng giới hạn các file có khả năng bị lỗi
# Lưu kết quả kiểm tra để không phải phân tích lại
# Tránh làm quá tải API:

# Kiểm tra theo batch
# Giới hạn số lượng file cần kiểm tra
# Việc phát hiện và xử lý 5,572 file lỗi có thể mất thời gian, nhưng script đã được cải thiện để làm việc này hiệu quả hơn. Bạn có thể chạy script này và nó sẽ dần dần xử lý các file lỗi.

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
ERROR_DETECTION_FILE = "error_detection.json"
RETRY_DELAY = 5  # seconds between retries
BATCH_SIZE = 5

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
        print("Progress file not found!")
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

async def check_file_exists_in_storage(client, file_name):
    """Check if file exists in Supabase storage"""
    await refresh_token()
    headers = get_auth_headers()
    
    storage_path = f"{PDF_PREFIX}{file_name}"
    url = f"{SUPABASE_URL}/storage/v1/object/info/public/{BUCKET_NAME}/{storage_path}"
    
    response = await client.head(url, headers=headers)
    return response.status_code == 200

async def check_hymn_in_database(client, hymn_title):
    """Check if hymn exists in database"""
    await refresh_token()
    headers = get_auth_headers()
    
    url = f"{SUPABASE_URL}/rest/v1/hymns?title=eq.{hymn_title}"
    response = await client.get(url, headers=headers)
    
    if response.status_code == 200 and len(response.json()) > 0:
        return True, response.json()[0]['id']
    return False, None

async def check_pdf_record_exists(client, hymn_id):
    """Check if PDF record exists for hymn"""
    await refresh_token()
    headers = get_auth_headers()
    
    url = f"{SUPABASE_URL}/rest/v1/pdf_files?hymn_id=eq.{hymn_id}"
    response = await client.get(url, headers=headers)
    
    return response.status_code == 200 and len(response.json()) > 0

async def find_error_files(pdf_dir, processed_files, success_count):
    """Identify files that are in processed list but failed to upload properly"""
    # Giới hạn số file kiểm tra để tránh quá tải API
    print("\nIdentifying error files...")
    print("This may take some time for large datasets...")

    # Kiểm tra xem đã có kết quả phân tích trước đó chưa
    if os.path.exists(ERROR_DETECTION_FILE):
        with open(ERROR_DETECTION_FILE, 'r') as f:
            detection_data = json.load(f)
            
        if detection_data.get('timestamp'):
            timestamp = datetime.datetime.fromisoformat(detection_data['timestamp'])
            now = datetime.datetime.now()
            # Nếu phân tích chưa quá 24 giờ, sử dụng kết quả cũ
            if (now - timestamp).total_seconds() < 86400:  # 24 hours
                print(f"Using cached error detection results from {timestamp}")
                return detection_data.get('error_files', [])
    
    error_files = []
    check_count = min(300, len(processed_files) - success_count)  # Giới hạn số lượng kiểm tra
    
    if check_count <= 0:
        print("No error files to check")
        return []
    
    print(f"Checking {check_count} potential error files...")
    
    # Lấy danh sách từ cuối lên để kiểm tra các file mới nhất trước
    files_to_check = processed_files[-check_count:]
    
    async with httpx.AsyncClient() as client:
        await refresh_token()
        
        # Kiểm tra file theo batch để tăng tốc
        batch_size = 10
        for i in range(0, len(files_to_check), batch_size):
            batch = files_to_check[i:i+batch_size]
            batch_results = await asyncio.gather(*[check_file_status(client, file_path) for file_path in batch])
            
            for j, result in enumerate(batch_results):
                file_path = batch[j]
                if not result:
                    error_files.append(file_path)
            
            # In tiến độ
            print(f"Checked {min(i+batch_size, len(files_to_check))}/{len(files_to_check)} files, found {len(error_files)} errors")
            await asyncio.sleep(1)  # Tránh quá tải API
    
    # Lưu kết quả phân tích để sử dụng sau
    with open(ERROR_DETECTION_FILE, 'w') as f:
        json.dump({
            'timestamp': datetime.datetime.now().isoformat(),
            'error_files': error_files
        }, f)
    
    print(f"Found {len(error_files)} files with errors")
    return error_files

async def check_file_status(client, file_path):
    """Check if a file was successfully processed"""
    try:
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        parts = name_without_ext.split('_')
        
        # Extract title and author
        title_parts = parts[:-1] if len(parts) > 1 else parts
        hymn_title = ' '.join(title_parts).strip().title()
        
        # Check 1: Does file exist in storage?
        storage_exists = await check_file_exists_in_storage(client, base_name)
        if not storage_exists:
            return False
        
        # Check 2: Does hymn exist in database?
        hymn_exists, hymn_id = await check_hymn_in_database(client, hymn_title)
        if not hymn_exists:
            return False
        
        # Check 3: Does PDF record exist?
        pdf_exists = await check_pdf_record_exists(client, hymn_id)
        return pdf_exists
    except Exception as e:
        print(f"Error checking file status: {str(e)}")
        return False

async def upload_file(client, file_path, file_name):
    """Upload file to storage with retry logic"""
    await refresh_token()
    headers = get_auth_headers()
    
    storage_path = f"{PDF_PREFIX}{file_name}"
    
    # Check if already exists
    if await check_file_exists_in_storage(client, file_name):
        print(f"  File already exists in storage: {file_name}")
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
    
    # Upload with retries
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (file_name, f, 'application/pdf')}
                url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
                
                response = await client.post(url, headers=headers, files=files)
                if response.status_code not in [200, 201]:
                    if attempt < max_retries - 1:
                        print(f"  Upload attempt {attempt+1} failed: {response.status_code}")
                        await asyncio.sleep(RETRY_DELAY)
                        await refresh_token()
                    else:
                        raise Exception(f"Upload failed: {response.status_code} - {response.text}")
                else:
                    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"  Upload attempt {attempt+1} failed: {str(e)}")
                await asyncio.sleep(RETRY_DELAY)
                await refresh_token()
            else:
                raise Exception(f"Failed to upload after {max_retries} attempts: {str(e)}")
    
    raise Exception("Upload failed after all retry attempts")

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

async def process_files_batch(files_to_process, processed_files, success_count):
    """Process files in batches with retry logic"""
    if not files_to_process:
        return 0
    
    new_success_count = 0
    batch_size = BATCH_SIZE
    
    async with httpx.AsyncClient() as client:
        await refresh_token()
        
        # Process in batches
        for i in range(0, len(files_to_process), batch_size):
            batch = files_to_process[i:i + batch_size]
            print(f"\nBatch {i//batch_size + 1}/{(len(files_to_process)-1)//batch_size + 1}")
            
            for file_path in batch:
                # Reprocess with retries
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        success = await process_pdf(client, file_path)
                        if success:
                            new_success_count += 1
                            break
                        elif attempt < max_retries - 1:
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
            
            # Update progress after each batch
            update_progress(processed_files, success_count + new_success_count)
            
            # Delay between batches
            if i + batch_size < len(files_to_process):
                await asyncio.sleep(2)
    
    return new_success_count

async def manual_fix():
    """Fix error files by directly checking database status"""
    # Load progress data
    processed_files, success_count = analyze_progress_file()
    
    # Find error files
    error_files = await find_error_files("temp_pdf", processed_files, success_count)
    
    if not error_files:
        print("No error files found")
        return
    
    print(f"Found {len(error_files)} error files")
    print("Sample files:")
    for i in range(min(5, len(error_files))):
        print(f"  - {os.path.basename(error_files[i])}")
    
    choice = input("\nDo you want to process these error files? (y/n): ")
    if choice.lower() != 'y':
        return
    
    # Process error files in batches
    new_success_count = await process_files_batch(error_files, processed_files, success_count)
    
    print(f"\nFixed {new_success_count}/{len(error_files)} error files")
    print(f"Total success count: {success_count + new_success_count}/{len(processed_files)}")

async def main():
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else "temp_pdf"
    print(f"Using PDF directory: {pdf_dir}")
    
    await manual_fix()

if __name__ == "__main__":
    asyncio.run(main())