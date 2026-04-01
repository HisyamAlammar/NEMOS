"""
services/gemini_service.py — NVIDIA NIM (Mistral Large 3) Vision Integration

Migrated from Google Gemini to NVIDIA NIM endpoint.
Model: mistralai/mistral-large-3-675b-instruct-2512

HANYA logika AI Vision di sini. Tidak boleh import FastAPI, database,
atau Xendit logic apapun (Rule 3).

Uses the `openai` SDK with NVIDIA NIM base URL.
"""
import base64
import json
import re
import os
from openai import OpenAI
from config.settings import settings

# ── CONFIGURE NVIDIA NIM CLIENT ──────────────────────────
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=settings.NVIDIA_API_KEY,
)

MODEL = "mistralai/mistral-large-3-675b-instruct-2512"

# ── SYSTEM PROMPT — STRICT JSON OUTPUT ────────────────────
SYSTEM_PROMPT = (
    "Kamu adalah sistem ekstraksi data OCR untuk platform investasi UMKM bernama NEMOS. "
    "Kamu WAJIB mengembalikan output HANYA dalam format JSON MURNI tanpa markdown, "
    "tanpa backticks, tanpa teks pengantar atau penutup. "
    "Tidak boleh ada karakter apapun sebelum '{' atau setelah '}'."
)

RECEIPT_ANALYSIS_PROMPT = """Analisis gambar struk/receipt berikut dan ekstrak informasi ini:

1. "date": Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ada, gunakan null.
2. "total": Total nominal transaksi dalam Rupiah (integer, tanpa titik/koma). Jika tidak jelas, gunakan null.
3. "merchant": Nama toko/merchant. Jika tidak ada, gunakan null.
4. "confidence": Berikan confidence score 0-100 berdasarkan seberapa jelas dan valid struk tersebut:
   - 90-100: Struk sangat jelas, semua data terbaca
   - 70-89: Struk cukup jelas, beberapa data mungkin kurang akurat
   - 50-69: Struk blur/rusak, data tidak reliable
   - 0-49: Bukan struk valid atau gambar tidak bisa dibaca

Format output WAJIB (JSON murni, tanpa penjelasan):
{"date": "YYYY-MM-DD", "total": 1234567, "merchant": "Nama Toko", "confidence": 87}

Jika gambar BUKAN struk transaksi:
{"date": null, "total": null, "merchant": null, "confidence": 0}"""

# ── VERIFY RECEIPT WITH RAB MATCHING ─────────────────────
VERIFY_WITH_RAB_PROMPT = """Analisis gambar struk/receipt berikut dan cocokkan dengan RAB (Rencana Anggaran Biaya).

RAB yang diberikan:
{rab_data}

Tugas:
1. Ekstrak semua item dan harga dari struk.
2. Cocokkan setiap item dengan RAB.
3. Hitung total harga dari struk.
4. Tentukan apakah struk ini valid berdasarkan kesesuaian dengan RAB.

Format output WAJIB (JSON murni, tanpa penjelasan):
{{"isValid": true, "confidence": 85, "items": [{{"name": "Item", "price": 50000, "matchesRAB": true}}], "total": 150000}}"""


# ── FALLBACK RESPONSE ────────────────────────────────────
_FALLBACK = {"date": None, "total": None, "merchant": None, "confidence": 0}
_FALLBACK_RAB = {"isValid": False, "confidence": 0, "items": [], "total": 0}


async def analyze_receipt(image_bytes: bytes, content_type: str) -> dict:
    """
    Analyze receipt image using NVIDIA NIM Mistral Large 3 Vision API.

    Args:
        image_bytes: Raw bytes of the receipt image
        content_type: MIME type (image/jpeg, image/png, etc.)

    Returns:
        dict with keys: date, total, merchant, confidence
    """
    # 1. Encode image to base64 with data URI prefix
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:{content_type};base64,{b64_image}"

    # 2. Build VLM message payload
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                },
                {
                    "type": "text",
                    "text": RECEIPT_ANALYSIS_PROMPT,
                },
            ],
        },
    ]

    # 3. Call NVIDIA NIM endpoint via OpenAI SDK
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.15,
            max_tokens=2048,
        )
    except Exception as e:
        print(f"[NVIDIA-NIM] API call failed: {e}")
        return _FALLBACK.copy()

    # 4. Extract and parse response
    raw_text = response.choices[0].message.content.strip()
    print(f"[NVIDIA-NIM] Raw response: {raw_text}")

    result = _parse_json_response(raw_text, _FALLBACK)
    if result is None:
        return _FALLBACK.copy()

    # 5. Validate and sanitize
    return {
        "date": result.get("date"),
        "total": _safe_int(result.get("total")),
        "merchant": result.get("merchant"),
        "confidence": min(100, max(0, int(result.get("confidence", 0)))),
    }


async def verify_receipt_with_rab(
    image_bytes: bytes, content_type: str, rab_data: str
) -> dict:
    """
    Verify receipt against RAB (Rencana Anggaran Biaya) using Mistral Vision.

    Args:
        image_bytes: Raw bytes of the receipt image
        content_type: MIME type
        rab_data: JSON string or description of RAB items

    Returns:
        dict with keys: isValid, confidence, items, total
    """
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:{content_type};base64,{b64_image}"

    user_prompt = VERIFY_WITH_RAB_PROMPT.format(rab_data=rab_data)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                },
                {
                    "type": "text",
                    "text": user_prompt,
                },
            ],
        },
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.15,
            max_tokens=2048,
        )
    except Exception as e:
        print(f"[NVIDIA-NIM] RAB verification API call failed: {e}")
        return _FALLBACK_RAB.copy()

    raw_text = response.choices[0].message.content.strip()
    print(f"[NVIDIA-NIM] RAB response: {raw_text}")

    result = _parse_json_response(raw_text, _FALLBACK_RAB)
    if result is None:
        return _FALLBACK_RAB.copy()

    return {
        "isValid": bool(result.get("isValid", False)),
        "confidence": min(100, max(0, int(result.get("confidence", 0)))),
        "items": result.get("items", []),
        "total": _safe_int(result.get("total")) or 0,
    }


# ── UTILITIES ─────────────────────────────────────────────

def _parse_json_response(raw_text: str, fallback: dict) -> dict | None:
    """
    Parse LLM response as JSON, with fallback regex extraction.

    Handles cases where model wraps response in markdown code blocks
    or adds extra text before/after JSON.
    """
    # Strip markdown code block wrappers if present
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        # Remove opening ```json or ``` and closing ```
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # Attempt 1: Direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 2: Extract first JSON object via regex
    json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    print(f"[NVIDIA-NIM] Failed to parse JSON: {raw_text}")
    return None


def _safe_int(value) -> int | None:
    """Convert value to int safely."""
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None
