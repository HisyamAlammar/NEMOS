"""
routers/ocr.py — Receipt OCR Router

POST /ocr/verify-receipt
  Input: multipart/form-data with 'receipt' file
  Output: ReceiptVerifyResponse

Rule: Jika confidence < 85 → flagged_for_manual: true, status: NEEDS_REVIEW
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.receipt import ReceiptVerifyResponse, ExtractedData
from services.gemini_service import analyze_receipt

router = APIRouter(prefix="/ocr", tags=["OCR"])

# Allowed image types
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post(
    "/verify-receipt",
    response_model=ReceiptVerifyResponse,
    summary="Verify UMKM receipt using AI",
    description="Upload a receipt image. NVIDIA NIM Mistral Vision extracts date, total, "
                "merchant name, and returns a confidence score.",
)
async def verify_receipt(
    receipt: UploadFile = File(..., description="Gambar struk UMKM (JPEG/PNG/WebP)")
):
    """
    Endpoint utama untuk verifikasi struk UMKM.

    Flow:
    1. Validasi file type dan size
    2. Kirim ke Gemini Vision API
    3. Apply business rules (confidence threshold)
    4. Return structured response
    """

    # ── VALIDATE FILE TYPE ─────────────────────────────────
    if receipt.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type tidak didukung: {receipt.content_type}. "
                   f"Gunakan JPEG, PNG, atau WebP.",
        )

    # ── READ FILE ──────────────────────────────────────────
    image_bytes = await receipt.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File terlalu besar. Maksimum {MAX_FILE_SIZE // (1024*1024)}MB.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="File kosong.",
        )

    # ── SEND TO NVIDIA NIM (MISTRAL VISION) ─────────────────
    result = await analyze_receipt(image_bytes, receipt.content_type)

    confidence = result["confidence"]

    # ── APPLY BUSINESS RULES ───────────────────────────────
    # Rule: confidence < 85 → NEEDS_REVIEW + flag for manual
    if confidence >= 85:
        status = "VERIFIED"
        flagged = False
    else:
        status = "NEEDS_REVIEW"
        flagged = True

    return ReceiptVerifyResponse(
        confidence=confidence,
        extracted=ExtractedData(
            date=result["date"],
            total=result["total"],
            merchant=result["merchant"],
        ),
        status=status,
        flagged_for_manual=flagged,
    )
