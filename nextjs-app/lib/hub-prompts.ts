/**
 * Hub Prompts — OmniProf
 * Portado de hub_logic.py. Sem referências a inclusão/PEI/PAEE/deficiência.
 * Cada função retorna a string do prompt para enviar ao AI engine.
 */

export interface ChecklistAdaptacao {
    questoes_desafiadoras?: boolean;
    compreende_instrucoes_complexas?: boolean;
    instrucoes_passo_a_passo?: boolean;
    dividir_em_etapas?: boolean;
    paragrafos_curtos?: boolean;
    dicas_apoio?: boolean;
    compreende_figuras_linguagem?: boolean;
    descricao_imagens?: boolean;
    hiperfoco?: string; // Campo opcional — interesse específico do aluno
}

function buildChecklistInstrucoes(checklist?: ChecklistAdaptacao): string {
    if (!checklist) return "";
    const necessidades: string[] = [];
    if (checklist.questoes_desafiadoras) necessidades.push("Incluir questões mais desafiadoras");
    else necessidades.push("Manter nível acessível");
    if (!checklist.compreende_instrucoes_complexas) necessidades.push("Usar instruções simples");
    if (checklist.instrucoes_passo_a_passo) necessidades.push("Instruções passo a passo");
    if (checklist.dividir_em_etapas) necessidades.push("Dividir em etapas menores");
    if (checklist.paragrafos_curtos) necessidades.push("Parágrafos curtos");
    if (checklist.dicas_apoio) necessidades.push("Dicas de apoio");
    if (!checklist.compreende_figuras_linguagem) necessidades.push("Evitar figuras de linguagem complexas");
    if (checklist.descricao_imagens) necessidades.push("Descrição de imagens quando houver");
    if (checklist.hiperfoco) necessidades.push(`Usar "${checklist.hiperfoco}" como tema de conexão/interesse do estudante`);
    if (necessidades.length === 0) return "";
    return `\nCHECKLIST DE ADAPTAÇÃO:\n${necessidades.map(n => `- ${n}`).join("\n")}\nAplique 1-2 necessidades por questão.`;
}

/** Criar Itens — criação de itens avaliativos estruturados */
export function promptCriarItens(params: {
    assuntoInteresse: string;
    materia: string;
    objeto: string;
    qtd: number;
    tipo: "Objetiva" | "Discursiva" | "Mista";
    qtdImagens: number;
    nivelDificuldade?: string;
    verbosBloom?: string[];
    habilidadesBncc?: string[];
    modoProfundo?: boolean;
}): string {
    const { assuntoInteresse, materia, objeto, qtd, tipo, qtdImagens, nivelDificuldade, verbosBloom, habilidadesBncc, modoProfundo } = params;
    const tema = assuntoInteresse || "Geral";
    const nivel = nivelDificuldade || "Médio";

    const instrucaoImg = qtdImagens > 0
        ? `Incluir imagens em ${qtdImagens} questões (use [[GEN_IMG: termo]]). REGRA: tag [[GEN_IMG: termo]] APÓS enunciado e ANTES alternativas.`
        : "Sem imagens.";

    const instrucaoBloom = verbosBloom?.length
        ? `\n7. TAXONOMIA DE BLOOM: Use os verbos: ${verbosBloom.join(", ")}.\n   O verbo de comando no início do enunciado, em **NEGRITO** (Ex: **ANALISE**).`
        : "";

    const instrucaoHabilidades = habilidadesBncc?.length
        ? `\n8. HABILIDADES BNCC:\n${habilidadesBncc.map(h => `   - ${h}`).join("\n")}`
        : "";

    const diretrizTipo = tipo === "Discursiva"
        ? "3. FORMATO DISCURSIVO: questões abertas com espaço para desenvolvimento. NÃO inclua alternativas."
        : tipo === "Mista"
            ? "3. FORMATO MISTO: combine questões objetivas (múltipla escolha com 4-5 alternativas) e discursivas."
            : "3. FORMATO OBJETIVO: múltipla escolha com 4-5 alternativas, apenas UMA correta. Indique o gabarito ao final.";

    const diretrizNivel: Record<string, string> = {
        "Fácil": "Nível FÁCIL: questões diretas de reconhecimento e memorização. Enunciados curtos e claros. Contextualize de forma simples.",
        "Médio": "Nível MÉDIO: questões de compreensão e aplicação. Use textos-base curtos e situações do cotidiano.",
        "Difícil": "Nível DIFÍCIL: questões de análise e síntese. Use textos-base, gráficos, tabelas, charges ou situações-problema que exijam raciocínio.",
        "Avançado": "Nível AVANÇADO: questões de avaliação e criação (pensamento crítico). Interdisciplinaridade, múltiplas fontes, resolução de problemas complexos.",
    };

    const style = modoProfundo
        ? "ATUAR COMO: Banca examinadora rigorosa de concurso/vestibular."
        : "ATUAR COMO: Professor elaborador de avaliações estruturadas com foco pedagógico.";

    return `${style}

TAREFA: Crie ${qtd} questões de ${materia} — ${objeto}.

DIRETRIZES:
1. CONTEXTO REAL: Cada questão deve partir de uma situação real, texto-base, ou cenário concreto.
2. ASSUNTO DE INTERESSE (conexão com a turma): Incorpore "${tema}" como contexto em pelo menos 30% das questões.
${diretrizTipo}
4. ${diretrizNivel[nivel] || diretrizNivel["Médio"]}
5. Imagens: ${instrucaoImg}
6. ESTRUTURA DE CADA QUESTÃO:
   - Número da questão
   - Texto-base/contexto (quando aplicável)
   - Enunciado claro com verbo de comando no IMPERATIVO (Cite, Explique, Calcule, Analise)
   - Alternativas (se objetiva) ou espaço para resposta (se discursiva)
${instrucaoBloom}
${instrucaoHabilidades}

REGRAS OBRIGATÓRIAS:
- Verbos no IMPERATIVO. NÃO use infinitivo.
- Cada questão deve ser independente (sem dependência entre questões).
- Linguagem adequada ao nível de dificuldade ${nivel}.
- Alternativas incorretas devem ser PLAUSÍVEIS (distratores coerentes).

SAÍDA OBRIGATÓRIA:
[ANÁLISE PEDAGÓGICA]
Breve análise: distribuição dos níveis cognitivos, habilidades contempladas, coerência com a BNCC.
---DIVISOR---
[ATIVIDADE]
...questões estruturadas...`;
}

/** Experiência lúdica para Educação Infantil */
export function promptExperienciaEI(params: {
    campoExperiencia: string;
    objetivos: string[];
    assuntoInteresse: string;
}): string {
    const { campoExperiencia, objetivos, assuntoInteresse } = params;
    const objStr = objetivos.length ? objetivos.map(o => `- ${o}`).join("\n") : "Não especificados. Use objetivos gerais do campo.";
    const tema = assuntoInteresse || "brincadeiras e vivências";

    return `ATUAR COMO: Especialista em Educação Infantil (BNCC) e pedagogia do brincar.

Crie uma EXPERIÊNCIA LÚDICA (vivência intencional) para Educação Infantil.

CAMPO DE EXPERIÊNCIA (BNCC EI): ${campoExperiencia}

OBJETIVOS DE APRENDIZAGEM (BNCC):
${objStr}

TEMA DE INTERESSE (conexão com a turma): ${tema}

ESTRUTURA OBRIGATÓRIA:
1. **NOME DA EXPERIÊNCIA**
2. **OBJETIVO PEDAGÓGICO**
3. **MATERIAIS NECESSÁRIOS**
4. **PREPARAÇÃO DO AMBIENTE**
5. **PASSO A PASSO** (detalhado para o professor)
6. **DURAÇÃO ESTIMADA**
7. **AVALIAÇÃO** (observação, registro)

Use linguagem acessível. Foco em brincadeiras, interações e vivências.`;
}

/** Plano de Aula */
export function promptPlanoAula(params: {
    materia: string;
    assunto: string;
    metodologia: string;
    tecnica?: string;
    qtdAlunos: number;
    recursos: string[];
    habilidadesBncc?: string[];
    verbosBloom?: string[];
    ano?: string;
    duracaoMinutos?: number;
}): string {
    const { materia, assunto, metodologia, tecnica, qtdAlunos, recursos, habilidadesBncc, verbosBloom, ano, duracaoMinutos } = params;
    let infoBncc = "";
    if (habilidadesBncc?.length) infoBncc = habilidadesBncc.map(h => `\n- ${h}`).join("");
    if (ano) infoBncc = `\nAno: ${ano}` + infoBncc;
    const infoBloom = verbosBloom?.length ? `\nVerbos Bloom: ${verbosBloom.join(", ")}` : "";

    return `ATUAR COMO: Coordenador Pedagógico Especialista em BNCC e Metodologias Ativas.

PLANO DE AULA:
- Componente: ${materia}
- Tema: ${assunto}
- Metodologia: ${metodologia}
- Técnica: ${tecnica || "Não especificada"}
- Estudantes: ${qtdAlunos}
- Duração: ${duracaoMinutos || 50} min
- Recursos: ${recursos.join(", ")}
${infoBncc}
${infoBloom}

ESTRUTURA (Markdown):
## PLANO DE AULA: ${assunto}
### OBJETIVOS
### CONTEÚDOS
### TEMPO
### RECURSOS
### DESENVOLVIMENTO (Acolhida, Apresentação, Atividade, Socialização, Avaliação)
### ADAPTAÇÕES DUA
### RECUPERAÇÃO
### REFERÊNCIAS`;
}

/** Dinâmica de Grupo */
export function promptDinamica(params: {
    materia: string;
    assunto: string;
    qtdAlunos: number;
    caracteristicasTurma: string;
    habilidadesBncc?: string[];
    verbosBloom?: string[];
    ano?: string;
}): string {
    const { materia, assunto, qtdAlunos, caracteristicasTurma, habilidadesBncc, verbosBloom, ano } = params;
    let infoBncc = "";
    if (habilidadesBncc?.length) infoBncc = habilidadesBncc.map(h => `\n- ${h}`).join("");
    if (ano) infoBncc = `\nAno: ${ano}` + infoBncc;
    const infoBloom = verbosBloom?.length ? `\nVerbos Bloom: ${verbosBloom.join(", ")}` : "";

    return `Crie uma DINÂMICA para ${qtdAlunos} estudantes.

Componente: ${materia}. Tema: ${assunto}.
Características da turma: ${caracteristicasTurma}
${infoBncc}
${infoBloom}

ESTRUTURA:
1. NOME E OBJETIVO
2. MATERIAIS
3. PREPARAÇÃO
4. PASSO A PASSO (detalhado)
5. DURAÇÃO
6. AVALIAÇÃO
7. VARIAÇÕES`;
}

/** Papo de Mestre (Quebra-gelo) */
export function promptPapoMestre(params: {
    materia: string;
    assunto: string;
    assuntoInteresse: string;
    temaTurma?: string;
}): string {
    const { materia, assunto, assuntoInteresse, temaTurma } = params;
    return `Crie 3 sugestões de 'Papo de Mestre' (Quebra-gelo/Introdução) para conectar a turma à aula.
Componente: ${materia}. Assunto: ${assunto}.
Assunto de interesse (conexão com a turma): ${assuntoInteresse}.
Tema da turma (DUA): ${temaTurma || "Não informado"}.

Use o assunto de interesse ou tema da turma como PONTE para explicar ${assunto}.
Seja criativo e profundo.`;
}

/** Mapa Mental */
export function promptMapaMental(params: {
    temaCentral: string;
    ramificacoes?: string;
}): string {
    const { temaCentral, ramificacoes } = params;
    const ram = ramificacoes?.trim() || "O professor não especificou ramificações. Sugira 4-6 ramos principais.";
    return `Crie um MAPA MENTAL em Markdown/texto estruturado.

TEMA CENTRAL: ${temaCentral}

RAMIFICAÇÕES (sugestões do professor): ${ram}

Estrutura:
## ${temaCentral}
### Ramo 1
- Sub-item
### Ramo 2
...
Use ## para ramos principais e - para sub-itens.`;
}

/** Adaptar Prova / Adaptar Atividade (com checklist + hiperfoco) */
export function promptAdaptarConteudo(params: {
    texto: string;
    materia: string;
    tema: string;
    removerRespostas: boolean;
    checklist?: ChecklistAdaptacao;
    tipo: "prova" | "atividade";
}): string {
    const { texto, materia, tema, removerRespostas, checklist, tipo } = params;
    const instrucaoChecklist = buildChecklistInstrucoes(checklist);
    const style = checklist ? "Seja didático." : "Seja objetivo.";

    return `ESPECIALISTA EM DUA E DIFERENCIAÇÃO PEDAGÓGICA. ${style}
ADAPTE O CONTEÚDO (${tipo}) conforme checklist de adaptação.
${instrucaoChecklist}

SAÍDA OBRIGATÓRIA:
[ANÁLISE PEDAGÓGICA]
...análise...
---DIVISOR---
[ATIVIDADE]
...${tipo} adaptada...

CONTEXTO: ${materia} | ${tema}. ${removerRespostas ? "REMOVA GABARITO." : ""}
TEXTO ORIGINAL: ${texto}`;
}

/** Rotina Visual (adaptado de Rotina AVD para educação geral) */
export function promptRotinaVisual(params: {
    tipoRotina: string;
    turma: string;
    periodo: string;
    observacoes?: string;
}): string {
    const { tipoRotina, turma, periodo, observacoes } = params;
    return `ATUAR COMO: Especialista em organização pedagógica e rotinas escolares.

Crie uma ROTINA VISUAL para uso em sala de aula.

TIPO DE ROTINA: ${tipoRotina}
TURMA: ${turma}
PERÍODO: ${periodo}
OBSERVAÇÕES: ${observacoes || "Nenhuma"}

ESTRUTURA:
1. **TÍTULO DA ROTINA**
2. **OBJETIVO** (por que essa rotina é importante)
3. **HORÁRIOS E ATIVIDADES** (tabela organizada)
4. **ÍCONES/SÍMBOLOS SUGERIDOS** (para versão visual)
5. **ADAPTAÇÕES** (como personalizar para diferentes turmas)
6. **DICAS DE IMPLEMENTAÇÃO**

Use linguagem clara e direta. A rotina deve ser fácil de seguir por qualquer professor.`;
}

/** Atividades Lúdicas (adaptado de Inclusão no Brincar para educação geral) */
export function promptAtividadesLudicas(params: {
    faixaEtaria: string;
    objetivo: string;
    espaco: string;
    materiais?: string;
}): string {
    const { faixaEtaria, objetivo, espaco, materiais } = params;
    return `ATUAR COMO: Especialista em pedagogia do brincar e educação infantil.

Crie uma ATIVIDADE LÚDICA para uso em sala de aula/espaço educativo.

FAIXA ETÁRIA: ${faixaEtaria}
OBJETIVO PEDAGÓGICO: ${objetivo}
ESPAÇO DISPONÍVEL: ${espaco}
MATERIAIS DISPONÍVEIS: ${materiais || "Materiais simples e acessíveis"}

ESTRUTURA:
1. **NOME DA ATIVIDADE**
2. **OBJETIVO** (pedagógico + social)
3. **MATERIAIS**
4. **PREPARAÇÃO DO ESPAÇO**
5. **COMO BRINCAR** (passo a passo detalhado)
6. **VARIAÇÕES** (adaptar para diferentes idades/contextos)
7. **MEDIAÇÃO DO PROFESSOR** (o que observar e como intervir)
8. **DURAÇÃO ESTIMADA**

Foco em brincadeiras que promovam interação, criatividade e aprendizado.`;
}

/** Sequência Didática (NOVO — usa todos os módulos) */
export function promptSequenciaDidatica(params: {
    materia: string;
    tema: string;
    ano: string;
    duracaoAulas: number;
    objetivos: string;
    habilidadesBncc?: string[];
    metodologia?: string;
    recursos?: string[];
}): string {
    const { materia, tema, ano, duracaoAulas, objetivos, habilidadesBncc, metodologia, recursos } = params;
    const infoBncc = habilidadesBncc?.length
        ? `\nHABILIDADES BNCC:\n${habilidadesBncc.map(h => `- ${h}`).join("\n")}`
        : "";

    return `ATUAR COMO: Coordenador Pedagógico Especialista em Planejamento e BNCC.

Elabore uma SEQUÊNCIA DIDÁTICA completa.

COMPONENTE CURRICULAR: ${materia}
TEMA/CONTEÚDO: ${tema}
ANO/SÉRIE: ${ano}
DURAÇÃO: ${duracaoAulas} aulas
OBJETIVOS: ${objetivos}
METODOLOGIA: ${metodologia || "A critério do planejamento"}
RECURSOS: ${recursos?.join(", ") || "A definir"}
${infoBncc}

ESTRUTURA OBRIGATÓRIA (Markdown):

## SEQUÊNCIA DIDÁTICA: ${tema}

### 1. APRESENTAÇÃO
- Justificativa e contextualização

### 2. OBJETIVOS DE APRENDIZAGEM
- Geral e específicos (alinhados à BNCC)

### 3. CONTEÚDOS
- Conceituais, procedimentais e atitudinais

### 4. DESENVOLVIMENTO (AULA A AULA)
Para CADA AULA (${duracaoAulas} aulas), detalhe:
- **Aula X:** Tema, atividades, recursos, tempo

### 5. AVALIAÇÃO
- Formativa (durante) + Somativa (final)
- Critérios e instrumentos

### 6. RECURSOS NECESSÁRIOS

### 7. REFERÊNCIAS

Seja detalhado e prático. O professor deve conseguir aplicar diretamente.`;
}

/** Gerar Imagem Educacional */
export function promptGerarImagem(params: {
    descricao: string;
    feedback?: string;
}): string {
    const { descricao, feedback } = params;
    let texto = (descricao || "").trim();
    if (feedback) texto = `${texto}. Ajuste solicitado: ${feedback}`;
    return `Ilustração educacional, estilo vetorial plano, fundo claro.
REGRA OBRIGATÓRIA: NÃO inclua texto, palavras, letras ou números na imagem.
Apenas a representação visual do conceito. Público: Brasil. Proporção quadrada (1:1).
Cena a representar: ${texto.slice(0, 2000)}`;
}

/** Divide o resultado em análise pedagógica + conteúdo. */
export function splitAnaliseConteudo(fullText: string): { analise: string; conteudo: string } {
    if (fullText.includes("---DIVISOR---")) {
        const parts = fullText.split("---DIVISOR---");
        return {
            analise: parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").trim(),
            conteudo: parts[1].replace("[ATIVIDADE]", "").trim(),
        };
    }
    return { analise: "", conteudo: fullText };
}
