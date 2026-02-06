# bncc_utils.py — Utilitários BNCC (Omnicraft independente)
"""
Cópia independente. Sem vínculo com Omnisfera.
"""

from __future__ import annotations

import re


def ano_celula_contem(ano_celula: str, ano_busca: str) -> bool:
    """Verifica se ano_busca está na célula Ano da BNCC."""
    if not ano_busca or not ano_celula:
        return False
    cell = str(ano_celula).strip()
    busca = str(ano_busca).strip()
    partes = [p.strip() for p in cell.split(",")]
    return busca in partes


def padronizar_ano(ano_str: str) -> str:
    """Converte diferentes formatos de ano para um padrão ordenável."""
    if not isinstance(ano_str, str):
        ano_str = str(ano_str)
    ano_str = ano_str.strip()
    padroes = [
        (r"(\d+)\s*º?\s*ano", "ano"),
        (r"(\d+)\s*ª?\s*série", "ano"),
        (r"(\d+)\s*em", "em"),
        (r"ef\s*(\d+)", "ano"),
        (r"(\d+)\s*período", "ano"),
        (r"(\d+)\s*semestre", "ano"),
    ]
    for padrao, tipo in padroes:
        match = re.search(padrao, ano_str.lower())
        if match:
            num = match.group(1)
            if tipo == "em":
                return f"{int(num):02d}EM"
            return f"{int(num):02d}"
    return ano_str


def ordenar_anos(anos_lista: list) -> list:
    """Ordena anos de forma inteligente (1º, 2º, ..., 9º, 1EM, 2EM, 3EM)."""
    anos_padronizados = [(padronizar_ano(str(ano)), ano) for ano in anos_lista]
    anos_padronizados.sort(key=lambda x: x[0])
    return [ano_original for _, ano_original in anos_padronizados]
