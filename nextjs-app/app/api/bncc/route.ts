import { NextResponse } from "next/server";
import {
    getComponentesPorNivel,
    getHabilidades,
    faixasIdadeEI,
} from "@/lib/bncc";

/**
 * GET /api/bncc
 * Query params:
 *   - nivel: "EI" | "EF" | "EM"
 *   - componente: disciplina/área/campo (optional — when missing, returns list of componentes)
 *   - ano: e.g. "5º" (optional, for EF filtering)
 *   - idade: e.g. "Crianças pequenas..." (optional, for EI)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawNivel = searchParams.get("nivel") || "EF";
        // Keep raw nivel (EFAI/EFAF) for getComponentesPorNivel filtering;
        // map to EF only when fetching habilidades from CSV
        const nivel = rawNivel;
        const csvNivel = rawNivel === "EFAI" || rawNivel === "EFAF" ? "EF" : rawNivel;
        const componente = searchParams.get("componente") || "";
        const ano = searchParams.get("ano") || "";
        const idade = searchParams.get("idade") || "";

        // If no componente specified, return available componentes + metadata
        if (!componente) {
            const componentes = getComponentesPorNivel(nivel);
            const extras: Record<string, string[]> = {};
            if (nivel === "EI") {
                extras.faixasIdade = faixasIdadeEI();
            }
            return NextResponse.json({ nivel, componentes, ...extras });
        }

        // Return habilidades for the specified componente
        const habilidades = getHabilidades(nivel, componente, ano || idade || undefined);

        return NextResponse.json({
            nivel,
            componente,
            ano: ano || undefined,
            total: habilidades.length,
            habilidades,
        });
    } catch (err) {
        console.error("BNCC API error:", err);
        return NextResponse.json(
            { error: "Erro ao buscar habilidades BNCC." },
            { status: 500 }
        );
    }
}
