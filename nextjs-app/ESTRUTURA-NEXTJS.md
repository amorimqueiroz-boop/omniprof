# OmniProf — Estrutura da versão Next.js

Referência focada **apenas** no app Next.js (venda direta por assinatura para professores).

---

## Stack

- **Next.js 16** (App Router), **React 19**
- **Supabase**: Auth (email/senha) + tabelas `omniprof_biblioteca`, `omniprof_uso_ia`
- **IA**: 5 engines (DeepSeek, Kimi/OpenRouter, Claude, Gemini, OpenAI) via `lib/ai-engines.ts`
- **Estilo**: Tailwind 4, Lucide icons

---

## Estrutura de pastas (fontes)

```
nextjs-app/
├── app/
│   ├── layout.tsx              # Root layout (metadata, html/lang)
│   ├── page.tsx                # Landing pública (/)
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (dashboard)/            # Exige login
│   │   ├── layout.tsx          # getUser(); redirect /login se não autenticado
│   │   ├── ferramentas/
│   │   │   ├── page.tsx        # Grid de 12 ferramentas
│   │   │   └── [tool]/page.tsx # Página única por ferramenta (form + resultado)
│   │   ├── biblioteca/page.tsx
│   │   └── perfil/page.tsx
│   └── api/
│       ├── biblioteca/route.ts  # GET lista, POST salvar, DELETE remover
│       ├── perfil/route.ts      # GET perfil+stats, PATCH nome
│       ├── bncc/route.ts
│       └── ferramentas/
│           ├── criar-itens/route.ts
│           ├── plano-aula/route.ts
│           ├── dinamica/route.ts
│           ├── papo-mestre/route.ts
│           ├── mapa-mental/route.ts
│           ├── estudio-visual/ → gerar-imagem, gerar-imagem-inline
│           ├── adaptar-prova/route.ts + extrair-docx
│           ├── adaptar-atividade/route.ts + extrair-docx
│           ├── rotina-visual/route.ts
│           ├── atividades-ludicas/route.ts
│           ├── sequencia-didatica/route.ts
│           └── criar-experiencia/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── PageHero.tsx
│   ├── BnccSelector.tsx
│   ├── FormattedTextDisplay.tsx
│   ├── ImageCropper.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── constants.ts    # FERRAMENTAS, SEGMENTOS, BNCC/Bloom, etc.
│   ├── hub-prompts.ts  # Prompts por ferramenta (portados do Hub)
│   ├── ai-engines.ts   # chatCompletionText, geração de imagem, EngineId
│   ├── supabase.ts     # createClient + getServiceClient
│   ├── supabase-auth.ts# createSupabaseServer, getUser, getProfessorProfile*
│   ├── bncc.ts
│   ├── export-service.ts
│   ├── validation.ts   # parseBody, errorResponse
│   ├── hub-images.ts
│   ├── image-compression.ts
│   └── rate-limit.ts
├── middleware.ts       # Refresh session; protege rotas; redirect login/cadastro
├── next.config.ts
└── package.json
```

\* `getProfessorProfile` usa tabela `professors`, que **não existe** nas migrations (Supabase tem `omniprof_professores`). A função **não é usada** em nenhum lugar; perfil vem de Auth + `omniprof_biblioteca` + `omniprof_uso_ia`.

---

## Fluxo de autenticação

1. **Middleware** (`middleware.ts`): usa `@supabase/ssr` para refresh da sessão; protege todas as rotas exceto `/`, `/login`, `/cadastro`, `/api/auth`, `/api/bncc`. Sem usuário → redirect para `/login`. Logado em `/login` ou `/cadastro` → redirect para `/ferramentas`.
2. **Login**: `createBrowserClient` → `signInWithPassword` → `router.push("/ferramentas")`.
3. **Cadastro**: `signUp` com `options.data: { name, plan: "free" }` → usuário criado no Supabase Auth.
4. **Dashboard layout**: `getUser()` (server); se null → `redirect("/login")`.

Nenhuma tabela `professors` ou `omniprof_professores` é usada no fluxo atual; nome e plano vêm de `user_metadata`.

---

## Rotas e APIs

| Rota | Descrição |
|------|-----------|
| `/` | Landing (pública): CTA "Começar Grátis", "Ver Ferramentas". |
| `/login` | Form email/senha; redirect para `/ferramentas` se já logado. |
| `/cadastro` | Form nome, email, senha; `plan: "free"` em metadata. |
| `/ferramentas` | Grid de cards (12 ferramentas) → links para `/ferramentas/[tool]`. |
| `/ferramentas/[tool]` | Formulário da ferramenta + engine + gerar + resultado + salvar na biblioteca + exportar. |
| `/biblioteca` | Lista paginada (GET `/api/biblioteca`), filtro por ferramenta e busca; deletar item. |
| `/perfil` | Nome, email, plano (free/pro/escola), estatísticas (biblioteca, gerações), alterar senha. |

**APIs:**

- `GET/POST/DELETE /api/biblioteca` — exige usuário; usa tabela `omniprof_biblioteca` (user_id = auth.uid()).
- `GET/PATCH /api/perfil` — exige usuário; GET retorna user (Auth) + stats (count em `omniprof_biblioteca` e `omniprof_uso_ia`); PATCH atualiza nome via `supabase.auth.updateUser({ data: { name } })`.
- `GET /api/bncc` — público (middleware).
- `POST /api/ferramentas/<tool>` — em geral exige body com parâmetros da ferramenta + `engine`; chama `hub-prompts` + `ai-engines`; algumas rotas podem registrar uso em `omniprof_uso_ia` (verificar por ferramenta).

---

## Ferramentas (IDs e lista)

Definidas em `lib/constants.ts` (`FERRAMENTAS`). Cada uma tem:

- Uma rota de API em `app/api/ferramentas/<id>/route.ts`.
- O mesmo formulário dinâmico em `app/(dashboard)/ferramentas/[tool]/page.tsx` (um único componente que lê `params.tool` e monta o form conforme o ID).

IDs: `criar-itens`, `plano-aula`, `dinamica`, `papo-mestre`, `mapa-mental`, `estudio-visual`, `adaptar-prova`, `adaptar-atividade`, `rotina-visual`, `atividades-ludicas`, `sequencia-didatica`, `criar-experiencia`.

---

## Dados (Supabase)

- **Auth**: usuário e sessão; `user_metadata.name` e `user_metadata.plan` (free/pro/escola).
- **omniprof_biblioteca**: `user_id`, `ferramenta`, `titulo`, `conteudo`, `analise`, `tags`, `created_at`. RLS: `auth.uid() = user_id`.
- **omniprof_uso_ia**: `professor_id`, `engine`, `source`, `created_at` — usado para contagem de “gerações” no perfil.

Migrations estão em `../supabase/migrations/` (fora do nextjs-app). A tabela `omniprof_professores` existe na migration mas **não é usada** pelo Next.js.

---

## Variáveis de ambiente (Next.js)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — obrigatórias (auth e acesso a tabelas).
- `SUPABASE_SERVICE_ROLE_KEY` — para `getServiceClient()` (se usado em alguma rota).
- Chaves de IA: `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY` ou `KIMI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY` (ver `lib/ai-engines.ts`).

---

## Resumo

- **Um único app Next.js**: landing, auth, dashboard (ferramentas, biblioteca, perfil).
- **Ferramentas**: 12 ferramentas; prompts em `lib/hub-prompts.ts`; engines em `lib/ai-engines.ts`; uma API por ferramenta.
- **Persistência**: Supabase Auth + `omniprof_biblioteca` + `omniprof_uso_ia`. Nenhum uso de tabela de “professor” no código atual.
- **Plano**: exibido no perfil via `user_metadata.plan`; **não há** checkout nem webhooks de assinatura implementados.

Para qualquer nova feature (ex.: assinatura, limites por plano), o ponto de partida é este app Next.js e as tabelas Supabase listadas acima.
