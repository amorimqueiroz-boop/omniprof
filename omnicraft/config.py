# config.py — Configuração independente Omnicraft
"""
Omnicraft: sem vínculo com Omnisfera.
Lê chaves de os.environ e st.secrets.
"""

from __future__ import annotations

import os


def _get_secret(name: str, default: str = "") -> str:
    """Lê configuração: env → st.secrets."""
    v = os.environ.get(name, "").strip()
    if v:
        return v
    try:
        import streamlit as st
        sec = getattr(st, "secrets", None)
        if sec:
            val = sec.get(name)
            if val is not None:
                out = str(val).strip()
                if hasattr(val, "get_secret_value"):
                    try:
                        out = str(val.get_secret_value()).strip()
                    except Exception:
                        pass
                if out:
                    return out
    except Exception:
        pass
    return default


def get_setting(name: str, default: str = "") -> str:
    """Retorna valor de configuração (env ou secrets)."""
    return _get_secret(name, default) or default


def get_gemini_api_key():
    """Chave da API Gemini."""
    raw = _get_secret("GEMINI_API_KEY") or _get_secret("gemini", "")
    try:
        import streamlit as st
        if not raw and getattr(st, "secrets", None):
            g = st.secrets.get("gemini") or {}
            raw = g.get("api_key") or g.get("GEMINI_API_KEY") or ""
    except Exception:
        pass
    raw = str(raw or "").strip().strip("'\"")
    return raw if raw else None


def get_openai_api_key():
    """Chave da API OpenAI (DALL-E)."""
    raw = _get_secret("OPENAI_API_KEY")
    raw = str(raw or "").strip().replace("\n", "").replace("\r", "")
    return raw if raw else None


def get_unsplash_key():
    """Chave do Unsplash."""
    raw = _get_secret("UNSPLASH_ACCESS_KEY")
    return str(raw or "").strip() if raw else None


def get_anthropic_api_key():
    """Chave da API Anthropic/Claude (motor green)."""
    raw = _get_secret("ANTHROPIC_API_KEY")
    try:
        import streamlit as st
        if not raw and getattr(st, "secrets", None):
            raw = st.secrets.get("ANTHROPIC_API_KEY") or (st.secrets.get("anthropic") or {}).get("api_key") or ""
    except Exception:
        pass
    raw = str(raw or "").strip().replace("\n", "").replace("\r", "").strip("'\"")
    return raw if raw else None


def get_deepseek_api_key():
    """Chave da API DeepSeek (motor red)."""
    raw = _get_secret("DEEPSEEK_API_KEY")
    try:
        import streamlit as st
        if not raw and getattr(st, "secrets", None):
            raw = st.secrets.get("DEEPSEEK_API_KEY") or (st.secrets.get("deepseek") or {}).get("api_key") or ""
    except Exception:
        pass
    raw = str(raw or "").strip().replace("\n", "").replace("\r", "").strip("'\"")
    return raw if raw else None
