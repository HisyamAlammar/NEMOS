"""
main.py — FastAPI Application Entry Point

NEMOS AI Microservice — Receipt OCR via NVIDIA NIM (Mistral Large 3)

Startup:
  cd ai-service
  py -m uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from routers.ocr import router as ocr_router

app = FastAPI(
    title="NEMOS AI Service",
    description="Receipt OCR verification using NVIDIA NIM (Mistral Large 3 Vision)",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc",    # ReDoc
)

# ── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTES ─────────────────────────────────────────────────
app.include_router(ocr_router)


# ── HEALTH CHECK ───────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "NEMOS AI Microservice",
        "model": "mistralai/mistral-large-3-675b-instruct-2512",
        "provider": "NVIDIA NIM",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
