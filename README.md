# Omniprof — Ferramentas para Professores

Ferramentas de criação pedagógica com IA. Focado em professores individuais, sem vínculo com PEI/PAEE ou estudantes.

## Ferramentas

- **Criar Itens** — Atividades a partir de BNCC e objetivos
- **Estúdio Visual** — Geração de imagens para aulas
- **Papo de Mestre** — Conversa com IA sobre assuntos de interesse
- **Dinâmica** — Dinâmicas para sala de aula
- **Plano de Aula** — BNCC + verbos de Bloom
- **Mapas Mentais** — Tema central + ramificações
- **Adaptar Prova** / **Adaptar Atividade** — Checklists sem PEI

**Educação Infantil:** Criar Experiência | Estúdio Visual & CAA | Rotina & AVD | Inclusão no Brincar

## Executar

```bash
# Opção 1 — Launcher (recomendado)
python omniprof_run.py

# Opção 2 — Direto
cd omnicraft
streamlit run omnicraft_app.py
```

## Configuração

1. Copie `.streamlit/secrets.toml.example` para `.streamlit/secrets.toml`
2. Preencha as chaves de API (DeepSeek, Gemini, OpenAI, etc.)

## Streamlit Cloud

- **Main file path:** `omniprof_run.py`
- Adicione as chaves em Secrets (Settings → Secrets)

## Estrutura

```
omniprof/
├── omniprof_run.py      # Launcher
├── omnicraft/           # Código principal
│   ├── omnicraft_app.py
│   ├── pages/
│   └── ...
├── bncc.csv, bncc_ei.csv, bncc_em.csv
├── requirements.txt
└── .streamlit/
```
