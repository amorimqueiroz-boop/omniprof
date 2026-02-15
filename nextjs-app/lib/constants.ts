/**
 * Constantes do OmniProf — portado de constantes.py
 */

export const SEGMENTOS = [
    { id: "EI", label: "Educação Infantil" },
    { id: "EFAI", label: "EF - Anos Iniciais (1º ao 5º)" },
    { id: "EFAF", label: "EF - Anos Finais (6º ao 9º)" },
    { id: "EM", label: "Ensino Médio" },
] as const;

export type SegmentoId = (typeof SEGMENTOS)[number]["id"];

export const COMPONENTES_EI = ["Educação Infantil"];

export const COMPONENTES_EF = [
    "Arte", "Matemática", "Português", "Ciências", "História", "Geografia",
    "Educação Física", "Inglês", "Língua Portuguesa",
];

export const COMPONENTES_EM = [
    "Ciências da Natureza e suas Tecnologias",
    "Ciências Humanas e Sociais Aplicadas",
    "Linguagens e suas Tecnologias",
    "Matemática e suas Tecnologias",
];

export const DISCIPLINAS_PADRAO = [
    "Educação Infantil", "Matemática", "Português", "Ciências", "História", "Geografia",
    "Artes", "Educação Física", "Inglês", "Filosofia", "Sociologia", "Biologia", "Física", "Química",
];

export const TAXONOMIA_BLOOM: Record<string, string[]> = {
    "1. Lembrar (Memorizar)": ["Citar", "Definir", "Identificar", "Listar", "Nomear", "Reconhecer", "Recordar", "Relacionar", "Repetir", "Sublinhar"],
    "2. Entender (Compreender)": ["Classificar", "Descrever", "Discutir", "Explicar", "Expressar", "Identificar", "Localizar", "Narrar", "Reafirmar", "Reportar", "Resumir", "Traduzir"],
    "3. Aplicar": ["Aplicar", "Demonstrar", "Dramatizar", "Empregar", "Esboçar", "Ilustrar", "Interpretar", "Operar", "Praticar", "Programar", "Usar"],
    "4. Analisar": ["Analisar", "Calcular", "Categorizar", "Comparar", "Contrastar", "Criticar", "Diferenciar", "Discriminar", "Distinguir", "Examinar", "Experimentar", "Testar"],
    "5. Avaliar": ["Argumentar", "Avaliar", "Defender", "Escolher", "Estimar", "Julgar", "Prever", "Selecionar", "Suportar", "Validar", "Valorizar"],
    "6. Criar": ["Compor", "Construir", "Criar", "Desenhar", "Desenvolver", "Formular", "Investigar", "Planejar", "Produzir", "Propor"],
};

export const METODOLOGIAS = [
    "Aula Expositiva Dialogada",
    "Metodologia Ativa",
    "Aprendizagem Baseada em Problemas",
    "Ensino Híbrido",
    "Sala de Aula Invertida",
    "Rotação por Estações",
];

export const TECNICAS_ATIVAS = [
    "Gamificação",
    "Sala de Aula Invertida",
    "Aprendizagem Baseada em Projetos (PBL)",
    "Rotação por Estações",
    "Peer Instruction",
    "Estudo de Caso",
    "Aprendizagem Cooperativa",
];

export const RECURSOS_DISPONIVEIS = [
    "Quadro/Giz", "Projetor/Datashow", "Lousa Digital", "Tablets/Celulares",
    "Internet", "Materiais Maker (Papel, Cola, etc)", "Jogos de Tabuleiro",
    "Laboratório", "Material Dourado", "Vídeos Educativos",
];

/**
 * Ferramentas disponíveis no OmniProf.
 */
export const FERRAMENTAS = [
    { id: "criar-itens", label: "Criar Itens", icon: "Sparkles", description: "Crie atividades com critérios pedagógicos, BNCC e Bloom.", color: "#2B6B8A" },
    { id: "plano-aula", label: "Plano de Aula", icon: "BookOpen", description: "Planos completos com metodologia, BNCC e recursos.", color: "#2B6B8A" },
    { id: "dinamica", label: "Dinâmica", icon: "Users", description: "Dinâmicas de grupo para engajar a turma.", color: "#2B6B8A" },
    { id: "papo-mestre", label: "Papo de Mestre", icon: "MessageCircle", description: "Quebra-gelo e introduções criativas para conectar a aula.", color: "#2B6B8A" },
    { id: "mapa-mental", label: "Mapa Mental", icon: "Network", description: "Mapas mentais estruturados a partir de qualquer tema.", color: "#2B6B8A" },
    { id: "estudio-visual", label: "Estúdio Visual", icon: "Image", description: "Gere ilustrações educacionais com IA.", color: "#2B6B8A" },
    { id: "adaptar-prova", label: "Adaptar Prova", icon: "FileEdit", description: "Adapte provas com checklist e hiperfoco opcional.", color: "#2B6B8A" },
    { id: "adaptar-atividade", label: "Adaptar Atividade", icon: "Scissors", description: "Adapte atividades com checklist e hiperfoco opcional.", color: "#2B6B8A" },
    { id: "rotina-visual", label: "Rotina Visual", icon: "Clock", description: "Organize rotinas e atividades visuais para a turma.", color: "#2B6B8A" },
    { id: "atividades-ludicas", label: "Atividades Lúdicas", icon: "Gamepad2", description: "Experiências lúdicas para Educação Infantil.", color: "#2B6B8A" },
    { id: "sequencia-didatica", label: "Sequência Didática", icon: "ListOrdered", description: "Sequências didáticas completas de conteúdo.", color: "#2B6B8A" },
    { id: "criar-experiencia", label: "Criar Experiência EI", icon: "Star", description: "Experiências lúdicas para Educação Infantil (BNCC EI).", color: "#2B6B8A" },
] as const;

export type FerramentaId = (typeof FERRAMENTAS)[number]["id"];

/** IDs de ferramentas por segmento (Educação Infantil vs EF/EM) */
export const FERRAMENTAS_EI: FerramentaId[] = [
    "criar-experiencia",
    "estudio-visual",
    "rotina-visual",
    "atividades-ludicas",
];

/** Ferramentas para EF e EM (Anos Iniciais, Anos Finais, Ensino Médio) */
export const FERRAMENTAS_EF_EM: FerramentaId[] = [
    "criar-itens",
    "plano-aula",
    "dinamica",
    "papo-mestre",
    "mapa-mental",
    "estudio-visual",
    "adaptar-prova",
    "adaptar-atividade",
    "rotina-visual",
    "sequencia-didatica",
];

export function getFerramentasPorSegmento(segmento: SegmentoId): typeof FERRAMENTAS {
    if (segmento === "EI") {
        return FERRAMENTAS.filter((f) => (FERRAMENTAS_EI as string[]).includes(f.id)) as typeof FERRAMENTAS;
    }
    return FERRAMENTAS.filter((f) => (FERRAMENTAS_EF_EM as string[]).includes(f.id)) as typeof FERRAMENTAS;
}
