import pdfplumber
from fastapi import UploadFile, HTTPException


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract plain text from a typed PDF file.
    - Works only for text-based PDFs (no scanned images)
    - Returns extracted text as a single string
    """

    # Basic validation
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    extracted_text = ""

    try:
        # pdfplumber works with file-like objects
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to extract text from PDF. Ensure it is a typed PDF."
        )

    # Final safety check
    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="PDF contains no readable text"
        )

    return extracted_text.strip()
