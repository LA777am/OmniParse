import requests
import time
import json
import os

API_URL = "http://localhost:8000/api/v1"
PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
LOCAL_PDF = "dummy.pdf"

print("1. Downloading a sample PDF...")
response = requests.get(PDF_URL)
with open(LOCAL_PDF, "wb") as f:
    f.write(response.content)
print(f"   Saved as {LOCAL_PDF} ({os.path.getsize(LOCAL_PDF)} bytes)\n")

print("2. Uploading PDF to OmniParse (Synchronous Parsing)...")
start_time = time.time()
with open(LOCAL_PDF, "rb") as f:
    files = {"file": (LOCAL_PDF, f, "application/pdf")}
    data = {"document_name": "W3C_Dummy_Test"}
    
    upload_resp = requests.post(f"{API_URL}/documents/upload", files=files, data=data)

if upload_resp.status_code != 202:
    print(f"❌ Upload failed: {upload_resp.status_code} - {upload_resp.text}")
    exit(1)

result = upload_resp.json()
elapsed = time.time() - start_time
print(f"   ✅ Upload successful! (Took {elapsed:.2f} seconds)")
print(f"   Task ID: {result['task_id']}")
print(f"   Document ID: {result['document_id']}\n")

print("3. Querying MongoDB for Extracted Chunk Statistics...")
stats_resp = requests.get(f"{API_URL}/documents/{result['document_id']}/stats")

if stats_resp.status_code == 200:
    stats = stats_resp.json()
    print("   ✅ MongoDB Verification Successful! Here is what was extracted:")
    print(json.dumps(stats, indent=4))
else:
    print(f"❌ Stats query failed: {stats_resp.status_code} - {stats_resp.text}")

# Cleanup
if os.path.exists(LOCAL_PDF):
    os.remove(LOCAL_PDF)
