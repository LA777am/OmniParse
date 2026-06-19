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

document_id = result['document_id']

print("3. Waiting for Celery worker to finish processing...")
max_retries = 15
for attempt in range(max_retries):
    stats_resp = requests.get(f"{API_URL}/documents/{document_id}/stats")
    if stats_resp.status_code == 200:
        stats = stats_resp.json()
        if stats.get("status") == "completed":
            print("   ✅ MongoDB Verification Successful! Here is what was extracted:")
            print(json.dumps(stats, indent=4))
            break
        elif stats.get("status") == "failed":
            print(f"   ❌ Task failed: {stats.get('error_log')}")
            exit(1)
        else:
            print(f"   ... still processing (attempt {attempt+1}/{max_retries})")
            time.sleep(2)
    else:
        print(f"❌ Stats query failed: {stats_resp.status_code} - {stats_resp.text}")
        exit(1)
else:
    print("❌ Timeout waiting for document to finish processing.")
    exit(1)

# ---------------------------------------------------------
# STEP 4: Test Vector Search + LLM Query
# ---------------------------------------------------------
print("\n4. Testing Vector Search + LLM Generation (Sprint 4)...")
query_text = "What is the primary topic of this document?"
print(f"   Query: '{query_text}'")

query_payload = {"query": query_text, "top_k": 3}
query_resp = requests.post(f"{API_URL}/documents/{document_id}/query", json=query_payload)

if query_resp.status_code == 200:
    print("   ✅ LLM Query Successful! Response:")
    result = query_resp.json()
    print(f"\n--- Answer ---\n{result.get('answer')}")
    print(f"\n--- Sources Retrieved ---")
    for i, src in enumerate(result.get('sources', [])):
        print(f"  [{i+1}] (Page {src.get('page')}, Score: {src.get('score'):.3f}): {src.get('text')[:100]}...")
else:
    print(f"   ❌ LLM Query failed: {query_resp.status_code} - {query_resp.text}")

# Cleanup
if os.path.exists(LOCAL_PDF):
    os.remove(LOCAL_PDF)
