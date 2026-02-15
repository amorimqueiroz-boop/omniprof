"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SEGMENTOS } from "@/lib/constants";
import { BookOpen, Loader2, CheckCircle2, Search, Lock } from "lucide-react";

type Habilidade = {
    codigo: string;
    descricao: string;
    habilidade_completa: string;
    unidade_tematica?: string;
    objeto_conhecimento?: string;
};

type BnccSelectorProps = {
    selected: string[];
    onSelect: (habilidades: string[]) => void;
    /** Pre-set the nivel (optional) */
    defaultNivel?: string;
};

const isEF = (n: string) => n === "EF" || n === "EFAI" || n === "EFAF";

export function BnccSelector({ selected, onSelect, defaultNivel }: BnccSelectorProps) {
    /** Quando a página define o segmento (ex.: EFAI), a Etapa de Ensino fica travada. */
    const segmentoTravado = Boolean(defaultNivel);
    const [nivel, setNivel] = useState(defaultNivel || "");
    const [componentes, setComponentes] = useState<string[]>([]);
    const [componente, setComponente] = useState("");
    const [ano, setAno] = useState("");
    const [unidadeTematica, setUnidadeTematica] = useState("");
    const [objetoConhecimento, setObjetoConhecimento] = useState("");
    const [faixasIdade, setFaixasIdade] = useState<string[]>([]);
    const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState("");

    // Quando o segmento vem da página, manter nivel sempre igual a defaultNivel
    useEffect(() => {
        if (defaultNivel) setNivel(defaultNivel);
    }, [defaultNivel]);

    // Load componentes when nivel changes
    useEffect(() => {
        if (!nivel) {
            setComponentes([]);
            setComponente("");
            setHabilidades([]);
            return;
        }
        setLoading(true);
        fetch(`/api/bncc?nivel=${nivel}`)
            .then((r) => r.json())
            .then((data) => {
                setComponentes(data.componentes || []);
                if (data.faixasIdade) setFaixasIdade(data.faixasIdade);
                setComponente("");
                setAno("");
                setHabilidades([]);
            })
            .catch(() => setComponentes([]))
            .finally(() => setLoading(false));
    }, [nivel]);

    // Load habilidades when componente or ano changes
    useEffect(() => {
        if (!nivel || !componente) {
            setHabilidades([]);
            setUnidadeTematica("");
            setObjetoConhecimento("");
            return;
        }
        setUnidadeTematica("");
        setObjetoConhecimento("");
        setLoading(true);
        const params = new URLSearchParams({ nivel, componente });
        if (ano) params.set(nivel === "EI" ? "idade" : "ano", ano);

        fetch(`/api/bncc?${params}`)
            .then((r) => r.json())
            .then((data) => setHabilidades(data.habilidades || []))
            .catch(() => setHabilidades([]))
            .finally(() => setLoading(false));
    }, [nivel, componente, ano]);

    const ANOS_EF_ALL = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º"];
    const ANOS_EF = nivel === "EFAI"
        ? ANOS_EF_ALL.slice(0, 5)   // 1º–5º
        : nivel === "EFAF"
            ? ANOS_EF_ALL.slice(5)  // 6º–9º
            : ANOS_EF_ALL;

    const unidadesUnicas = useMemo(() => {
        if (!isEF(nivel) || habilidades.length === 0) return [];
        const seen = new Set<string>();
        habilidades.forEach((h) => {
            if (h.unidade_tematica?.trim()) seen.add(h.unidade_tematica.trim());
        });
        return [...seen].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [nivel, habilidades]);

    const objetosUnicos = useMemo(() => {
        if (!isEF(nivel) || !unidadeTematica || habilidades.length === 0) return [];
        const seen = new Set<string>();
        habilidades
            .filter((h) => (h.unidade_tematica || "").trim() === unidadeTematica)
            .forEach((h) => {
                if (h.objeto_conhecimento?.trim()) seen.add(h.objeto_conhecimento.trim());
            });
        return [...seen].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [nivel, unidadeTematica, habilidades]);

    const habsFiltradas = useMemo(() => {
        let list = habilidades;
        if (isEF(nivel)) {
            if (unidadeTematica) list = list.filter((h) => (h.unidade_tematica || "").trim() === unidadeTematica);
            if (objetoConhecimento) list = list.filter((h) => (h.objeto_conhecimento || "").trim() === objetoConhecimento);
        }
        if (busca.trim()) {
            const b = busca.toLowerCase();
            list = list.filter((h) =>
                h.codigo.toLowerCase().includes(b) || h.descricao.toLowerCase().includes(b)
            );
        }
        return list;
    }, [habilidades, nivel, unidadeTematica, objetoConhecimento, busca]);

    const toggleHabilidade = useCallback(
        (hab: string) => {
            const next = selected.includes(hab)
                ? selected.filter((h) => h !== hab)
                : [...selected, hab];
            onSelect(next);
        },
        [selected, onSelect]
    );

    const selectAll = useCallback(() => {
        const all = habsFiltradas.map((h) => h.habilidade_completa);
        onSelect([...new Set([...selected, ...all])]);
    }, [selected, onSelect, habsFiltradas]);

    const clearAll = useCallback(() => {
        const habSet = new Set(habilidades.map((h) => h.habilidade_completa));
        onSelect(selected.filter((s) => !habSet.has(s)));
    }, [habilidades, selected, onSelect]);

    const nivelLabel = nivel === "EI" ? "Campo de Experiência" : nivel === "EM" ? "Área de Conhecimento" : "Componente Curricular";

    return (
        <div className="hub-panel overflow-hidden mb-5 bncc-panel-bg" style={{
            border: "1px solid var(--border-light)",
        }}>
            {/* Header */}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                    }}>
                        <BookOpen size={16} style={{ color: "white" }} />
                    </span>
                    BNCC — Habilidades Curriculares
                    {selected.length > 0 && (
                        <span style={{
                            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                            color: "white",
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.3)",
                        }}>
                            {selected.length} selecionada{selected.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </span>
            </div>

            {/* Content — always visible */}
            <div style={{
                padding: "4px 18px 18px",
                borderTop: "1px solid rgba(99, 102, 241, 0.1)",
            }}>
                {/* BNCC Navigation Grid */}
                <div className="bncc-inner-card" style={{
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 12,
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                    background: "var(--surface-1)",
                }}>
                    <h4 style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}>
                        <BookOpen size={13} style={{ color: "var(--primary)" }} />
                        Navegação Curricular
                    </h4>

                    <div className="bncc-nav-grid-wrap">
                        <div className="bncc-nav-grid">
                        {/* Col 1 — Etapa de Ensino (travada quando segmento vem da página) */}
                        <div style={fieldCellStyle}>
                            <label style={labelStyle}>
                                Etapa de Ensino
                                {segmentoTravado && (
                                    <Lock
                                        size={12}
                                        style={{
                                            marginLeft: 6,
                                            verticalAlign: "middle",
                                            color: "var(--text-muted)",
                                            opacity: 0.9,
                                        }}
                                        title="Definido pelo segmento da ferramenta"
                                    />
                                )}
                            </label>
                            <div className="bncc-select-wrap">
                                <select
                                    className="select-field"
                                    value={nivel}
                                    onChange={(e) => { setNivel(e.target.value); setAno(""); setBusca(""); }}
                                    disabled={segmentoTravado}
                                    style={{
                                        ...selectStyle,
                                        ...(segmentoTravado
                                            ? {
                                                cursor: "not-allowed",
                                                opacity: 0.95,
                                                background: "var(--surface-2)",
                                            }
                                            : {}),
                                    }}
                                    title={segmentoTravado ? "Etapa definida pelo segmento selecionado na página" : undefined}
                                >
                                    <option value="">Selecione a etapa...</option>
                                    {SEGMENTOS.map((s) => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Col 2 — Componente / Disciplina / Área */}
                        <div style={fieldCellStyle}>
                            {nivel ? (
                                <>
                                    <label style={labelStyle}>{nivelLabel}</label>
                                    <div className="bncc-select-wrap">
                                        <select
                                            className="select-field"
                                            value={componente}
                                            onChange={(e) => { setComponente(e.target.value); setAno(""); setBusca(""); }}
                                            style={selectStyle}
                                        >
                                            <option value="">Selecione...</option>
                                            {componentes.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : <div style={placeholderCellStyle} />}
                        </div>

                        {/* Col 3 — Ano (EF) ou Faixa Etária (EI) */}
                        <div style={fieldCellStyle}>
                            {(nivel === "EF" || nivel === "EFAI" || nivel === "EFAF") ? (
                                <>
                                    <label style={labelStyle}>Ano/Série</label>
                                    <div className="bncc-select-wrap">
                                        <select
                                            className="select-field"
                                            value={ano}
                                            onChange={(e) => { setAno(e.target.value); setBusca(""); }}
                                            style={selectStyle}
                                        >
                                            <option value="">Todos os anos</option>
                                            {ANOS_EF.map((a) => (
                                                <option key={a} value={a}>{a} Ano</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : nivel === "EI" ? (
                                <>
                                    <label style={labelStyle}>Faixa Etária</label>
                                    <div className="bncc-select-wrap">
                                        <select
                                            className="select-field"
                                            value={ano}
                                            onChange={(e) => { setAno(e.target.value); setBusca(""); }}
                                            style={selectStyle}
                                        >
                                            <option value="">Selecione...</option>
                                            {faixasIdade.map((f) => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div style={placeholderCellStyle} />
                            )}
                        </div>

                        {/* Col 4 — Unidade Temática (EF) */}
                        <div style={fieldCellStyle}>
                            {isEF(nivel) && habilidades.length > 0 && unidadesUnicas.length > 0 ? (
                                <>
                                    <label style={labelStyle}>Unidade Temática</label>
                                    <div className="bncc-select-wrap">
                                        <select
                                            className="select-field"
                                            value={unidadeTematica}
                                            onChange={(e) => { setUnidadeTematica(e.target.value); setObjetoConhecimento(""); setBusca(""); }}
                                            style={selectStyle}
                                        >
                                            <option value="">Todas</option>
                                            {unidadesUnicas.map((u) => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : <div style={placeholderCellStyle} />}
                        </div>

                        {/* Col 5 — Objeto de Conhecimento (EF) */}
                        <div style={fieldCellStyle}>
                            {isEF(nivel) && unidadeTematica && objetosUnicos.length > 0 ? (
                                <>
                                    <label style={labelStyle}>Objeto de Conhecimento</label>
                                    <div className="bncc-select-wrap">
                                        <select
                                            className="select-field"
                                            value={objetoConhecimento}
                                            onChange={(e) => { setObjetoConhecimento(e.target.value); setBusca(""); }}
                                            style={selectStyle}
                                        >
                                            <option value="">Todos</option>
                                            {objetosUnicos.map((o) => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : <div style={placeholderCellStyle} />}
                        </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "28px 0",
                        gap: 10,
                        color: "var(--primary)",
                    }}>
                        <Loader2 size={18} style={{ animation: "omni-spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Carregando habilidades...</span>
                    </div>
                )}

                {/* Habilidades List */}
                {!loading && habilidades.length > 0 && (
                    <div style={{
                        background: "var(--surface-1)",
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 12,
                        border: "1px solid var(--border-light)",
                        boxShadow: "var(--shadow-sm)",
                    }}>
                        {/* Header: counter + search + actions */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            flexWrap: "wrap",
                            gap: 8,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    color: "var(--text-muted)",
                                }}>
                                    Habilidades
                                </span>
                                <span style={{
                                    background: "var(--primary-50)",
                                    color: "var(--primary)",
                                    borderRadius: 6,
                                    padding: "2px 8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                }}>
                                    {habsFiltradas.length}
                                </span>
                            </div>

                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    style={actionBtnStyle("var(--primary)")}
                                >
                                    ✓ Selecionar tudo
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    style={actionBtnStyle("var(--danger)")}
                                >
                                    ✕ Limpar
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div style={{ position: "relative", marginBottom: 12 }}>
                            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none" }} />
                            <input
                                type="text"
                                placeholder="Buscar por código ou descrição..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="input-field"
                                style={{
                                    paddingLeft: 36,
                                    fontSize: "0.83rem",
                                    height: 38,
                                    borderRadius: 10,
                                }}
                            />
                        </div>

                        {/* Skills List */}
                        <div style={{
                            maxHeight: 320,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            paddingRight: 4,
                        }}>
                            {habsFiltradas.map((hab, i) => {
                                const isSelected = selected.includes(hab.habilidade_completa);
                                const isEF = nivel === "EF" || nivel === "EFAI" || nivel === "EFAF";
                                return (
                                    <label
                                        key={`${hab.codigo}-${i}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 10,
                                            padding: "10px 12px",
                                            borderRadius: 10,
                                            cursor: "pointer",
                                            background: isSelected
                                                ? "linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(99, 102, 241, 0.02))"
                                                : "transparent",
                                            border: isSelected
                                                ? "1.5px solid var(--primary-light)"
                                                : "1.5px solid transparent",
                                            transition: "all 0.15s ease",
                                            fontSize: "0.83rem",
                                            lineHeight: 1.55,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.015)";
                                                (e.currentTarget as HTMLElement).style.border = "1.5px solid var(--border-light)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                                (e.currentTarget as HTMLElement).style.border = "1.5px solid transparent";
                                            }
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleHabilidade(hab.habilidade_completa)}
                                            style={{
                                                marginTop: 3,
                                                width: 17,
                                                height: 17,
                                                accentColor: "var(--primary)",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                                borderRadius: 4,
                                            }}
                                        />
                                        <span>
                                            <span style={{
                                                display: "inline-block",
                                                background: isSelected ? "var(--primary)" : "var(--primary-50)",
                                                color: isSelected ? "white" : "var(--primary-dark)",
                                                padding: "1px 7px",
                                                borderRadius: 5,
                                                fontSize: "0.73rem",
                                                fontWeight: 700,
                                                marginRight: 6,
                                                letterSpacing: "0.02em",
                                                transition: "all 0.15s ease",
                                            }}>
                                                {hab.codigo}
                                            </span>
                                            <span style={{ color: "var(--text-dark)" }}>
                                                {hab.descricao}
                                            </span>
                                            {isEF && hab.unidade_tematica && (
                                                <span style={{
                                                    display: "block",
                                                    marginTop: 4,
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-muted)",
                                                    lineHeight: 1.4,
                                                }}>
                                                    <span style={{ fontWeight: 600, color: "#2B6B8A" }}>Unidade Temática:</span>{" "}
                                                    {hab.unidade_tematica}
                                                    {hab.objeto_conhecimento && (
                                                        <>
                                                            {" · "}
                                                            <span style={{ fontWeight: 600, color: "#2B6B8A" }}>Objeto:</span>{" "}
                                                            {hab.objeto_conhecimento}
                                                        </>
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && componente && habilidades.length === 0 && (
                    <div style={{
                        textAlign: "center",
                        color: "var(--text-light)",
                        fontSize: "0.85rem",
                        padding: "24px 16px",
                        background: "var(--surface-1)",
                        borderRadius: 12,
                        marginTop: 12,
                        border: "1px solid var(--border-light)",
                    }}>
                        Nenhuma habilidade encontrada para esta seleção.
                    </div>
                )}

                {/* Selected Summary */}
                {selected.length > 0 && (
                    <div style={{
                        marginTop: 12,
                        padding: "12px 14px",
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.02))",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}>
                        <CheckCircle2 size={16} style={{ color: "#059669", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.82rem", color: "#065F46", fontWeight: 600 }}>
                            {selected.length} habilidade{selected.length !== 1 ? "s" : ""} BNCC selecionada{selected.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---- Reusable inline styles ----
const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
    minHeight: 20,
    lineHeight: 1.25,
    color: "var(--text-muted)",
};

const selectStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: 42,
    padding: "10px 12px",
    fontSize: "0.85rem",
    borderRadius: 10,
    border: "1px solid var(--border-light)",
    background: "var(--surface-1)",
    transition: "all 0.15s ease",
    boxSizing: "border-box",
};

const fieldCellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
};

const placeholderCellStyle: React.CSSProperties = {
    minHeight: 42,
};

function actionBtnStyle(color: string): React.CSSProperties {
    return {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "0.75rem",
        color,
        fontWeight: 700,
        padding: "4px 8px",
        borderRadius: 6,
        transition: "all 0.15s ease",
    };
}
