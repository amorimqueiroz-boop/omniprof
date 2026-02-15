import { NextResponse } from "next/server";

/** Parse o body JSON do request com catch de erro. */
export async function parseBody<T>(request: Request): Promise<T> {
    try {
        return await request.json();
    } catch {
        throw new Error("Body JSON inválido.");
    }
}

/** Resposta de erro padronizada. */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

/** Resposta de sucesso padronizada. */
export function successResponse(data: Record<string, unknown>, status: number = 200) {
    return NextResponse.json(data, { status });
}
