import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptPapoMestre } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            materia: string; assunto: string; assuntoInteresse: string;
            temaTurma?: string; engine?: EngineId;
        }>(request);

        const prompt = promptPapoMestre({
            materia: body.materia, assunto: body.assunto,
            assuntoInteresse: body.assuntoInteresse || "",
            temaTurma: body.temaTurma,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.8 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}
