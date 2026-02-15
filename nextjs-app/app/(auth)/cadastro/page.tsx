"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff } from "lucide-react";

function getSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export default function CadastroPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const supabaseRef = useRef<ReturnType<typeof getSupabase> | null>(null);
    if (!supabaseRef.current && typeof window !== "undefined") {
        supabaseRef.current = getSupabase();
    }

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPw) {
            setError("As senhas não coincidem.");
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);

        const supabase = supabaseRef.current!;
        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, plan: "free" },
            },
        });

        if (err) {
            setError(err.message);
            setLoading(false);
            return;
        }

        router.push("/ferramentas");
        router.refresh();
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #EDF5F9, #F8FAFC, #FDF2F2)",
            padding: "20px",
        }}>
            <div className="animate-fade-in-up" style={{
                width: "100%", maxWidth: 420, background: "white",
                borderRadius: 20, padding: "40px 36px",
                boxShadow: "0 8px 32px rgba(43, 107, 138, 0.10)",
                border: "1px solid rgba(226, 232, 240, 0.6)",
            }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <Image
                        src="/logo-vertical.png"
                        alt="OmniProf"
                        width={140}
                        height={140}
                        className="mx-auto"
                        style={{ marginBottom: 8 }}
                        priority
                    />
                    <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1E4F6A" }}>Criar Conta</h1>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>
                        Comece a criar materiais incríveis
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
                        padding: "10px 14px", color: "#DC2626", fontSize: "0.85rem", marginBottom: 16,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#0f172a" }}>
                            Nome
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Seu nome completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#0f172a" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#0f172a" }}>
                            Senha
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPw ? "text" : "password"}
                                className="input-field"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{
                                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                                }}
                            >
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#0f172a" }}>
                            Confirmar Senha
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Repita a senha"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", padding: "14px", fontSize: "1rem",
                            opacity: loading ? 0.7 : 1,
                            background: "linear-gradient(135deg, #2B6B8A, #1E4F6A)",
                            color: "white", border: "none", borderRadius: 12,
                            fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(43, 107, 138, 0.3)",
                            transition: "all 250ms ease",
                        }}
                    >
                        {loading ? "Criando conta..." : "Criar Conta Grátis"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, color: "#64748b", fontSize: "0.9rem" }}>
                    Já tem conta?{" "}
                    <Link href="/login" style={{ color: "#D94F4F", fontWeight: 600, textDecoration: "none" }}>
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
