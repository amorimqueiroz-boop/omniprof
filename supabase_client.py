# supabase_client.py — Omniprof (projeto Supabase independente)
"""
Cliente Supabase para Omniprof. Usa projeto separado do Omnisfera.
Lê SUPABASE_URL e SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_KEY) de env/secrets.
"""

import os
from typing import Optional, Tuple

try:
    import streamlit as st
except ImportError:
    st = None


def _get_secret(name: str) -> Optional[str]:
    """Lê env var e st.secrets."""
    v = os.environ.get(name, "").strip()
    if v:
        return str(v).strip()

    if st is None:
        return None

    try:
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
    return None


def _get_supabase_config() -> Tuple[Optional[str], Optional[str]]:
    """Retorna (url, key) do Supabase. Aceita nível raiz ou [supabase]."""
    url = _get_secret("SUPABASE_URL")
    key = _get_secret("SUPABASE_SERVICE_KEY") or _get_secret("SUPABASE_ANON_KEY")

    if url and key:
        return url, key

    if st and getattr(st, "secrets", None):
        try:
            sec = st.secrets.get("supabase") or st.secrets.get("SUPABASE")
            if isinstance(sec, dict):
                u = sec.get("url") or sec.get("SUPABASE_URL")
                k = sec.get("service_key") or sec.get("anon_key") or sec.get("key")
                if u:
                    url = str(u).strip()
                if k:
                    key = str(k).strip()
            if hasattr(key, "get_secret_value"):
                key = str(key.get_secret_value()).strip()
        except Exception:
            pass

    return url or None, key or None


def has_supabase_keys() -> bool:
    """True se URL e chave estão configurados."""
    url, key = _get_supabase_config()
    return bool(url and key)


_sb_cache = None  # cache fora do Streamlit


def get_sb():
    """
    Retorna cliente Supabase (cacheado em st.session_state ou módulo).
    Omniprof usa projeto Supabase separado do Omnisfera.
    """
    global _sb_cache

    if st is not None and "sb" in st.session_state and st.session_state["sb"] is not None:
        return st.session_state["sb"]
    if _sb_cache is not None:
        return _sb_cache

    url, key = _get_supabase_config()
    if not url or not key:
        raise RuntimeError(
            "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY "
            "(ou SUPABASE_SERVICE_KEY) em .streamlit/secrets.toml ou variáveis de ambiente."
        )

    try:
        from supabase import create_client
    except ImportError as e:
        raise RuntimeError("Instale o pacote supabase: pip install supabase") from e

    client = create_client(url, key)
    if st is not None:
        st.session_state["sb"] = client
    else:
        _sb_cache = client
    return client
