# Streamlit Cloud — Configuração

## Main file path

**`streamlit_app.py`** (na raiz do repositório)

Estrutura padrão: main + pages/ na raiz — Streamlit Cloud resolve corretamente.

O `omniprof_run.py` faz subprocess e causa conflito no Streamlit Cloud (dois processos na mesma porta).

## Secrets (obrigatório)

Em **Manage app** → **Settings** → **Secrets**, adicione:

```toml
SUPABASE_URL = "https://plxheyykyetprhhhamqc.supabase.co"
SUPABASE_ANON_KEY = "eyJ..."
# ou SUPABASE_SERVICE_KEY se preferir

DEEPSEEK_API_KEY = "sk-..."
GEMINI_API_KEY = "..."
# outras chaves de IA conforme uso
```

## Se ainda carregar sem abrir

1. Verifique os **logs** em Manage app → Logs
2. Confirme que **Main file path** = `streamlit_app.py` (na raiz — NÃO use omnicraft/omnicraft_app.py)
3. Confirme que todas as dependências estão em `requirements.txt` (incluindo `streamlit-option-menu`)
