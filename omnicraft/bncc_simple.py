# bncc_simple.py — Dropdowns BNCC simplificados (Omnicraft independente)
"""
Carrega bncc.csv (EF), bncc_ei.csv (EI) e bncc_em.csv (EM) da raiz do projeto.
Quando segmento=EI: estrutura Idade, Campo de Experiência, Objetivos.
Quando segmento=EF: estrutura Disciplina, Ano, Unidade Temática, Objeto, Habilidades.
Quando segmento=EM: estrutura Área, Série, Habilidades.
"""

from pathlib import Path

import pandas as pd

from omnicraft.bncc_utils import ano_celula_contem, ordenar_anos
from omnicraft.constantes import COMPONENTES_EI, COMPONENTES_EF, COMPONENTES_EM, SEGMENTOS

ROOT = Path(__file__).resolve().parent.parent  # inclusao/
BNCC_EF_PATH = ROOT / "bncc.csv" if (ROOT / "bncc.csv").exists() else ROOT / "bncc_ef.csv"
BNCC_EI_PATH = ROOT / "bncc_ei.csv"
BNCC_EM_PATH = ROOT / "bncc_em.csv"

_df_ef = None
_df_ei = None
_df_em = None


def _carregar_bncc_ef():
    global _df_ef
    if _df_ef is not None:
        return _df_ef
    if not BNCC_EF_PATH.exists():
        _df_ef = pd.DataFrame(columns=["Disciplina", "Ano", "Unidade Temática", "Objeto do Conhecimento", "Habilidade"])
        return _df_ef
    try:
        _df_ef = pd.read_csv(BNCC_EF_PATH, sep=";", encoding="utf-8-sig", dtype=str)
        cols = ["Disciplina", "Ano", "Unidade Temática", "Objeto do Conhecimento", "Habilidade"]
        for c in cols:
            if c not in _df_ef.columns:
                _df_ef[c] = ""
        return _df_ef
    except Exception:
        _df_ef = pd.DataFrame(columns=cols)
        return _df_ef


def _carregar_bncc_ei():
    global _df_ei
    if _df_ei is not None:
        return _df_ei
    if not BNCC_EI_PATH.exists():
        _df_ei = pd.DataFrame(columns=["Idade", "Campo de Experiência", "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO"])
        return _df_ei
    try:
        _df_ei = pd.read_csv(BNCC_EI_PATH, sep=";", encoding="utf-8-sig", dtype=str)
        col_obj = "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO"
        if col_obj not in _df_ei.columns:
            _df_ei[col_obj] = _df_ei.get("Objetivo", "")
        if "Campo de Experiência" not in _df_ei.columns:
            _df_ei["Campo de Experiência"] = _df_ei.get("Campo de Experiencia", "")
        return _df_ei
    except Exception:
        _df_ei = pd.DataFrame(columns=["Idade", "Campo de Experiência", "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO"])
        return _df_ei


def _carregar_bncc_em():
    global _df_em
    if _df_em is not None:
        return _df_em
    if not BNCC_EM_PATH.exists():
        _df_em = pd.DataFrame(columns=["Área de conhecimento", "Série", "Habilidade"])
        return _df_em
    try:
        _df_em = pd.read_csv(BNCC_EM_PATH, sep=";", encoding="utf-8-sig", dtype=str)
        if "Área de conhecimento" not in _df_em.columns:
            _df_em["Área de conhecimento"] = _df_em.get("Área", "")
        return _df_em
    except Exception:
        _df_em = pd.DataFrame(columns=["Área de conhecimento", "Série", "Habilidade"])
        return _df_em


# =============================================================================
# EF (Ensino Fundamental)
# =============================================================================


def obter_disciplinas_ef():
    df = _carregar_bncc_ef()
    if df.empty:
        return COMPONENTES_EF
    vals = df["Disciplina"].dropna().unique().tolist()
    return sorted([v.strip() for v in vals if v and str(v).strip()])


def obter_anos_ef(disciplina=None):
    df = _carregar_bncc_ef()
    if df.empty:
        return ordenar_anos(["1", "2", "3", "4", "5", "6", "7", "8", "9"])
    if disciplina:
        df = df[df["Disciplina"].str.strip() == str(disciplina).strip()]
    anos_raw = df["Ano"].dropna().unique().tolist()
    partes = set()
    for a in anos_raw:
        if a and str(a).strip():
            for p in str(a).split(","):
                partes.add(p.strip())
    return ordenar_anos(list(partes))


def obter_unidades_tematicas_ef(disciplina=None, ano=None):
    df = _carregar_bncc_ef()
    if df.empty:
        return []
    if disciplina:
        df = df[df["Disciplina"].str.strip() == str(disciplina).strip()]
    if ano:
        mask = df["Ano"].apply(lambda x: ano_celula_contem(x, ano))
        df = df[mask]
    vals = df["Unidade Temática"].dropna().unique().tolist()
    return sorted([str(v).strip() for v in vals if v and str(v).strip()])


def obter_objetos_ef(disciplina=None, ano=None, unidade_tematica=None):
    df = _carregar_bncc_ef()
    if df.empty:
        return []
    if disciplina:
        df = df[df["Disciplina"].str.strip() == str(disciplina).strip()]
    if ano:
        mask = df["Ano"].apply(lambda x: ano_celula_contem(x, ano))
        df = df[mask]
    if unidade_tematica:
        df = df[df["Unidade Temática"].str.strip() == str(unidade_tematica).strip()]
    vals = df["Objeto do Conhecimento"].dropna().unique().tolist()
    return sorted([str(v).strip() for v in vals if v and str(v).strip()])


def obter_habilidades_ef(disciplina=None, ano=None, unidade_tematica=None, objeto=None):
    df = _carregar_bncc_ef()
    if df.empty:
        return []
    if disciplina:
        df = df[df["Disciplina"].str.strip() == str(disciplina).strip()]
    if ano:
        mask = df["Ano"].apply(lambda x: ano_celula_contem(x, ano))
        df = df[mask]
    if unidade_tematica:
        df = df[df["Unidade Temática"].str.strip() == str(unidade_tematica).strip()]
    if objeto:
        df = df[df["Objeto do Conhecimento"].str.strip() == str(objeto).strip()]
    vals = df["Habilidade"].dropna().unique().tolist()
    return [str(v).strip() for v in vals if v and str(v).strip()]


# =============================================================================
# EI (Educação Infantil)
# =============================================================================


def obter_faixas_idade_ei():
    df = _carregar_bncc_ei()
    if df.empty:
        return ["Bebês (zero a 1 ano e 6 meses)", "Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)", "Crianças pequenas (4 anos a 5 anos e 11 meses)"]
    vals = df["Idade"].dropna().unique().tolist()
    def _key(s):
        nums = __import__("re").findall(r"\d+", s or "")
        return (int(nums[0]) if nums else 99, s)
    return sorted([str(v).strip() for v in vals if v and str(v).strip()], key=_key)


def obter_campos_experiencia_ei():
    df = _carregar_bncc_ei()
    if df.empty:
        return ["Corpo, Gestos e Movimento", "Escuta, Fala, Pensamento e Imaginação", "Espaços, tempos, quantidades, relações e transformações", "O eu, o outro e o nós", "Traços, sons, cores e formas"]
    col = "Campo de Experiência" if "Campo de Experiência" in df.columns else "Campo de Experiencia"
    vals = df[col].dropna().unique().tolist()
    return sorted([str(v).strip() for v in vals if v and str(v).strip()])


def obter_objetivos_ei(idade=None, campo=None):
    df = _carregar_bncc_ei()
    if df.empty:
        return []
    if idade:
        df = df[df["Idade"].str.strip() == str(idade).strip()]
    col_campo = "Campo de Experiência" if "Campo de Experiência" in df.columns else "Campo de Experiencia"
    if campo:
        df = df[df[col_campo].str.strip() == str(campo).strip()]
    col_obj = "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO"
    vals = df[col_obj].dropna().unique().tolist()
    return [str(v).strip() for v in vals if v and str(v).strip()]


# =============================================================================
# EM (Ensino Médio)
# =============================================================================


def obter_areas_em():
    df = _carregar_bncc_em()
    if df.empty:
        return COMPONENTES_EM
    col = "Área de conhecimento" if "Área de conhecimento" in df.columns else "Área"
    vals = df[col].dropna().unique().tolist()
    return sorted([str(v).strip() for v in vals if v and str(v).strip()])


def obter_series_em(area=None):
    df = _carregar_bncc_em()
    if df.empty:
        return ["1ª", "2ª", "3ª"]
    if area:
        col = "Área de conhecimento" if "Área de conhecimento" in df.columns else "Área"
        df = df[df[col].str.strip() == str(area).strip()]
    vals = df["Série"].dropna().unique().tolist()
    partes = set()
    for a in vals:
        if a and str(a).strip():
            for p in str(a).split(","):
                partes.add(p.strip())
    return ordenar_anos(list(partes))


def obter_habilidades_em(area=None, serie=None):
    df = _carregar_bncc_em()
    if df.empty:
        return []
    if area:
        col = "Área de conhecimento" if "Área de conhecimento" in df.columns else "Área"
        df = df[df[col].str.strip() == str(area).strip()]
    if serie:
        mask = df["Série"].apply(lambda x: ano_celula_contem(x, serie))
        df = df[mask]
    vals = df["Habilidade"].dropna().unique().tolist()
    return [str(v).strip() for v in vals if v and str(v).strip()]


# =============================================================================
# Componentes por segmento (para selectors na Home)
# =============================================================================


def obter_componentes_por_segmento(segmento):
    """Retorna lista de componentes curriculares para o segmento."""
    if segmento == "EI":
        return COMPONENTES_EI
    if segmento == "EM":
        areas = obter_areas_em()
        return areas if areas else COMPONENTES_EM
    if segmento in ("EFAI", "EFAF"):
        disc = obter_disciplinas_ef()
        return disc if disc else COMPONENTES_EF
    return obter_disciplinas_ef() or COMPONENTES_EF


# =============================================================================
# Dropdowns unificados
# =============================================================================


def criar_dropdowns_bncc(
    segmento=None,
    componente=None,
    disciplina_label="Disciplina",
    ano_label="Ano",
    unidade_label="Unidade Temática",
    objeto_label="Objeto do Conhecimento",
    habilidades_label="Habilidades BNCC",
    multiselect_habilidades=True,
    key_prefix="bncc",
):
    """
    Cria dropdowns BNCC conforme segmento (EI, EFAI, EFAF, EM).
    segmento e componente vêm de st.session_state.omnicraft_segmento / omnicraft_componente.
    Quando EI: Idade, Campo de Experiência, Objetivos.
    Quando EF: Disciplina (filtrada por componente), Ano, Unidade, Objeto, Habilidades.
    Quando EM: Área (filtrada por componente), Série, Habilidades.
    """
    import streamlit as st
    pf = key_prefix or "bncc"
    seg = segmento or st.session_state.get("omnicraft_segmento", "EFAI")
    comp = componente or st.session_state.get("omnicraft_componente", "")

    # Educação Infantil — estrutura diferente
    if seg == "EI":
        faixas = obter_faixas_idade_ei()
        campos = obter_campos_experiencia_ei()
        idade = st.selectbox("Faixa de Idade (BNCC EI)", ["", *faixas], key=f"{pf}_idade_ei")
        campo = st.selectbox("Campo de Experiência", ["", *campos], key=f"{pf}_campo_ei")
        objetivos = obter_objetivos_ei(idade, campo) if idade and campo else []
        sel_obj = st.multiselect("Objetivos de Aprendizagem", objetivos, key=f"{pf}_obj_ei") if objetivos else []
        assunto = st.text_input("Assunto (opcional)", placeholder="Ex: Brincadeira de roda...", key=f"{pf}_assunto_ei")
        return {
            "segmento": "EI",
            "disciplina": "Educação Infantil",
            "ano": idade,
            "unidade_tematica": campo,
            "objeto": "",
            "habilidades": sel_obj,
            "assunto_livre": assunto or "",
        }

    # Ensino Médio — Área, Série, Habilidades
    if seg == "EM":
        areas = obter_areas_em()
        area = st.selectbox("Área de Conhecimento", ["", *areas], key=f"{pf}_area_em")
        series = obter_series_em(area) if area else []
        serie = st.selectbox("Série", ["", *series], key=f"{pf}_serie_em")
        habs = obter_habilidades_em(area, serie) if area and serie else []
        sel_hab = st.multiselect(habilidades_label, habs, key=f"{pf}_hab_em") if habs else []
        assunto = st.text_input("Assunto (opcional)", placeholder="Ex: Genética, Funções...", key=f"{pf}_assunto_em")
        return {
            "segmento": "EM",
            "disciplina": area or comp,
            "ano": serie,
            "unidade_tematica": area,
            "objeto": "",
            "habilidades": sel_hab,
            "assunto_livre": assunto or "",
        }

    # EF (Anos Iniciais ou Finais) — Disciplina, Ano, Unidade, Objeto, Habilidades
    disc_opts = obter_disciplinas_ef()
    idx_disc = (disc_opts.index(comp) + 1) if comp and comp in disc_opts else 0
    disc = st.selectbox(disciplina_label, ["", *disc_opts], key=f"{pf}_disc", index=min(idx_disc, len(disc_opts)))
    anos = obter_anos_ef(disc) if disc else []
    ano = st.selectbox(ano_label, ["", *anos], key=f"{pf}_ano")
    unidades = obter_unidades_tematicas_ef(disc, ano) if disc else []
    unid = st.selectbox(unidade_label, ["", *unidades], key=f"{pf}_unid")
    objetos = obter_objetos_ef(disc, ano, unid) if disc else []
    obj = st.selectbox(objeto_label, ["", *objetos], key=f"{pf}_obj")
    habs = obter_habilidades_ef(disc, ano, unid, obj) if disc else []
    if multiselect_habilidades and habs:
        sel_hab = st.multiselect(habilidades_label, habs, key=f"{pf}_hab")
    else:
        sel_hab = st.selectbox(habilidades_label, ["", *habs], key=f"{pf}_hab")
        sel_hab = [sel_hab] if sel_hab else []
    assunto = st.text_input("Assunto (opcional)", placeholder="Ex: Frações, Fotossíntese...", key=f"{pf}_assunto")
    return {
        "segmento": seg,
        "disciplina": disc,
        "ano": ano,
        "unidade_tematica": unid,
        "objeto": obj,
        "habilidades": sel_hab,
        "assunto_livre": assunto or "",
    }


# Compatibilidade: funções antigas delegam para EF
def obter_disciplinas():
    return obter_disciplinas_ef()


def obter_anos(disciplina=None):
    return obter_anos_ef(disciplina)


def obter_unidades_tematicas(disciplina=None, ano=None):
    return obter_unidades_tematicas_ef(disciplina, ano)


def obter_objetos(disciplina=None, ano=None, unidade_tematica=None):
    return obter_objetos_ef(disciplina, ano, unidade_tematica)


def obter_habilidades(disciplina=None, ano=None, unidade_tematica=None, objeto=None):
    return obter_habilidades_ef(disciplina, ano, unidade_tematica, objeto)
