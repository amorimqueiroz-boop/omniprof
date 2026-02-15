import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptGerarImagem } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            descricao: string; feedback?: string; engine?: EngineId;
        }>(request);

        if (!body.descricao?.trim()) return errorResponse("Descreva a imagem que deseja.");

        const prompt = promptGerarImagem({ descricao: body.descricao, feedback: body.feedback });

        // For image generation, we use the prompt with Gemini or fall back to text description
        const result = await chatCompletionText(body.engine || "yellow", [{ role: "user", content: prompt }], { temperature: 0.8 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}
