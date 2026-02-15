"use client";

import { useState, useEffect } from "react";
import { PageHero } from "@/components/PageHero";
import {
    User, Mail, Calendar, BookOpen, Sparkles, Save,
    Loader2, Check, Shield, Crown, Eye, EyeOff,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

type ProfileData = {
    user: { id: string; email: string; name: string; plan: string; created_at: string };
    stats: { biblioteca: number; geracoes: number };
};

export default function PerfilPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editName, setEditName] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Password change
    const [showPwForm, setShowPwForm] = useState(false);
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState("");

    useEffect(() => {
        fetch("/api/perfil")
            .then((r) => r.json())
            .then((data) => {
                setProfile(data);
                setEditName(data.user?.name || "");
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function handleSaveName() {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/perfil", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName }),
            });
            if (res.ok) {
                setSaved(true);
                setEditingName(false);
                setProfile((prev) =>
                    prev ? { ...prev, user: { ...prev.user, name: editName } } : prev
                );
                setTimeout(() => setSaved(false), 2000);
            }
        } catch { /* ignore */ }
        setSaving(false);
    }

    async function handleChangePassword() {
        setPwMsg("");
        if (newPw.length < 6) { setPwMsg("Senha deve ter pelo menos 6 caracteres."); return; }
        if (newPw !== confirmPw) { setPwMsg("As senhas não coincidem."); return; }

        setPwLoading(true);
        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) {
                setPwMsg(error.message);
            } else {
                setPwMsg("✅ Senha atualizada com sucesso!");
                setNewPw("");
                setConfirmPw("");
                setShowPwForm(false);
            }
        } catch {
            setPwMsg("Erro ao alterar senha.");
        }
        setPwLoading(false);
    }

    if (loading) {
        return (
            <div className="w-full animate-fade-in-up">
                <PageHero icon={User} title="Perfil" desc="Suas informações e estatísticas." color="slate" />
                <div className="text-center py-16">
                    <Loader2 size={28} className="mx-auto text-slate-400 animate-spin" />
                </div>
            </div>
        );
    }

    const user = profile?.user;
    const stats = profile?.stats;

    const PLAN_CONFIG: Record<string, { label: string; color: string; icon: typeof Crown }> = {
        free: { label: "Gratuito", color: "#64748b", icon: Shield },
        pro: { label: "Pro", color: "#2B6B8A", icon: Crown },
        escola: { label: "Escola", color: "#059669", icon: Crown },
    };
    const plan = PLAN_CONFIG[user?.plan || "free"] || PLAN_CONFIG.free;
    const PlanIcon = plan.icon;

    return (
        <div className="w-full animate-fade-in-up space-y-8">
            <PageHero icon={User} title="Perfil" desc="Suas informações e estatísticas." color="slate" />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 hub-panel hub-panel-soft bg-white p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Informações da Conta</h2>

                    <div className="space-y-5">
                        {/* Nome */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                <User size={12} /> Nome
                            </label>
                            {editingName ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6B8A]/30"
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={saving}
                                        className="px-4 py-2 bg-[#2B6B8A] text-white rounded-xl text-sm font-medium hover:bg-[#1E4F6A] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> :
                                            saved ? <Check size={14} /> : <Save size={14} />}
                                        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
                                    </button>
                                    <button
                                        onClick={() => { setEditingName(false); setEditName(user?.name || ""); }}
                                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-sm transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-800 font-medium">{user?.name || "—"}</p>
                                    <button
                                        onClick={() => setEditingName(true)}
                                        className="text-xs text-[#2B6B8A] hover:text-[#1E4F6A] font-medium"
                                    >
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                <Mail size={12} /> Email
                            </label>
                            <p className="text-sm text-slate-800">{user?.email || "—"}</p>
                        </div>

                        {/* Plano */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                <PlanIcon size={12} /> Plano
                            </label>
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                                style={{ background: `${plan.color}15`, color: plan.color }}
                            >
                                <PlanIcon size={14} />
                                {plan.label}
                            </span>
                        </div>

                        {/* Data de cadastro */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                <Calendar size={12} /> Membro desde
                            </label>
                            <p className="text-sm text-slate-800">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                                    day: "numeric", month: "long", year: "numeric"
                                }) : "—"}
                            </p>
                        </div>

                        {/* Alterar senha */}
                        <div className="pt-2 border-t border-slate-100">
                            {!showPwForm ? (
                                <button
                                    onClick={() => setShowPwForm(true)}
                                    className="text-sm text-[#2B6B8A] hover:text-[#1E4F6A] font-medium"
                                >
                                    🔒 Alterar senha
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-700">Alterar Senha</h3>
                                    <div className="relative">
                                        <input
                                            type={showPw ? "text" : "password"}
                                            placeholder="Nova senha (mín. 6 caracteres)"
                                            value={newPw}
                                            onChange={(e) => setNewPw(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6B8A]/30 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        >
                                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Confirmar nova senha"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6B8A]/30"
                                    />
                                    {pwMsg && (
                                        <p className={`text-xs ${pwMsg.startsWith("✅") ? "text-emerald-600" : "text-red-500"}`}>
                                            {pwMsg}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={pwLoading}
                                            className="px-4 py-2 bg-[#2B6B8A] text-white rounded-xl text-sm font-medium hover:bg-[#1E4F6A] disabled:opacity-50 transition-colors"
                                        >
                                            {pwLoading ? "Alterando..." : "Alterar Senha"}
                                        </button>
                                        <button
                                            onClick={() => { setShowPwForm(false); setNewPw(""); setConfirmPw(""); setPwMsg(""); }}
                                            className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-sm transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="hub-panel hub-panel-soft bg-white p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#EDF5F9] flex items-center justify-center">
                                <Sparkles size={18} className="text-[#2B6B8A]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats?.geracoes || 0}</p>
                                <p className="text-xs text-slate-500">Gerações com IA</p>
                            </div>
                        </div>
                    </div>

                    <div className="hub-panel hub-panel-soft bg-white p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FDF2F2] flex items-center justify-center">
                                <BookOpen size={18} className="text-[#D94F4F]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats?.biblioteca || 0}</p>
                                <p className="text-xs text-slate-500">Itens na Biblioteca</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
