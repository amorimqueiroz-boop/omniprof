/**
 * BNCC — Base Nacional Comum Curricular
 * Parser e utilitários para EI, EF e EM.
 * Adaptado de Omnisfera para OmniProf.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "public", "data");

// ─── Module-level caches — CSVs are static, read once ───
let _cacheEI: BnccEIRow[] | null = null;
let _cacheEF: BnccEFRow[] | null = null;
let _cacheEM: BnccEMRow[] | null = null;

// ─── CSV Parser ───
function parseCSV(content: string, delimiter = ";"): Record<string, string>[] {
    const lines = content.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    // Find the real header row — some files have junk lines before actual headers
    const knownHeaders = ["Disciplina", "Habilidade", "Ano", "Campo de Experiência", "Área de conhecimento", "Idade", "Série"];
    let headerIdx = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (knownHeaders.some((h) => lines[i].includes(h))) {
            headerIdx = i;
            break;
        }
    }

    const headers = lines[headerIdx].split(delimiter).map((h) => h.trim());
    const rows: Record<string, string>[] = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, j) => {
            row[h] = values[j] ?? "";
        });
        rows.push(row);
    }
    return rows;
}

function getCell(row: Record<string, string>, ...keys: string[]): string {
    for (const k of keys) {
        const v = row[k] ?? row[k + " "] ?? "";
        if (v && String(v).trim()) return String(v).trim();
    }
    return "";
}

function parseHab(hab: string): { codigo: string; descricao: string } {
    const match = (hab || "").match(/\(([A-Za-z0-9]+)\)\s*(.*)/);
    if (match) {
        return {
            codigo: match[1],
            descricao: (match[2] || "").trim().slice(0, 300) + ((match[2] || "").length > 300 ? "..." : ""),
        };
    }
    return { codigo: "(sem código)", descricao: (hab || "").slice(0, 300) };
}

// ════════════════════════════════════════════════
// EDUCAÇÃO INFANTIL (EI)
// ════════════════════════════════════════════════

export type BnccEIRow = {
    idade: string;
    campo_experiencia: string;
    objetivo: string;
};

export function loadBnccEI(): BnccEIRow[] {
    if (_cacheEI) return _cacheEI;
    const path = join(DATA_DIR, "bncc_ei.csv");
    try {
        if (!existsSync(path)) {
            console.error(`BNCC EI: Arquivo não encontrado em ${path}`);
            return [];
        }
        const content = readFileSync(path, "utf-8");
        const rows = parseCSV(content);
        const filtered = rows.filter(
            (r) =>
                getCell(r, "Campo de Experiência", "Campo de Experiencia") &&
                getCell(r, "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO", "Objetivo de Aprendizagem", "Objetivo")
        );
        const result = filtered.map((r) => ({
            idade: getCell(r, "Idade"),
            campo_experiencia: getCell(r, "Campo de Experiência", "Campo de Experiencia"),
            objetivo: getCell(r, "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO", "Objetivo de Aprendizagem", "Objetivo"),
        }));
        _cacheEI = result;
        return result;
    } catch (err) {
        console.error("BNCC EI: Erro ao carregar:", err);
        return [];
    }
}

export function faixasIdadeEI(): string[] {
    const rows = loadBnccEI();
    const seen = new Set<string>();
    const idades: string[] = [];
    for (const r of rows) {
        if (r.idade && !seen.has(r.idade)) {
            seen.add(r.idade);
            idades.push(r.idade);
        }
    }
    return idades.sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] ?? "99", 10);
        const nb = parseInt(b.match(/\d+/)?.[0] ?? "99", 10);
        return na - nb;
    });
}

export function camposExperienciaEI(): string[] {
    const rows = loadBnccEI();
    const seen = new Set<string>();
    const campos: string[] = [];
    for (const r of rows) {
        if (r.campo_experiencia && !seen.has(r.campo_experiencia)) {
            seen.add(r.campo_experiencia);
            campos.push(r.campo_experiencia);
        }
    }
    return campos;
}

export function objetivosEIPorIdadeCampo(idade: string, campo: string): string[] {
    const rows = loadBnccEI();
    return rows
        .filter(
            (r) =>
                r.idade?.trim() === (idade || "").trim() &&
                r.campo_experiencia?.trim() === (campo || "").trim()
        )
        .map((r) => r.objetivo)
        .filter(Boolean);
}

// ════════════════════════════════════════════════
// ENSINO FUNDAMENTAL (EF)
// ════════════════════════════════════════════════

export type BnccEFRow = {
    ano: string;
    disciplina: string;
    unidade_tematica: string;
    objeto_conhecimento: string;
    habilidade: string;
};

export function loadBnccEF(): BnccEFRow[] {
    if (_cacheEF) return _cacheEF;
    let path = join(DATA_DIR, "bncc_ef.csv");
    try {
        if (!existsSync(path)) path = join(DATA_DIR, "bncc.csv");
        if (!existsSync(path)) {
            console.error(`BNCC EF: Arquivo não encontrado em ${path}`);
            return [];
        }
        const content = readFileSync(path, "utf-8");
        const rows = parseCSV(content);
        const filtered = rows.filter(
            (r) => getCell(r, "Ano") && getCell(r, "Disciplina") && getCell(r, "Habilidade")
        );
        const result = filtered.map((r) => ({
            ano: getCell(r, "Ano"),
            disciplina: getCell(r, "Disciplina"),
            unidade_tematica: getCell(r, "Unidade Temática", "Unidade Tematica"),
            objeto_conhecimento: getCell(r, "Objeto do Conhecimento"),
            habilidade: getCell(r, "Habilidade"),
        }));
        _cacheEF = result;
        return result;
    } catch (err) {
        console.error("BNCC EF: Erro ao carregar:", err);
        return [];
    }
}

const ANOS_AI = ["1", "2", "3", "4", "5"];
const ANOS_AF = ["6", "7", "8", "9"];

function rowMatchesSegment(anoCell: string, segmento?: string): boolean {
    if (!segmento || segmento === "EF") return true;
    const anosNaCelula = anoCell.split(",").map((a) => a.replace(/[^0-9]/g, "").trim());
    const allowed = segmento === "EFAI" ? ANOS_AI : ANOS_AF;
    return anosNaCelula.some((a) => allowed.includes(a));
}

/** Retorna disciplinas únicas por nível e filtro de segmento */
export function disciplinasEF(segmento?: string): string[] {
    const rows = loadBnccEF();
    const seen = new Set<string>();
    for (const r of rows) {
        if (!rowMatchesSegment(r.ano, segmento)) continue;
        if (r.disciplina && !seen.has(r.disciplina)) {
            seen.add(r.disciplina);
        }
    }
    return [...seen].sort();
}

/** Busca habilidades EF por disciplina e ano */
export function habilidadesEF(
    disciplina: string,
    ano?: string
): { codigo: string; descricao: string; habilidade_completa: string; unidade_tematica?: string; objeto_conhecimento?: string }[] {
    const rows = loadBnccEF();
    return rows
        .filter((r) => {
            if (r.disciplina.trim() !== disciplina.trim()) return false;
            if (ano) {
                const anosNaCelula = r.ano.split(",").map((a) => a.trim());
                return anosNaCelula.some(
                    (a) => a.includes(ano) || a.includes(ano.replace("º", ""))
                );
            }
            return true;
        })
        .map((r) => {
            const { codigo, descricao } = parseHab(r.habilidade);
            return {
                codigo,
                descricao,
                habilidade_completa: r.habilidade,
                unidade_tematica: r.unidade_tematica || undefined,
                objeto_conhecimento: r.objeto_conhecimento || undefined,
            };
        });
}

// ════════════════════════════════════════════════
// ENSINO MÉDIO (EM)
// ════════════════════════════════════════════════

export type BnccEMRow = {
    area: string;
    serie: string;
    habilidade: string;
};

export function loadBnccEM(): BnccEMRow[] {
    if (_cacheEM) return _cacheEM;
    const path = join(DATA_DIR, "bncc_em.csv");
    try {
        if (!existsSync(path)) {
            console.error(`BNCC EM: Arquivo não encontrado em ${path}`);
            return [];
        }
        const content = readFileSync(path, "utf-8");
        const rows = parseCSV(content);
        const filtered = rows.filter((r) => getCell(r, "Habilidade"));
        const result = filtered.map((r) => ({
            area: getCell(r, "Área de conhecimento", "Área", "Area"),
            serie: getCell(r, "Série", "Serie"),
            habilidade: getCell(r, "Habilidade"),
        }));
        _cacheEM = result;
        return result;
    } catch (err) {
        console.error("BNCC EM: Erro ao carregar:", err);
        return [];
    }
}

/** Retorna áreas únicas do EM */
export function areasEM(): string[] {
    const rows = loadBnccEM();
    const seen = new Set<string>();
    for (const r of rows) {
        if (r.area && !seen.has(r.area)) seen.add(r.area);
    }
    return [...seen].sort();
}

/** Busca habilidades EM por área */
export function habilidadesEM(
    area: string
): { codigo: string; descricao: string; habilidade_completa: string }[] {
    const rows = loadBnccEM();
    return rows
        .filter((r) => r.area.trim() === area.trim())
        .map((r) => {
            const match = (r.habilidade || "").trim().match(/\(?(EM\d+[A-Z0-9]+)\)?\s*(.*)/);
            const codigo = match ? match[1].trim() : "";
            const descricao = match ? (match[2] || "").trim() : r.habilidade;
            return { codigo, descricao, habilidade_completa: r.habilidade };
        });
}

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════

export function detectarNivelEnsino(serie: string): "EI" | "EF" | "EM" | "" {
    if (!serie) return "";
    const s = serie.toLowerCase();
    if (s.includes("infantil")) return "EI";
    if (s.includes("série") || s.includes("em") || s.includes("médio") || s.includes("eja")) return "EM";
    return "EF";
}

/** Retorna lista de disciplinas/áreas/campos conforme nível */
export function getComponentesPorNivel(nivel: string): string[] {
    switch (nivel) {
        case "EI":
            return camposExperienciaEI();
        case "EFAI":
            return disciplinasEF("EFAI");
        case "EFAF":
            return disciplinasEF("EFAF");
        case "EF":
            return disciplinasEF();
        case "EM":
            return areasEM();
        default:
            return [];
    }
}

/** Retorna habilidades formatadas conforme nível, componente e ano (para EF) */
export function getHabilidades(
    nivel: string,
    componente: string,
    ano?: string
): { codigo: string; descricao: string; habilidade_completa: string; unidade_tematica?: string; objeto_conhecimento?: string }[] {
    switch (nivel) {
        case "EI":
            // For EI, componente = campo_experiencia. Return as habilidades format.
            return objetivosEIPorIdadeCampo(ano || "", componente).map((obj) => {
                const { codigo, descricao } = parseHab(obj);
                return { codigo, descricao, habilidade_completa: obj };
            });
        case "EFAI":
        case "EFAF":
        case "EF":
            return habilidadesEF(componente, ano);
        case "EM":
            return habilidadesEM(componente);
        default:
            return [];
    }
}
