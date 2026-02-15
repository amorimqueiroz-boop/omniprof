import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

/** Supabase client com service role key (server-side only). */
export function getServiceClient() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
    return createClient(url, serviceKey);
}
