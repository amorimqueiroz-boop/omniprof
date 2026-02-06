# hub_logic.py — Lógica copiada do Hub (Omnicraft independente)
"""
Funções de criação/adaptação. Sem vínculo com Omnisfera.
Troca hiperfoco → assunto_de_interesse. aluno vazio ou {"nome":"Turma"}.
"""

from io import BytesIO

import requests

from omnicraft.ia import chat_completion, gerar_imagem_inteligente
from omnicraft import config


def baixar_imagem_url(url):
    """Baixa imagem a partir de uma URL."""
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            return BytesIO(resp.content)
    except Exception:
        pass
    return None


def gerar_experiencia_ei(api_key, campo_experiencia, objetivos, assunto_interesse="", engine="red"):
    """Gera experiência lúdica para Educação Infantil (BNCC EI)."""
    obj_str = "\n".join([f"- {o}" for o in objetivos]) if objetivos else ""
    tema = assunto_interesse or "brincadeiras e vivências"
    prompt = f"""
    ATUAR COMO: Especialista em Educação Infantil (BNCC) e pedagogia do brincar.

    Crie uma EXPERIÊNCIA LÚDICA (vivência intencional) para Educação Infantil.

    CAMPO DE EXPERIÊNCIA (BNCC EI): {campo_experiencia}

    OBJETIVOS DE APRENDIZAGEM (BNCC):
    {obj_str if obj_str else "Não especificados. Use objetivos gerais do campo."}

    TEMA DE INTERESSE (conexão com a turma): {tema}

    ESTRUTURA OBRIGATÓRIA:
    1. **NOME DA EXPERIÊNCIA**
    2. **OBJETIVO PEDAGÓGICO**
    3. **MATERIAIS NECESSÁRIOS**
    4. **PREPARAÇÃO DO AMBIENTE**
    5. **PASSO A PASSO** (detalhado para o professor)
    6. **DURAÇÃO ESTIMADA**
    7. **AVALIAÇÃO** (observação, registro)

    Use linguagem acessível. Foco em brincadeiras, interações e vivências.
    """
    try:
        texto = chat_completion(engine, [{"role": "user", "content": prompt}], temperature=0.8, api_key=api_key)
        return "", texto  # sem análise separada para EI
    except Exception as e:
        return str(e), ""


def criar_profissional(api_key, assunto_interesse, materia, objeto, qtd, tipo_q, qtd_imgs,
                       verbos_bloom=None, habilidades_bncc=None, modo_profundo=False,
                       checklist_adaptacao=None, engine="red"):
    """Cria atividade do zero. assunto_interesse no lugar de hiperfoco (sem aluno). Para EI, usa gerar_experiencia_ei."""
    # Educação Infantil: experiência lúdica em vez de prova
    if materia and "Educação Infantil" in str(materia):
        return gerar_experiencia_ei(api_key, objeto or "Campo de Experiência", habilidades_bncc or [], assunto_interesse, engine)
    tema = assunto_interesse or "Geral"

    instrucao_img = f"Incluir imagens em {qtd_imgs} questões (use [[GEN_IMG: termo]]). REGRA: tag [[GEN_IMG: termo]] APÓS enunciado e ANTES alternativas." if qtd_imgs > 0 else "Sem imagens."

    instrucao_bloom = ""
    if verbos_bloom:
        lista_verbos = ", ".join(verbos_bloom)
        instrucao_bloom = f"""
        6. TAXONOMIA DE BLOOM: Use os verbos: {lista_verbos}.
           O verbo de comando no início do enunciado, em **NEGRITO** (Ex: **ANALISE**).
        """

    instrucao_habilidades = ""
    if habilidades_bncc:
        habilidades_str = "\n".join([f"- {hab}" for hab in habilidades_bncc])
        instrucao_habilidades = f"""
        7. HABILIDADES BNCC:
           {habilidades_str}
        """

    instrucoes_checklist = ""
    if checklist_adaptacao and isinstance(checklist_adaptacao, dict):
        necessidades_ativas = []
        if checklist_adaptacao.get("questoes_desafiadoras"):
            necessidades_ativas.append("Incluir questões mais desafiadoras")
        else:
            necessidades_ativas.append("Manter nível acessível")
        if not checklist_adaptacao.get("compreende_instrucoes_complexas"):
            necessidades_ativas.append("Usar instruções simples")
        if checklist_adaptacao.get("instrucoes_passo_a_passo"):
            necessidades_ativas.append("Instruções passo a passo")
        if checklist_adaptacao.get("dividir_em_etapas"):
            necessidades_ativas.append("Dividir em etapas menores")
        if checklist_adaptacao.get("paragrafos_curtos"):
            necessidades_ativas.append("Parágrafos curtos")
        if checklist_adaptacao.get("dicas_apoio"):
            necessidades_ativas.append("Dicas de apoio")
        if not checklist_adaptacao.get("compreende_figuras_linguagem"):
            necessidades_ativas.append("Evitar figuras de linguagem complexas")
        if checklist_adaptacao.get("descricao_imagens"):
            necessidades_ativas.append("Descrição de imagens quando houver")
        if necessidades_ativas:
            instrucoes_checklist = f"""
    8. CHECKLIST DE ADAPTAÇÃO:
       {chr(10).join([f"- {n}" for n in necessidades_ativas])}
    """

    diretriz_tipo = "3. FORMATO DISCURSIVO: questões abertas. NÃO alternativas." if tipo_q == "Discursiva" else "3. FORMATO OBJETIVO: múltipla escolha."

    style = "Atue como banca rigorosa." if modo_profundo else "Atue como professor elaborador."

    prompt = f"""
    {style}
    Crie prova de {materia} ({objeto}). QTD: {qtd} ({tipo_q}).

    1. Contexto real.
    2. Assunto de interesse (conexão): {tema} em 30%.
    {diretriz_tipo}
    4. Imagens: {instrucao_img}
    5. Divisão clara.

    REGRA: verbos no IMPERATIVO (Cite, Explique, Calcule). NÃO infinitivo.
    {instrucao_bloom}
    {instrucao_habilidades}
    {instrucoes_checklist}

    SAÍDA OBRIGATÓRIA:
    [ANÁLISE PEDAGÓGICA]
    ...análise...
    ---DIVISOR---
    [ATIVIDADE]
    ...questões...
    """

    try:
        full_text = chat_completion(engine, [{"role": "user", "content": prompt}],
                                    temperature=0.8 if modo_profundo else 0.6, api_key=api_key)
        if "---DIVISOR---" in full_text:
            parts = full_text.split("---DIVISOR---")
            return parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").strip(), parts[1].replace("[ATIVIDADE]", "").strip()
        return "Análise indisponível.", full_text
    except Exception as e:
        return str(e), ""


def gerar_quebra_gelo_profundo(api_key, materia, assunto, assunto_interesse, tema_turma_extra="", engine="red"):
    """Gera Papo de Mestre. assunto_interesse no lugar de hiperfoco."""
    prompt = f"""
    Crie 3 sugestões de 'Papo de Mestre' (Quebra-gelo/Introdução) para conectar a turma à aula.
    Componente: {materia}. Assunto: {assunto}.
    Assunto de interesse (conexão): {assunto_interesse}.
    Tema da turma (DUA): {tema_turma_extra if tema_turma_extra else 'Não informado'}.

    Use o assunto de interesse ou tema da turma como PONTE para explicar {assunto}.
    Seja criativo e profundo.
    """

    try:
        return chat_completion(engine, [{"role": "user", "content": prompt}], temperature=0.8, api_key=api_key)
    except Exception as e:
        return str(e)


def gerar_dinamica(api_key, materia, assunto, qtd_alunos, caracteristicas_turma,
                   habilidades_bncc=None, verbos_bloom=None, ano=None, engine="red"):
    """Gera dinâmica geral (sem aluno focal)."""
    info_bncc = ""
    if habilidades_bncc:
        for hab in habilidades_bncc:
            info_bncc += f"\n- {hab}"
    if ano:
        info_bncc = f"\nAno: {ano}" + info_bncc

    info_bloom = ""
    if verbos_bloom:
        info_bloom = f"\nVerbos Bloom: {', '.join(verbos_bloom)}"

    prompt = f"""
    Crie uma DINÂMICA para {qtd_alunos} estudantes.

    Componente: {materia}. Tema: {assunto}.
    Características da turma: {caracteristicas_turma}
    {info_bncc}
    {info_bloom}

    ESTRUTURA:
    1. NOME E OBJETIVO
    2. MATERIAIS
    3. PREPARAÇÃO
    4. PASSO A PASSO (detalhado)
    5. DURAÇÃO
    6. AVALIAÇÃO
    7. VARIAÇÕES
    """

    try:
        return chat_completion(engine, [{"role": "user", "content": prompt}], temperature=0.7, api_key=api_key)
    except Exception as e:
        return str(e)


def gerar_plano_aula(api_key, materia, assunto, metodologia, tecnica, qtd_alunos, recursos,
                     habilidades_bncc=None, verbos_bloom=None, ano=None, duracao_minutos=50, engine="red"):
    """Gera plano de aula completo."""
    info_bncc = ""
    if habilidades_bncc:
        for hab in habilidades_bncc:
            info_bncc += f"\n- {hab}"
    if ano:
        info_bncc = f"\nAno: {ano}" + info_bncc

    info_bloom = ""
    if verbos_bloom:
        info_bloom = f"\nVerbos Bloom: {', '.join(verbos_bloom)}"

    prompt = f"""
    ATUAR COMO: Coordenador Pedagógico Especialista em BNCC e Metodologias Ativas.

    PLANO DE AULA:
    - Componente: {materia}
    - Tema: {assunto}
    - Metodologia: {metodologia}
    - Técnica: {tecnica or 'Não especificada'}
    - Estudantes: {qtd_alunos}
    - Duração: {duracao_minutos} min
    - Recursos: {', '.join(recursos)}
    {info_bncc}
    {info_bloom}

    ESTRUTURA (Markdown):
    ## PLANO DE AULA: {assunto}
    ### OBJETIVOS
    ### CONTEÚDOS
    ### TEMPO
    ### RECURSOS
    ### DESENVOLVIMENTO (Acolhida, Apresentação, Atividade, Socialização, Avaliação)
    ### ADAPTAÇÕES DUA
    ### RECUPERAÇÃO
    ### REFERÊNCIAS
    """

    try:
        return chat_completion(engine, [{"role": "user", "content": prompt}], temperature=0.7, api_key=api_key)
    except Exception as e:
        return str(e)


def adaptar_conteudo_docx(api_key, texto, materia, tema, tipo_atv, remover_resp, checklist_adaptacao=None, engine="red"):
    """Adapta conteúdo (prova/atividade) com checklist. Sem aluno/PEI."""
    lista_q = ""
    style = "Seja didático." if checklist_adaptacao else "Seja objetivo."

    instrucoes_checklist = ""
    if checklist_adaptacao and isinstance(checklist_adaptacao, dict):
        necessidades_ativas = []
        if checklist_adaptacao.get("questoes_desafiadoras"):
            necessidades_ativas.append("Aumentar desafio")
        else:
            necessidades_ativas.append("Manter ou reduzir dificuldade")
        if not checklist_adaptacao.get("compreende_instrucoes_complexas"):
            necessidades_ativas.append("Simplificar instruções")
        if checklist_adaptacao.get("instrucoes_passo_a_passo"):
            necessidades_ativas.append("Instruções passo a passo")
        if checklist_adaptacao.get("dividir_em_etapas"):
            necessidades_ativas.append("Dividir em etapas menores")
        if checklist_adaptacao.get("paragrafos_curtos"):
            necessidades_ativas.append("Parágrafos curtos")
        if checklist_adaptacao.get("dicas_apoio"):
            necessidades_ativas.append("Dicas de apoio")
        if not checklist_adaptacao.get("compreende_figuras_linguagem"):
            necessidades_ativas.append("Reduzir figuras de linguagem")
        if checklist_adaptacao.get("descricao_imagens"):
            necessidades_ativas.append("Descrição de imagens")
        if necessidades_ativas:
            instrucoes_checklist = f"""
    CHECKLIST: {chr(10).join([f"- {n}" for n in necessidades_ativas])}
    Aplique 1-2 necessidades por questão.
    """

    prompt = f"""
    ESPECIALISTA EM DUA E INCLUSÃO. {style}
    ADAPTE O CONTEÚDO conforme checklist (sem PEI).
    {instrucoes_checklist}

    SAÍDA OBRIGATÓRIA:
    [ANÁLISE PEDAGÓGICA]
    ...análise...
    ---DIVISOR---
    [ATIVIDADE]
    ...atividade...

    CONTEXTO: {materia} | {tema}. {"REMOVA GABARITO." if remover_resp else ""}
    TEXTO ORIGINAL: {texto}
    """

    try:
        full_text = chat_completion(engine, [{"role": "user", "content": prompt}],
                                    temperature=0.4, api_key=api_key)
        if "---DIVISOR---" in full_text:
            parts = full_text.split("---DIVISOR---")
            return parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").strip(), parts[1].replace("[ATIVIDADE]", "").strip()
        return "Análise indisponível.", full_text
    except Exception as e:
        return str(e), ""


def gerar_mapa_mental(api_key, tema_central, ramificacoes=None, engine="red"):
    """Gera mapa mental a partir de tema central."""
    ram = (ramificacoes or "").strip() or "O professor não especificou ramificações. Sugira 4-6 ramos principais."
    prompt = f"""
    Crie um MAPA MENTAL em Markdown/texto estruturado.

    TEMA CENTRAL: {tema_central}

    RAMIFICAÇÕES (sugestões do professor): {ram}

    Estrutura:
    ## {tema_central}
    ### Ramo 1
    - Sub-item
    ### Ramo 2
    ...
    Use ## para ramos principais e - para sub-itens.
    """

    try:
        return chat_completion(engine, [{"role": "user", "content": prompt}], temperature=0.7, api_key=api_key)
    except Exception as e:
        return str(e)
