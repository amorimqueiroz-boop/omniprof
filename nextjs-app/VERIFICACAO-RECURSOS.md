# Verificação dos recursos (ferramentas) — OmniProf

## Correção aplicada: módulo BNCC

### Problema
O **BnccSelector** usava variáveis CSS que **não existiam** no `globals.css` do OmniProf, deixando o bloco BNCC com aparência quebrada (texto/bordas invisíveis ou cores erradas):

- `var(--primary-light)`
- `var(--text-dark)`
- `var(--text-muted)`
- `var(--text-light)`
- `var(--border-light)`
- `var(--danger)`

As classes `.select-field` e `.input-field` também não existiam (só inline styles no componente).

### Ajustes feitos

1. **`app/globals.css`**
   - Em `:root`:
     - `--primary-light`: `var(--brand-blue-light)`
     - `--text-dark`: `#0f172a`
     - `--text-muted`: `#64748b`
     - `--text-light`: `#94a3b8`
     - `--border-light`: `#e2e8f0`
     - `--danger`: `var(--brand-red)`
   - Classes de formulário:
     - `.select-field`: `width: 100%`, cor, focus (borda + box-shadow)
     - `.input-field`: `width: 100%`, borda, placeholder, focus

Com isso, o bloco “BNCC — Habilidades Curriculares” passa a exibir corretamente:
- Etapa de Ensino (EI, EFAI, EFAF, EM)
- Componente / Campo / Área
- Ano ou Faixa Etária (EF/EI)
- Lista de habilidades com busca e seleção

---

## Fluxo BNCC (resumo)

- **API:** `GET /api/bncc?nivel=...&componente=...&ano=...` (ou `idade=` para EI).
- **Dados:** CSVs em `public/data/` (`bncc_ef.csv`, `bncc_ei.csv`, `bncc_em.csv`).
- **EI:** Idade + Campo de Experiência → objetivos; parser espera formato `(EI03CG01) Descrição`.
- **EF:** Disciplina + Ano (opcional); coluna Ano no CSV no formato `1º, 2º, ...`.
- **EM:** Área de conhecimento → habilidades.

---

## Checklist por ferramenta (teste manual sugerido)

| Ferramenta           | Depende de BNCC | Observação |
|----------------------|-----------------|------------|
| Criar Itens          | Sim (BnccSelector) | Após a correção, seleção de etapa → componente → ano → habilidades deve aparecer e enviar `habilidadesBncc`. |
| Plano de Aula        | Sim             | Idem; campo “Assunto” + metodologia/duração. API usa `materia` (pode vir vazio; prompt usa habilidades). |
| Dinâmica             | Sim             | Assunto + BNCC + Bloom. |
| Papo de Mestre       | Não             | Componente curricular (lista fixa) + assunto + interesse/hiperfoco. |
| Mapa Mental          | Não             | Tema central + ramificações. |
| Estúdio Visual       | Não             | Prompt + prioridade (BANCO/IA). |
| Adaptar Prova        | Não (upload)    | DOCX ou texto + checklist. |
| Adaptar Atividade    | Não (upload)    | Imagem ou texto + checklist. |
| Rotina Visual        | Sim (BnccSelector) | Verificar se habilidades/contexto são enviados corretamente. |
| Atividades Lúdicas   | Sim             | Idem. |
| Sequência Didática   | Sim             | Idem. |
| Criar Experiência EI | Sim (EI)        | Campo + objetivos BNCC EI; conferir se faixa etária e campo preenchem e retornam objetivos. |

---

## Outros pontos já conferidos

- **Resposta das APIs:** Todas as rotas de ferramentas que devolvem texto usam `{ result }` ou `{ conteudo, analise }`; o cliente usa `data.conteudo || data.result`, então está consistente.
- **Payload:** O front envia `formData` + `engine` em JSON; adaptar-atividade com imagem usa `FormData` com `file` e `meta`. As rotas usam `parseBody` com tipos compatíveis.

Se algo ainda falhar em alguma ferramenta (ex.: dropdown vazio, habilidades não carregam), verificar:
1. Se os CSVs existem em `public/data/` e têm encoding/cabeçalhos corretos.
2. Console do navegador e resposta de `GET /api/bncc?nivel=...` para ver se `componentes` e `habilidades` vêm preenchidos.
