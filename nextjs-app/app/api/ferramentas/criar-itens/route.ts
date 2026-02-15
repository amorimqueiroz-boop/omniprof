import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptCriarItens, promptExperienciaEI, splitAnaliseConteudo } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            materia: string;
            objeto: string;
            assuntoInteresse: string;
            qtd: number;
            tipo: "Objetiva" | "Discursiva" | "Mista";
            qtdImagens?: number;
            nivelDificuldade?: string;
            verbosBloom?: string[];
            habilidadesBncc?: string[];
            modoProfundo?: boolean;
            engine?: EngineId;
        }>(request);

        const engine = body.engine || "red";
        const isEI = (body.materia || "").trim() === "Educação Infantil";

        let prompt: string;
        if (isEI) {
            prompt = promptExperienciaEI({
                campoExperiencia: body.objeto || "Campo de Experiência",
                objetivos: body.habilidadesBncc || [],
                assuntoInteresse: body.assuntoInteresse || "",
            });
        } else {
            prompt = promptCriarItens({
                assuntoInteresse: body.assuntoInteresse || "Geral",
                materia: body.materia,
                objeto: body.objeto || "Geral",
                qtd: body.qtd || 5,
                tipo: body.tipo || "Objetiva",
                qtdImagens: body.qtdImagens || 0,
                nivelDificuldade: body.nivelDificuldade || "Médio",
                verbosBloom: body.verbosBloom,
                habilidadesBncc: body.habilidadesBncc,
                modoProfundo: body.modoProfundo,
            });
        }

        const fullText = await chatCompletionText(engine, [{ role: "user", content: prompt }], {
            temperature: body.modoProfundo ? 0.8 : 0.6,
        });

        if (isEI) {
            return NextResponse.json({ analise: "", conteudo: fullText });
        }

        const { analise, conteudo } = splitAnaliseConteudo(fullText);
        return NextResponse.json({ analise, conteudo });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

