# Comparação detalhada: OmniProf Next.js × Hub Omnisfera

Cada aspecto comparado entre o **Hub de Recursos** da Omnisfera (pasta `inclusao/nextjs-app`) e o **OmniProf** (esta pasta), para alinhar ou diferenciar com precisão.

---

## 1. Propósito e contexto

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Produto** | Módulo dentro da plataforma de inclusão (PEI, PAEE, workspace, estudantes). | App independente para professores, venda direta por assinatura. |
| **Público** | Equipe pedagógica da escola, com estudantes cadastrados e PEI. | Professor individual, sem vínculo com PEI/PAEE ou estudantes. |
| **Contexto de uso** | Sempre com **estudante selecionado**: nome, série, hiperfoco e PEI alimentam as ferramentas. | Sem estudante: “assunto de interesse” no lugar de hiperfoco; checklist de adaptação opcional (genérico). |
| **Persistência** | Recursos gerados no Hub **não são salvos** na plataforma (recomenda-se registrar no Diário). | **Biblioteca** pessoal: salvar, listar, filtrar e excluir itens por ferramenta. |

---

## 2. Autenticação e sessão

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Auth** | Sessão própria (`getSession()`), cookie, tabela `members` com `workspace_id`. | **Supabase Auth** (email/senha), JWT em cookie. |
| **Escopo** | Usuário pertence a um **workspace**; estudantes e PEI são do workspace. | Usuário único; não existe workspace. |
| **Permissão Hub** | `can_hub` no member; Navbar e rotas checam permissão. | Não há permissão “hub”; quem está logado acessa ferramentas. |
| **Login/Cadastro** | Login via API (`/api/auth/login`) com credenciais; session payload com member e permissions. | Login/cadastro direto com Supabase Auth; redirect para `/ferramentas`. |

---

## 3. Estrutura da página “central de ferramentas”

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Rota** | `/hub` (dentro do dashboard). | `/ferramentas` (dentro do dashboard). |
| **Componente** | `HubClient.tsx` (~3.6k linhas): tudo em um arquivo (selector de estudante + grid de tools + um painel por ferramenta). | `ferramentas/page.tsx` (grid) + `ferramentas/[tool]/page.tsx` (página por ferramenta). |
| **Navegação** | **Estado local** `activeTool`: clica no card → abre o painel da ferramenta **na mesma página** (accordion/expand). | **Rotas**: cada card é um **Link** para `/ferramentas/[tool]` (página nova por ferramenta). |
| **Título/descrição** | `PageHero`: "Hub de Recursos" / "Adaptar provas, atividades, criar do zero e muito mais." | `PageHero`: "Ferramentas" / "11 ferramentas com IA para criar materiais didáticos incríveis, alinhados à BNCC." |

---

## 4. Seleção de estudante e contexto

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Selector** | **StudentSelector** obrigatório: lista de estudantes do workspace; `?student=id` na URL. | **Não existe**: não há estudante nem workspace. |
| **Painel do estudante** | Após selecionar: nome, série, **hiperfoco** (do PEI); aviso “Modo Educação Infantil” quando EI. | Não existe. |
| **PEI** | **PEISummaryPanel** e dados `pei_data` (habilidades BNCC, idade EI, campo, objetivos) pré-preenchem formulários. | Não existe PEI; formulários livres (BNCC escolhida manualmente). |
| **Comportamento sem estudante** | Mensagem: “Selecione um estudante para usar as ferramentas do Hub com contexto personalizado.” | Não se aplica; professor usa direto. |

---

## 5. Lista de ferramentas (grid)

| Hub Omnisfera | OmniProf |
|---------------|----------|
| **EF/EM (8)** | **12 ferramentas** (uma lista única; não troca por segmento na UI): |
| • Adaptar Prova | • Criar Itens |
| • Adaptar Atividade | • Plano de Aula |
| • Criar do Zero | • Dinâmica |
| • Estúdio Visual | • Papo de Mestre |
| • Roteiro Individual | • Mapa Mental |
| • Papo de Mestre | • Estúdio Visual |
| • Dinâmica Inclusiva | • Adaptar Prova |
| • Plano de Aula DUA | • Adaptar Atividade |
| **EI (4)** | • Rotina Visual |
| • Criar Experiência | • Atividades Lúdicas |
| • Estúdio Visual & CAA | • Sequência Didática |
| • Rotina & AVD | • Criar Experiência EI |
| • Inclusão no Brincar | |

**Diferenças de conteúdo:**

- **Hub** alterna lista por **segmento** (EI vs EF/EM); **OmniProf** mostra as 12 de uma vez.
- **Hub** tem **Roteiro Individual** (passo a passo de aula personalizado); **OmniProf** tem **Sequência Didática** (sequências de conteúdo).
- **Hub** tem **Inclusão no Brincar** (EI); **OmniProf** tem **Atividades Lúdicas** (EI) e **Rotina Visual** (equivalente conceitual a Rotina & AVD).
- **Mapa Mental**: no Hub é usado **dentro** do Plano de Aula (subchamada); no OmniProf é **ferramenta própria** no grid.
- **Criar do Zero** (Hub) ≈ **Criar Itens** (OmniProf); **Plano de Aula DUA** (Hub) ≈ **Plano de Aula** (OmniProf), sem ênfase DUA na UI.

---

## 6. Card de ferramenta (ToolCard)

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Elemento** | `<button>`: clica → alterna `activeTool` (abre/fecha painel na mesma página). | `<Link>`: navega para `/ferramentas/[tool]`. |
| **Visual** | Card com **Lottie** por ferramenta (`HUB_LOTTIE_MAP`), hover = animação; estado ativo = borda cyan, `scale-[1.01]`. | Card com **ícone Lucide** estático; cor `tool.color` (#2B6B8A); sem Lottie. |
| **Layout** | `min-h-[160px]`, ícone 72×72, rounded-xl, `from-slate-50 to-white`, borda slate/cyan. | Mesmo layout (replica declarada no código): 72×72, mesmo padding e sombras. |
| **Grid** | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`. | Idem. |

---

## 7. PageHero

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Ícone** | `iconName` (string) + **Lottie** (`useLottie`, `lottieMapOutlineColored`); fallback placeholder até montar. | **Lucide** (`icon: LucideIcon`); ícone estático. |
| **Cores** | `getColorClasses(color)` → `lib/colors.ts` (palette por módulo: audio, video, mindmap, etc.). | `COLOR_MAP` local no componente (blue, cyan, rose, etc.); brand blue #2B6B8A. |
| **Estrutura** | Barra superior (gradient), ícone 64×64, título + descrição; hover aumenta sombra. | Mesma estrutura (barra, ícone 64×64, título, descrição); comentário “matching Omnisfera's getColorClasses”. |
| **Hub** | color `"cyan"` para Hub. | Ferramentas: `color="blue"`. |

---

## 8. Seleção de motor de IA (Engine)

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Componente** | **EngineSelector**: `<details>` com 3 engines (Red, Blue, Green); `name="hub_engine"`. | Inline na página da ferramenta: **5 engines** (Red, Blue, Green, Yellow, Orange) como botões pill. |
| **Cores** | Texto cyan quando selecionado; radio buttons. | Cada engine com gradiente próprio (`ENGINE_COLORS`: red, blue, green, yellow, purple); pill ativa com gradiente. |
| **Nomes** | "🔴 Red", "🔵 Blue", "🟢 Green". | "OmniRed (DeepSeek)", "OmniBlue (Kimi)", etc. (`ENGINE_NAMES`). |
| **Back-end** | `ai-engines.ts` define 5 engines; UI expõe só 3. | Mesmo `ai-engines.ts` (5 engines); UI expõe as 5. |

---

## 9. Formulários e fluxo por ferramenta

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Arquitetura** | Um **componente por ferramenta** dentro de `HubClient.tsx` (CriarDoZero, PapoDeMestre, PlanoAulaDua, AdaptarProva, AdaptarAtividade, EstudioVisual, RotinaAvdTool, InclusaoBrincarTool, RoteiroIndividual, DinamicaInclusiva). | **Uma rota dinâmica** `/ferramentas/[tool]` + um único componente **ToolForm** que monta campos conforme `toolId`. |
| **BNCC** | Chamadas a `/api/bncc/ef`, `/api/bncc/ei`, `/api/bncc/em` e `/api/bncc/ef?estrutura=1`; disciplinas → unidades → objetos → habilidades. | Uma API `/api/bncc` com query params (`nivel`, etc.); componente **BnccSelector**. |
| **Checklist adaptação** | Checklist de adaptação **ligado ao PEI** (instruções baseadas no perfil do estudante). | Checklist genérico; campo opcional “assunto de interesse” / “hiperfoco” (texto livre). |
| **Upload** | Adaptar Prova / Adaptar Atividade: upload DOCX → `/api/hub/extrair-docx`; Adaptar Atividade também upload de imagem + crop. | Mesmo fluxo: extrair-docx e upload de imagem com **ImageCropper**. |
| **Fechar painel** | Botão/ação `onClose()` → `setActiveTool(null)`. | Navegação (voltar ou clicar em outra ferramenta). |

---

## 10. APIs de geração

| Hub Omnisfera (`/api/hub/...`) | OmniProf (`/api/ferramentas/...`) |
|--------------------------------|-----------------------------------|
| `criar-atividade` | `criar-itens` (+ branch EI → `criar-experiencia`) |
| `plano-aula` | `plano-aula` |
| `dinamica` | `dinamica` |
| `papo-mestre` | `papo-mestre` |
| `mapa-mental` (usado dentro do plano) | `mapa-mental` (rota própria) |
| `rotina-avd` | `rotina-visual` |
| `inclusao-brincar` | `atividades-ludicas` |
| `roteiro` | **Não existe**; há `sequencia-didatica` (conceito diferente) |
| `adaptar-prova` + `extrair-docx` | `adaptar-prova` + `extrair-docx` |
| `adaptar-atividade` | `adaptar-atividade` |
| `estudio-imagem` / `gerar-imagem` | `gerar-imagem`, `gerar-imagem-inline` |
| `gerar-docx` (conversão de texto → DOCX) | Export DOCX no cliente (lib `export-service` ou similar) |

**Autenticação das rotas:** Hub usa sessão (middleware/contexto); OmniProf usa `getUser()` (Supabase) nas rotas que precisam de usuário (ex.: biblioteca, perfil; ferramentas podem ou não checar usuário).

---

## 11. Prompts (hub-prompts)

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Arquivo** | `lib/hub-prompts.ts` — “Serviço de Prompts para o Hub de Inclusão”. | `lib/hub-prompts.ts` — “Portado de hub_logic.py. Sem referências a inclusão/PEI/PAEE/deficiência.” |
| **Criar atividade** | `criarPromptProfissional`: parâmetro **hiperfoco**; **checklist_adaptacao** detalhado (“baseado no PEI”); instruções de Bloom e BNCC rigorosas. | `promptCriarItens`: **assuntoInteresse** no lugar de hiperfoco; checklist opcional; suporte a tipo **Mista** (Objetiva+Discursiva); **nivelDificuldade**. |
| **Plano de aula** | `gerarPromptPlanoAula`: foco **DUA** (Desenho Universal); contexto estudante. | `promptPlanoAula`: BNCC + Bloom + metodologias; sem menção a DUA/estudante. |
| **Adaptar prova/atividade** | Prompts de adaptação com **hiperfoco** e checklist ligado ao perfil do aluno. | `promptAdaptarConteudo` com checklist genérico e **hiperfoco** opcional (texto livre). |
| **Experiência EI** | Integrado no fluxo “Criar do Zero” em modo EI. | `promptExperienciaEI` em rota separada `criar-experiencia`. |

---

## 12. Pós-geração (resultado, export, salvamento)

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Exibição** | **FormattedTextDisplay** para markdown; substituição de `[[GEN_IMG: ...]]` por imagens (gerar-imagem inline). | Mesmo: **FormattedTextDisplay** + mapa de imagens. |
| **Export PDF** | **PdfDownloadButton** (lib `pdf-download`). | Botão “PDF” na página que chama export no cliente (ex.: jsPDF). |
| **Export DOCX** | **DocxDownloadButton** → POST `/api/hub/gerar-docx` (servidor gera o arquivo). | Botão “DOCX” usando `export-service` (geração no cliente ou via API, conforme implementação). |
| **Validar resultado** | Não há botão “Validar resultado” explícito no fluxo descrito. | Botão “Validar resultado” + estado “Resultado validado ✓”. |
| **Refazer com ajustes** | Possível em alguns painéis (feedback em texto). | “Refazer com ajustes” + textarea de feedback + “Regenerar com ajustes”. |
| **Salvar** | Não persiste no app; orientação para registrar no Diário. | Botão “Salvar na Biblioteca” → POST `/api/biblioteca`; estado “Salvo na Biblioteca ✓”. |
| **Descartar** | Limpar resultado no estado. | Botão “Descartar”. |

---

## 13. Layout e design system

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **globals.css** | “Omnisfera — Premium Design System”; tokens de sombra, radius, surface; noise overlay; sem variáveis de marca específicas no :root. | “OmniProf — Premium Design System (copied from Omnisfera)”; **brand-blue**, **brand-red** e variantes; mesmas sombras/radius. |
| **Background dashboard** | `from-slate-50 via-blue-50/15 to-sky-50/10`. | `from-slate-50 via-[#EDF5F9]/20 to-[#FDF2F2]/10` (tons brand). |
| **Navbar** | Múltiplos itens (Home, Estudantes, PEI, PAEE, Hub, Diário, etc.) com **permissões** e ícones **Phosphor** + Lottie; cor do Hub = verde. | Poucos itens: Ferramentas, Biblioteca, Perfil; ícones **Lucide**; cores por rota (Ferramentas = brand blue). |
| **Footer** | **Footer** presente no layout do dashboard. | Sem footer no layout. |
| **Extras** | **AILoadingOverlay**, **AIEnginesBadge**, **SimulationBanner**, **TermsOfUseModal**. | Sem overlay de loading global; sem badge de engines; sem banner de simulação. |

---

## 14. BNCC

| Aspecto | Hub Omnisfera | OmniProf |
|--------|----------------|----------|
| **Rotas API** | `/api/bncc/ef`, `/api/bncc/ei`, `/api/bncc/em`, `/api/bncc/sugerir-habilidades`. | `/api/bncc` (GET) com params; rota pública no middleware. |
| **Estrutura EF** | Por série; estrutura completa (disciplinas → unidades → objetos → habilidades). | Provável uso de `nivel` e params para EI/EF/EM; estrutura pode ser simplificada. |
| **Uso** | Hub e PEI consomem; PEI pré-seleciona habilidades. | Só nas ferramentas; usuário escolhe no **BnccSelector**. |

---

## 15. Resumo: o que é igual, o que foi removido, o que foi adicionado

**Igual ou muito próximo:**

- Design system base (sombras, radius, tipografia, noise).
- Estilo do ToolCard (tamanho, grid, ícone 72×72) — OmniProf sem Lottie.
- PageHero (estrutura; OmniProf sem Lottie).
- FormattedTextDisplay, ImageCropper, fluxo de upload DOCX e imagem.
- Cinco engines no back-end; nomes e chaves de ambiente.
- Conjunto de prompts “derivados” do mesmo Hub (sem PEI/estudante no OmniProf).

**Removido no OmniProf:**

- Estudante, workspace, PEI, PAEE.
- StudentSelector, PEISummaryPanel.
- Permissão `can_hub` e gestão de members.
- Roteiro Individual (substituído em conceito por Sequência Didática).
- Inclusão no Brincar (substituída por Atividades Lúdicas + Rotina Visual).
- Lottie nos cards e no PageHero.
- EngineSelector com só 3 engines (no OmniProf são 5 na UI).
- API `/api/hub/gerar-docx` (no OmniProf a exportação pode ser no cliente).
- AILoadingOverlay, AIEnginesBadge, SimulationBanner, Footer.

**Adicionado no OmniProf:**

- **Biblioteca**: persistência, listagem, filtro, exclusão.
- **Perfil**: nome, plano (free/pro/escola), estatísticas (biblioteca, gerações), alterar senha.
- **Landing** pública e cadastro com Supabase Auth.
- **Mapa Mental** e **Sequência Didática** como ferramentas de primeiro nível.
- **Rotina Visual** e **Atividades Lúdicas** (nomes e fluxos próprios).
- Botões “Validar resultado”, “Salvar na Biblioteca”, “Refazer com ajustes”.
- Navegação por **URL** por ferramenta (`/ferramentas/[tool]`) em vez de um único painel com estado.

Use este documento para alinhar detalhes de UI/UX, nomes de ferramentas, ou para replicar comportamentos do Hub no OmniProf (ou o contrário) ponto a ponto.
