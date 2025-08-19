# backend/app/adobe_extract.py
import io, os, time, zipfile, json, uuid, requests
from typing import List, Dict

ADOBE_SERVICES_CLIENT_ID = os.getenv("f0993d6d70b64c0cb658862fe464dda8", "")
ADOBE_SERVICES_CLIENT_SECRET = os.getenv("p8e-LQguhVbe9LXg3we1c2__W5Rq63rBOoe9", "")

BASE = "https://pdf-services.adobe.io"

class ExtractError(RuntimeError): pass

def _auth_headers(token: str = "") -> Dict[str, str]:
    h = {"x-api-key": ADOBE_SERVICES_CLIENT_ID}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h

def _require_creds():
    if not ADOBE_SERVICES_CLIENT_ID or not ADOBE_SERVICES_CLIENT_SECRET:
        raise ExtractError("Adobe PDF Services credentials are not set")

def _get_access_token() -> str:
    _require_creds()
    r = requests.post(
        f"{BASE}/token",
        data={"grant_type": "client_credentials", "client_id": ADOBE_SERVICES_CLIENT_ID,
              "client_secret": ADOBE_SERVICES_CLIENT_SECRET}
    )
    if r.status_code != 200:
        raise ExtractError(f"Token error: {r.text}")
    return r.json()["access_token"]

def _create_asset(token: str) -> dict:
    r = requests.post(
        f"{BASE}/assets",
        json={"mediaType": "application/pdf"},
        headers=_auth_headers(token)
    )
    if r.status_code != 201:
        raise ExtractError(f"Create asset error: {r.text}")
    return r.json()  # {id, uploadUri}

def _upload_asset(upload_uri: str, pdf_bytes: bytes):
    r = requests.put(upload_uri, data=pdf_bytes,
                     headers={"Content-Type": "application/pdf"})
    if r.status_code not in (200, 201):
        raise ExtractError(f"Upload asset error: {r.status_code} {r.text}")

def _start_extract_job(token: str, asset_id: str) -> str:
    # Ask for structured elements (headings, paragraphs, positions)
    body = {
        "assetID": asset_id,
        "outputType": "json",
        "elementsToExtract": ["text"],
        "includeCharBounds": True
    }
    r = requests.post(
        f"{BASE}/operation/extractpdf",
        json=body,
        headers={**_auth_headers(token), "Content-Type": "application/json"}
    )
    if r.status_code not in (200, 201, 202):
        raise ExtractError(f"Start job error: {r.status_code} {r.text}")
    return r.json()["jobID"]

def _poll_job(token: str, job_id: str, timeout_sec=120) -> dict:
    t0 = time.time()
    while True:
        r = requests.get(f"{BASE}/jobs/{job_id}", headers=_auth_headers(token))
        if r.status_code != 200:
            raise ExtractError(f"Poll job error: {r.status_code} {r.text}")
        j = r.json()
        if j.get("status") in ("done", "failed", "cancelled"):
            if j["status"] != "done":
                raise ExtractError(f"Job not done: {j}")
            return j  # includes a 'downloadUri'
        if time.time() - t0 > timeout_sec:
            raise ExtractError("Timed out waiting for Extract job")
        time.sleep(2)

def _download_result(download_uri: str) -> bytes:
    r = requests.get(download_uri)
    if r.status_code != 200:
        raise ExtractError(f"Download result error: {r.status_code} {r.text}")
    return r.content  # a zip file

def _parse_toc_from_zip(zip_bytes: bytes) -> List[Dict]:
    """Return a list of {title, pageNumber, y} from the Extract JSON."""
    out = []
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        # Prefer structuredData.json; fallback to elements.json
        name = None
        for n in zf.namelist():
            if n.endswith("structuredData.json"):
                name = n
                break
        if not name:
            for n in zf.namelist():
                if n.endswith("elements.json"):
                    name = n
                    break
        if not name:
            return out
        data = json.loads(zf.read(name).decode("utf-8"))

    # The schema includes "elements" with role/Bounds/Path etc; look for headings.
    elements = data.get("elements", data)  # be tolerant
    for el in elements:
        role = (el.get("Role") or el.get("role") or "").upper()
        if role in ("H1", "H2", "H3", "H4", "H5", "H6"):
            text = el.get("Text", "").strip() or el.get("text", "").strip()
            page = el.get("Page", el.get("page", 1))
            # Y coordinate: try bounds [x1,y1,x2,y2] or "Bounds" object
            y = None
            b = el.get("Bounds") or el.get("bounds")
            if isinstance(b, list) and len(b) >= 2:
                y = b[1]
            out.append({"title": text, "pageNumber": int(page or 1), "y": y})
    # De-dup & sort by page then y
    out = [o for o in out if o["title"]]
    out.sort(key=lambda r: (r["pageNumber"], r["y"] if r["y"] is not None else 0))
    return out

def extract_toc_from_pdf_bytes(pdf_bytes: bytes) -> List[Dict]:
    token = _get_access_token()
    a = _create_asset(token)
    _upload_asset(a["uploadUri"], pdf_bytes)
    job_id = _start_extract_job(token, a["id"])
    job = _poll_job(token, job_id)
    zip_bytes = _download_result(job["downloadUri"])
    return _parse_toc_from_zip(zip_bytes)