import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria um Supabase client para Server Components / Route Handlers.
 * Usa cookies para manter a sessão do Supabase Auth.
 */
export async function createSupabaseServer() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Server Component: cookies são read-only
                    }
                },
            },
        }
    );
}

/** Retorna o usuário autenticado ou null. */
export async function getUser() {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/** Retorna dados estendidos do professor (tabela professors). */
export async function getProfessorProfile(userId: string) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
        .from("professors")
        .select("*")
        .eq("id", userId)
        .single();
    return data;
}
