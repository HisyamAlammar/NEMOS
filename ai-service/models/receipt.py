"""
models/receipt.py — Pydantic Models for Receipt OCR

Output models untuk response API.
"""
from pydantic import BaseModel, Field
from typing import Optional


class ExtractedData(BaseModel):
    """Data yang diekstrak dari struk."""
    date: Optional[str] = Field(None, description="Tanggal transaksi (YYYY-MM-DD)")
    total: Optional[int] = Field(None, description="Total transaksi dalam Rupiah")
    merchant: Optional[str] = Field(None, description="Nama merchant/toko")


class ReceiptVerifyResponse(BaseModel):
    """Response dari endpoint verify-receipt."""
    confidence: int = Field(..., ge=0, le=100, description="Confidence score 0-100")
    extracted: ExtractedData
    status: str = Field(..., description="VERIFIED atau NEEDS_REVIEW")
    flagged_for_manual: bool = Field(
        False,
        description="True jika confidence < 85 — perlu review manual"
    )


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    message: str
