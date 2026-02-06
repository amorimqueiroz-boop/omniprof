# Supabase — Omniprof

Projeto Supabase **independente** do Omnisfera. Crie um novo projeto em [supabase.com](https://supabase.com) para o Omniprof.

## 1. Criar o projeto Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → nome: `omniprof` (ou outro)
3. Escolha senha e região
4. Aguarde a criação

## 2. Rodar as migrations

1. No dashboard: **SQL Editor**
2. Crie uma nova query
3. Cole o conteúdo de `migrations/00001_omniprof_init.sql`
4. Execute (**Run**)

## 3. Obter as chaves

1. **Project Settings** → **API**
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** (ou **service_role** para mais permissões) → `SUPABASE_ANON_KEY` ou `SUPABASE_SERVICE_KEY`

## 4. Configurar no Omniprof

Cole em `.streamlit/secrets.toml`:

```toml
SUPABASE_URL = "https://seu-projeto.supabase.co"
SUPABASE_ANON_KEY = "eyJ..."
```

## Estrutura

- `migrations/` — SQL para rodar no SQL Editor do Supabase
