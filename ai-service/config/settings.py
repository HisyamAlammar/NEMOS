"""
config/settings.py — Environment Configuration (Rule 8)

Semua env var divalidasi di sini saat startup.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Validated environment settings."""

    GEMINI_API_KEY: str
    PORT: int
    CORS_ORIGINS: list[str]

    def __init__(self):
        self.GEMINI_API_KEY = self._require("GEMINI_API_KEY")
        self.PORT = int(os.getenv("PORT", "8000"))
        self.CORS_ORIGINS = [
            "http://localhost:5173",       # Vite dev
            "http://localhost:3000",        # Next.js dev
            "https://nemos-three.vercel.app",  # Production
        ]

    @staticmethod
    def _require(key: str) -> str:
        """Rule 8: Crash loud if env var missing."""
        val = os.getenv(key)
        if not val:
            raise RuntimeError(
                f"STARTUP FAILED: Missing required env var: {key}\n"
                f"Copy .env.example to .env and fill in all values."
            )
        return val


settings = Settings()
