import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptMapaMental } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            temaCentral: string; ramificacoes?: string; engine?: EngineId;
        }>(request);

        const prompt = promptMapaMental({
            temaCentral: body.temaCentral,
            ramificacoes: body.ramificacoes,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.7 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}
