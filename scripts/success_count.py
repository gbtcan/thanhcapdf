import asyncio
import httpx
import json

async def count_database_records():
    """Count records in database tables"""
    url = "https://fwoxlggleieoztmcvsju.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI"
    
    # Login
    login_url = f"{url}/auth/v1/token?grant_type=password"
    login_headers = {
        "apikey": anon_key,
        "Content-Type": "application/json"
    }
    login_data = {
        "email": "admin@example.com",
        "password": "admin123456"
    }
    
    async with httpx.AsyncClient() as client:
        # Get token
        response = await client.post(login_url, headers=login_headers, json=login_data)
        token = response.json()["access_token"]
        
        headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {token}"
        }
        
        # Count hymns
        hymn_url = f"{url}/rest/v1/hymns?select=count"
        response = await client.get(hymn_url, headers=headers)
        hymn_count = len(response.json())
        
        # Count pdf_files
        pdf_url = f"{url}/rest/v1/pdf_files?select=count"
        response = await client.get(pdf_url, headers=headers)
        pdf_count = len(response.json())
        
        # Count hymn_authors
        authors_url = f"{url}/rest/v1/hymn_authors?select=count"
        response = await client.get(authors_url, headers=headers)
        author_links = len(response.json())
        
        # Count categories
        cat_url = f"{url}/rest/v1/hymn_categories?select=count"
        response = await client.get(cat_url, headers=headers)
        category_links = len(response.json())
        
        print("\nDatabase Record Counts:")
        print(f"- Hymns: {hymn_count}")
        print(f"- PDF Files: {pdf_count}")
        print(f"- Hymn-Author Links: {author_links}")
        print(f"- Hymn-Category Links: {category_links}")

asyncio.run(count_database_records())