import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptPlanoAula } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            materia: string; assunto: string; metodologia: string; tecnica?: string;
            qtdAlunos: number; recursos?: string[]; habilidadesBncc?: string[];
            verbosBloom?: string[]; ano?: string; duracaoMinutos?: number;
            engine?: EngineId;
        }>(request);

        const prompt = promptPlanoAula({
            materia: body.materia, assunto: body.assunto,
            metodologia: body.metodologia || "Aula Expositiva Dialogada",
            tecnica: body.tecnica, qtdAlunos: body.qtdAlunos || 30,
            recursos: body.recursos || [], habilidadesBncc: body.habilidadesBncc,
            verbosBloom: body.verbosBloom, ano: body.ano,
            duracaoMinutos: body.duracaoMinutos,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.7 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}
