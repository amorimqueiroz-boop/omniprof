# constantes.py — Constantes Omnicraft (independente)

# Segmentos (BNCC) — definem qual estrutura usar
SEGMENTOS = [
    ("EI", "Educação Infantil"),
    ("EFAI", "EF - Anos Iniciais (1º ao 5º)"),
    ("EFAF", "EF - Anos Finais (6º ao 9º)"),
    ("EM", "Ensino Médio"),
]

# Componentes por segmento (labels para exibição)
COMPONENTES_EI = ["Educação Infantil"]
# EF: disciplinas vêm do bncc.csv; lista padrão para fallback
COMPONENTES_EF = [
    "Arte", "Matemática", "Português", "Ciências", "História", "Geografia",
    "Educação Física", "Inglês", "Língua Portuguesa",
]
# EM: áreas de conhecimento do bncc_em.csv
COMPONENTES_EM = [
    "Ciências da Natureza e suas Tecnologias",
    "Ciências Humanas e Sociais Aplicadas",
    "Linguagens e suas Tecnologias",
    "Matemática e suas Tecnologias",
]

TAXONOMIA_BLOOM = {
    "1. Lembrar (Memorizar)": ["Citar", "Definir", "Identificar", "Listar", "Nomear", "Reconhecer", "Recordar", "Relacionar", "Repetir", "Sublinhar"],
    "2. Entender (Compreender)": ["Classificar", "Descrever", "Discutir", "Explicar", "Expressar", "Identificar", "Localizar", "Narrar", "Reafirmar", "Reportar", "Resumir", "Traduzir"],
    "3. Aplicar": ["Aplicar", "Demonstrar", "Dramatizar", "Empregar", "Esboçar", "Ilustrar", "Interpretar", "Operar", "Praticar", "Programar", "Usar"],
    "4. Analisar": ["Analisar", "Calcular", "Categorizar", "Comparar", "Contrastar", "Criticar", "Diferenciar", "Discriminar", "Distinguir", "Examinar", "Experimentar", "Testar"],
    "5. Avaliar": ["Argumentar", "Avaliar", "Defender", "Escolher", "Estimar", "Julgar", "Prever", "Selecionar", "Suportar", "Validar", "Valorizar"],
    "6. Criar": ["Compor", "Construir", "Criar", "Desenhar", "Desenvolver", "Formular", "Investigar", "Planejar", "Produzir", "Propor"],
}

DISCIPLINAS_PADRAO = [
    "Educação Infantil", "Matemática", "Português", "Ciências", "História", "Geografia",
    "Artes", "Educação Física", "Inglês", "Filosofia", "Sociologia", "Biologia", "Física", "Química",
]

METODOLOGIAS = [
    "Aula Expositiva Dialogada",
    "Metodologia Ativa",
    "Aprendizagem Baseada em Problemas",
    "Ensino Híbrido",
    "Sala de Aula Invertida",
    "Rotação por Estações",
]

TECNICAS_ATIVAS = [
    "Gamificação",
    "Sala de Aula Invertida",
    "Aprendizagem Baseada em Projetos (PBL)",
    "Rotação por Estações",
    "Peer Instruction",
    "Estudo de Caso",
    "Aprendizagem Cooperativa",
]

RECURSOS_DISPONIVEIS = [
    "Quadro/Giz",
    "Projetor/Datashow",
    "Lousa Digital",
    "Tablets/Celulares",
    "Internet",
    "Materiais Maker (Papel, Cola, etc)",
    "Jogos de Tabuleiro",
    "Laboratório",
    "Material Dourado",
    "Vídeos Educativos",
]
