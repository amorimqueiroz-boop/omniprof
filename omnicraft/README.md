# Omniprof — Ferramentas para Professores

Produto derivado do **Hub de Inclusão** (Omnisfera). Focado em professores individuais.

## Diferenças Omnisfera × Omniprof

| Omnisfera | Omniprof |
|-----------|-----------|
| Escolas (equipe pedagógica) | Professores individuais |
| PEI, PAEE, Diário, Avaliação | Sem esses módulos |
| Vínculo com estudantes | Sem vínculo com estudante |
| Cores azuis/roxas | Vermelho cereja (#f3474a) + Azul (#004aad) |

## Ferramentas

1. **Criar Itens** (principal) — Itens complexos a partir de BNCC
2. **Estúdio Visual** — Geração de imagens (sem CAA)
3. **Papo de Mestre** — Assunto de interesse (não hiperfoco)
4. **Dinâmica** — Dinâmicas gerais
5. **Plano de Aula** — BNCC + Bloom
6. **Mapas Mentais** — Tema central + ramificações
7. **Adaptar Prova** — Checklist (sem PEI)
8. **Adaptar Atividade** — Checklist (sem PEI)

## Executar

**Importante:** rode com cwd em `omnicraft/` para evitar conflito com `inclusao/pages/` (Omnisfera).

**Opção 1 – Launcher (recomendado):**
```bash
python omniprof_run.py
```

**Opção 2 – Diretamente de omnicraft/:**
```bash
cd omnicraft
streamlit run omnicraft_app.py
```

**Opção 3 – Script shell:**
```bash
./omnicraft/run_omniprof.sh
```

**Streamlit Cloud:** use **Main file path** = `omniprof_run.py` (na raiz do repositório).

## Estrutura

- `omnicraft_app.py` — Ponto de entrada (redireciona para Home)
- `omnicraft_ui.py` — Header, navbar, CSS compartilhados
- `services_bridge.py` — Ponte para serviços do Hub (hub_ia, hub_bncc_utils, hub_docs)
- `pages/0_Home.py` — **Home independente** (hero + cards)
- `pages/` — Uma página por ferramenta

## Independência total

**Omniprof não vincula nada ao Omnisfera.** Cópias próprias:

- `config.py` — Chaves (GEMINI, OPENAI, UNSPLASH) via env/secrets
- `ia.py` — Geração de imagens (Gemini, DALL-E, Unsplash)
- `bncc_utils.py` — Utilitários BNCC
- `docs.py` — DOCX/PDF

Sem imports de `omni_utils`, `services`, etc.

## Próximos passos

- Completar integração de Criar Itens, Papo de Mestre, Dinâmica, Plano de Aula, Adaptar Prova/Atividade
- Auth simplificado (professor → plano → login)
