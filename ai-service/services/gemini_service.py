"""
services/gemini_service.py — Gemini Vision API Integration (Rule 3)

HANYA logika Gemini AI di sini. Tidak boleh import FastAPI, database,
atau Xendit logic apapun.

Uses the new `google-genai` SDK (v1.69+).
"""
import base64
import json
import re
from google import genai
from google.genai import types
from config.settings import settings

# ── CONFIGURE GEMINI CLIENT ───────────────────────────────
client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL = "gemini-2.0-flash"

# ── RECEIPT ANALYSIS PROMPT ────────────────────────────────
RECEIPT_ANALYSIS_PROMPT = """Kamu adalah sistem OCR untuk platform investasi UMKM bernama NEMOS.

Analisis gambar struk/receipt berikut dan ekstrak informasi ini:
1. **date**: Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ada, gunakan null.
2. **total**: Total nominal transaksi dalam Rupiah (integer, tanpa titik/koma). Jika tidak jelas, gunakan null.
3. **merchant**: Nama toko/merchant. Jika tidak ada, gunakan null.
4. **confidence**: Berikan confidence score 0-100 berdasarkan seberapa jelas dan valid struk tersebut:
   - 90-100: Struk sangat jelas, semua data terbaca
   - 70-89: Struk cukup jelas, beberapa data mungkin kurang akurat
   - 50-69: Struk blur/rusak, data tidak reliable
   - 0-49: Bukan struk valid atau gambar tidak bisa dibaca

RESPOND ONLY dengan JSON object berikut (tanpa markdown, tanpa backtick):
{"date": "YYYY-MM-DD", "total": 1234567, "merchant": "Nama Toko", "confidence": 87}

Jika gambar BUKAN struk transaksi, respond:
{"date": null, "total": null, "merchant": null, "confidence": 0}
"""


async def analyze_receipt(image_bytes: bytes, content_type: str) -> dict:
    """
    Analyze receipt image using Gemini Vision API.

    Args:
        image_bytes: Raw bytes of the receipt image
        content_type: MIME type (image/jpeg, image/png, etc.)

    Returns:
        dict with keys: date, total, merchant, confidence
    """
    # 1. Create image part
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=content_type)

    # 2. Send to Gemini Vision
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[RECEIPT_ANALYSIS_PROMPT, image_part],
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=512,
            ),
        )
    except Exception as e:
        print(f"[GEMINI] API call failed: {e}")
        return {
            "date": None,
            "total": None,
            "merchant": None,
            "confidence": 0,
        }

    # 3. Parse Gemini response
    raw_text = response.text.strip()
    print(f"[GEMINI] Raw response: {raw_text}")

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        # Gemini sometimes wraps in markdown code blocks
        json_match = re.search(r'\{[^}]+\}', raw_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
            except json.JSONDecodeError:
                print(f"[GEMINI] Failed to parse: {raw_text}")
                return {"date": None, "total": None, "merchant": None, "confidence": 0}
        else:
            print(f"[GEMINI] No JSON found: {raw_text}")
            return {"date": None, "total": None, "merchant": None, "confidence": 0}

    # 4. Validate and sanitize
    return {
        "date": result.get("date"),
        "total": _safe_int(result.get("total")),
        "merchant": result.get("merchant"),
        "confidence": min(100, max(0, int(result.get("confidence", 0)))),
    }


def _safe_int(value) -> int | None:
    """Convert value to int safely."""
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None
