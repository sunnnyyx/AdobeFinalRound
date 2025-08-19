# backend/main.py (additions)
from fastapi import APIRouter, HTTPException
from .adobe_extract import extract_toc_from_pdf_bytes, ExtractError
import os

router = APIRouter()

DOCS_DIR = os.getenv("DOCS_DIR", os.path.join(os.getcwd(), "storage", "docs"))

@router.get("/api/docs/{doc_id}/toc")
def get_doc_toc(doc_id: str):
    path = os.path.join(DOCS_DIR, f"{doc_id}.pdf")
    if not os.path.exists(path):
        raise HTTPException(404, "Document not found")
    try:
        with open(path, "rb") as f:
            pdf = f.read()
        toc = extract_toc_from_pdf_bytes(pdf)
        return {"toc": toc}
    except ExtractError as e:
        raise HTTPException(500, f"Adobe Extract failed: {e}")