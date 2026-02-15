"use client";

import { useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    FERRAMENTAS, TAXONOMIA_BLOOM, METODOLOGIAS, TECNICAS_ATIVAS,
    RECURSOS_DISPONIVEIS, COMPONENTES_EF, COMPONENTES_EM, DISCIPLINAS_PADRAO,
} from "@/lib/constants";
import { ENGINE_NAMES, type EngineId } from "@/lib/ai-engines";
import { BnccSelector } from "@/components/BnccSelector";
import { PageHero } from "@/components/PageHero";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { ImageCropper } from "@/components/ImageCropper";
import {
    ArrowLeft, Download, Copy, Check, Loader2, FileText, Sparkles,
    BookOpen, Users, MessageCircle, Network, Image as ImageIcon,
    FileEdit, Scissors, Clock, Gamepad2, ListOrdered, Star, type LucideIcon,
    ThumbsUp, Trash2, RefreshCw, Upload, ChevronDown, Brain,
    Palette, PenTool, Library,
} from "lucide-react";

/* Icon map for tools */
const TOOL_ICON_MAP: Record<string, LucideIcon> = {
    "criar-itens": Sparkles,
    "plano-aula": BookOpen,
    "dinamica": Users,
    "papo-mestre": MessageCircle,
    "mapa-mental": Network,
    "estudio-visual": ImageIcon,
    "adaptar-prova": FileEdit,
    "adaptar-atividade": Scissors,
    "rotina-visual": Clock,
    "atividades-ludicas": Gamepad2,
    "sequencia-didatica": ListOrdered,
    "criar-experiencia": Star,
};

/* Color map for tool heroes */
const TOOL_COLOR_MAP: Record<string, string> = {
    "criar-itens": "blue",
    "plano-aula": "blue",
    "dinamica": "blue",
    "papo-mestre": "blue",
    "mapa-mental": "blue",
    "estudio-visual": "blue",
    "adaptar-prova": "blue",
    "adaptar-atividade": "blue",
    "rotina-visual": "blue",
    "atividades-ludicas": "blue",
    "sequencia-didatica": "blue",
    "criar-experiencia": "blue",
};

/* Engine gradient colors for premium pills */
const ENGINE_COLORS: Record<string, { from: string; to: string }> = {
    red: { from: "#D94F4F", to: "#E87272" },
    blue: { from: "#3b82f6", to: "#60a5fa" },
    green: { from: "#10b981", to: "#34d399" },
    yellow: { from: "#f59e0b", to: "#fbbf24" },
    purple: { from: "#2B6B8A", to: "#3D8CB0" },
};

/* Duration options for Plano de Aula */
const DURACOES = [
    "50 min (1 aula)",
    "100 min (2 aulas)",
    "150 min (3 aulas)",
    "Flexível",
];

export default function ToolPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const segmento = (searchParams.get("segmento") || "EFAI") as "EI" | "EFAI" | "EFAF" | "EM";
    const toolId = params.tool as string;
    const tool = FERRAMENTAS.find((t) => t.id === toolId);

    const [engine, setEngine] = useState<EngineId>("red");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [analise, setAnalise] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [validated, setValidated] = useState(false);
    const [savedToLib, setSavedToLib] = useState(false);
    const [mapaImagens, setMapaImagens] = useState<Record<number, string>>({});

    // Feedback loop state
    const [feedbackText, setFeedbackText] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    // File upload state (for adaptar-prova / adaptar-atividade)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState("");
    const [extracting, setExtracting] = useState(false);
    const [uploadedImagePreview, setUploadedImagePreview] = useState("");
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state (shared across tools)
    const [formData, setFormData] = useState<Record<string, string | number | boolean | string[]>>({});

    const updateField = useCallback((key: string, value: string | number | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    async function handleGenerate(opts?: { modoProfundo?: boolean; feedback?: string }) {
        setLoading(true);
        setError("");
        setResult("");
        setAnalise("");
        setValidated(false);
        setSavedToLib(false);
        setMapaImagens({});
        setShowFeedback(false);

        try {
            const payload: Record<string, unknown> = { ...formData, engine };
            if (opts?.modoProfundo) payload.modoProfundo = true;
            if (opts?.feedback) payload.feedback = opts.feedback;

            // For adaptar-prova with extracted text from DOCX
            if (extractedText && (toolId === "adaptar-prova" || toolId === "adaptar-atividade")) {
                payload.texto = extractedText || formData.texto;
            }

            // Special handling for image upload in adaptar-atividade (vision OCR)
            if (toolId === "adaptar-atividade" && (croppedBlob || (uploadedFile && uploadedFile.type.startsWith("image/")))) {
                const formDataUpload = new FormData();
                const imgFile = croppedBlob
                    ? new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" })
                    : uploadedFile!;
                formDataUpload.append("file", imgFile);
                formDataUpload.append("meta", JSON.stringify({
                    materia: formData.materia || "",
                    tema: formData.tema || "",
                    tipo: formData.tipo || "Atividade",
                    livro_professor: !!formData.livroProfessor,
                    modo_profundo: !!opts?.modoProfundo,
                    checklist: formData.checklist || {},
                    engine,
                }));
                const resp = await fetch(`/api/ferramentas/${toolId}`, {
                    method: "POST",
                    body: formDataUpload,
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || "Erro ao gerar.");
                setResult(data.conteudo || data.result || "");
                setAnalise(data.analise || "");
                return;
            }

            const resp = await fetch(`/api/ferramentas/${toolId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || "Erro ao gerar.");

            let textoFinal = data.conteudo || data.result || "";
            const analiseTexto = data.analise || "";

            // Image generation pipeline: process [[GEN_IMG: ...]] tags
            const usarImagens = !!formData["incluirImagens"];
            const qtdImagens = (formData["qtdImagens"] as number) || 2;
            const mapa: Record<number, string> = {};

            if (usarImagens && qtdImagens > 0) {
                const genImgRegex = /\[\[GEN_IMG:\s*([^\]]+)\]\]/gi;
                const termos: string[] = [];
                let m: RegExpExecArray | null;
                while ((m = genImgRegex.exec(textoFinal)) !== null) {
                    termos.push(m[1].trim());
                }

                // Fill with generic terms if AI didn't produce enough tags
                while (termos.length < qtdImagens) {
                    termos.push(`ilustração educacional ${termos.length + 1}`);
                }

                // Generate images: Unsplash first, then Gemini fallback
                for (let i = 0; i < termos.length && i < qtdImagens; i++) {
                    let imagemGerada = false;
                    for (const prioridade of ["BANCO", "IA"] as const) {
                        try {
                            const imgRes = await fetch("/api/ferramentas/gerar-imagem-inline", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ prompt: termos[i], prioridade }),
                            });
                            const imgData = await imgRes.json();

                            if (imgRes.ok && imgData.image) {
                                let base64 = imgData.image as string;
                                if (base64.startsWith("data:image")) {
                                    base64 = base64.replace(/^data:image\/\w+;base64,/, "");
                                }
                                if (base64 && base64.length > 100) {
                                    mapa[i + 1] = base64;
                                    imagemGerada = true;
                                    break;
                                }
                            }
                        } catch {
                            // continue to next priority
                        }
                    }
                    if (!imagemGerada) {
                        console.warn(`⚠️ Não foi possível gerar imagem ${i + 1}`);
                    }
                }

                // Replace [[GEN_IMG: ...]] tags with [[IMG_n]]
                let idx = 0;
                textoFinal = textoFinal.replace(/\[\[GEN_IMG:\s*[^\]]+\]\]/gi, () => {
                    idx++;
                    return `[[IMG_${idx}]]`;
                });
            }

            setMapaImagens(mapa);
            setResult(textoFinal);
            setAnalise(analiseTexto);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido.");
        } finally {
            setLoading(false);
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleExportPDF() {
        if (!result) return;
        const { exportarPDF } = await import("@/lib/export-service");
        await exportarPDF(tool?.label || "Ferramenta", result, analise || undefined);
    }

    async function handleExportDOCX() {
        if (!result) return;
        const { exportarDOCX } = await import("@/lib/export-service");
        await exportarDOCX(tool?.label || "Ferramenta", result, analise || undefined);
    }

    function handleValidate() {
        setValidated(true);
    }

    function handleDiscard() {
        setResult("");
        setAnalise("");
        setValidated(false);
        setShowFeedback(false);
        setFeedbackText("");
    }

    function handleRefeedback() {
        setShowFeedback(true);
    }

    function handleSubmitFeedback() {
        if (!feedbackText.trim()) return;
        handleGenerate({ feedback: feedbackText });
        setFeedbackText("");
    }

    // DOCX file upload handler
    async function handleDocxUpload(file: File) {
        setUploadedFile(file);
        setExtracting(true);
        setExtractedText("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/ferramentas/extrair-docx", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Erro ao extrair texto do DOCX");
            const data = await res.json();
            setExtractedText(data.texto || "");
            updateField("texto", data.texto || "");
        } catch {
            setExtractedText("");
            setError("Erro ao extrair texto do arquivo. Cole manualmente.");
        } finally {
            setExtracting(false);
        }
    }

    // Image file upload handler
    function handleImageUpload(file: File) {
        setUploadedFile(file);
        setCroppedBlob(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    if (!tool) {
        return (
            <div style={{ textAlign: "center", padding: 60 }}>
                <h2>Ferramenta não encontrada</h2>
                <button className="btn-secondary" onClick={() => router.push("/ferramentas")} style={{ marginTop: 16 }}>
                    Voltar
                </button>
            </div>
        );
    }

    const ToolIcon = TOOL_ICON_MAP[toolId] || Sparkles;
    const toolColor = TOOL_COLOR_MAP[toolId] || "blue";

    return (
        <div className="w-full space-y-6 animate-fade-in-up px-2 sm:px-4">
            <PageHero title={tool.label} desc={tool.description} icon={ToolIcon} color={toolColor} />

            {/* Motor de IA — estilo Hub */}
            <details open className="hub-panel hub-panel-soft" style={{ padding: "14px 18px", background: "var(--surface-1)" }}>
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold list-none motor-summary">
                    <Brain size={17} className="text-[#2B6B8A]" /> Motor de IA
                    <ChevronDown size={14} className="ml-auto opacity-70" />
                </summary>
                <div
                    className="mt-3 pt-2 border-t motor-engines-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        gap: 10,
                        width: "100%",
                        borderColor: "var(--border-light)",
                    }}
                >
                    {(Object.keys(ENGINE_NAMES) as EngineId[]).map((id) => {
                        const isActive = engine === id;
                        const colors = ENGINE_COLORS[id] || { from: "#2B6B8A", to: "#3D8CB0" };
                        return (
                            <button
                                key={id}
                                onClick={() => setEngine(id)}
                                className={`py-2 rounded-full text-[0.8rem] font-medium transition-all duration-200 cursor-pointer border min-w-0 ${isActive
                                    ? "text-white border-transparent shadow-md"
                                    : "engine-btn-inactive"
                                    }`}
                                style={{
                                    ...(isActive ? {
                                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                                        boxShadow: `0 2px 8px ${colors.from}40`,
                                        border: "none",
                                    } : {}),
                                }}
                            >
                                {ENGINE_NAMES[id].split(" (")[0]}
                            </button>
                        );
                    })}
                </div>
            </details>

            {/* Formulário — painel estilo Hub */}
            <div className="hub-panel hub-panel-cyan p-6 sm:p-7 rounded-2xl">
                <ToolForm
                    toolId={toolId}
                    segmento={segmento}
                    formData={formData}
                    updateField={updateField}
                    onDocxUpload={handleDocxUpload}
                    onImageUpload={handleImageUpload}
                    extractedText={extractedText}
                    extracting={extracting}
                    uploadedFile={uploadedFile}
                    uploadedImagePreview={uploadedImagePreview}
                    fileInputRef={fileInputRef}
                    croppedBlob={croppedBlob}
                    setCroppedBlob={setCroppedBlob}
                />

                {error && (
                    <div style={{
                        background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
                        padding: "10px 14px", color: "#DC2626", fontSize: "0.85rem", marginTop: 16,
                    }}>
                        {error}
                    </div>
                )}

                <button
                    className="w-full py-3.5 rounded-xl text-white font-bold text-[0.95rem] transition-all duration-200 flex items-center justify-center gap-2 mt-5 cursor-pointer border-none"
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    style={{
                        opacity: loading ? 0.7 : 1,
                        background: `linear-gradient(135deg, ${(ENGINE_COLORS[engine] || { from: "#2B6B8A" }).from}, ${(ENGINE_COLORS[engine] || { to: "#3D8CB0" }).to})`,
                        boxShadow: `0 4px 14px ${(ENGINE_COLORS[engine] || { from: "#2B6B8A" }).from}33`,
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} style={{ animation: "omni-spin 0.8s linear infinite" }} />
                            Gerando com {ENGINE_NAMES[engine].split(" (")[0]}...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Gerar com {ENGINE_NAMES[engine].split(" (")[0]}
                        </>
                    )}
                </button>
            </div>

            {/* Result */}
            {(result || analise) && (
                <div className="fade-in-up space-y-5">
                    {analise && (
                        <details className="hub-panel hub-panel-soft" style={{ padding: "20px 22px", background: "var(--surface-1)" }}>
                            <summary className="cursor-pointer list-none font-bold text-[#2B6B8A] text-[15px]">
                                🧠 Análise Pedagógica
                            </summary>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <FormattedTextDisplay texto={analise} mapaImagens={mapaImagens} />
                            </div>
                        </details>
                    )}

                    <div
                        className="hub-panel result-container overflow-hidden"
                        style={{
                            background: "var(--surface-1)",
                            padding: "22px 24px",
                            border: validated ? "2px solid #10b981" : undefined,
                            boxShadow: validated ? "0 4px 16px rgba(16,185,129,0.12)" : undefined,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                            <h3 style={{ fontWeight: 700, color: "var(--primary-dark)" }}>
                                {validated ? "✅" : "📝"} Resultado
                            </h3>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={handleCopy} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
                                    {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                                </button>
                                <button onClick={handleExportPDF} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
                                    <Download size={14} /> PDF
                                </button>
                                <button onClick={handleExportDOCX} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
                                    <FileText size={14} /> DOCX
                                </button>
                            </div>
                        </div>

                        {/* Formatted result with markdown rendering */}
                        <FormattedTextDisplay texto={result} mapaImagens={mapaImagens} />
                    </div>

                    {/* Validar / Descartar / Refazer buttons */}
                    <div className="flex flex-wrap gap-3">
                        {!validated && (
                            <button
                                onClick={handleValidate}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
                                style={{
                                    background: "linear-gradient(135deg, #10b981, #34d399)",
                                    color: "white",
                                    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                                }}
                            >
                                <ThumbsUp size={16} /> Validar resultado
                            </button>
                        )}
                        {validated && (
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                <Check size={16} /> Resultado validado ✓
                            </span>
                        )}
                        <button
                            onClick={handleRefeedback}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            <RefreshCw size={16} /> Refazer com ajustes
                        </button>
                        {(toolId === "adaptar-prova" || toolId === "adaptar-atividade") && (
                            <button
                                onClick={() => handleGenerate({ modoProfundo: true })}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
                                style={{
                                    background: "linear-gradient(135deg, #2B6B8A, #3D8CB0)",
                                    color: "white",
                                    boxShadow: "0 2px 8px rgba(43,107,138,0.3)",
                                    opacity: loading ? 0.6 : 1,
                                }}
                            >
                                <Brain size={16} /> Refazer +Profundo
                            </button>
                        )}
                        <button
                            onClick={handleDiscard}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        >
                            <Trash2 size={16} /> Descartar
                        </button>
                        {!savedToLib ? (
                            <button
                                onClick={async () => {
                                    try {
                                        await fetch("/api/biblioteca", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                ferramenta: toolId,
                                                titulo: `${tool?.label || toolId} — ${new Date().toLocaleDateString("pt-BR")}`,
                                                conteudo: result,
                                                analise: analise,
                                            }),
                                        });
                                        setSavedToLib(true);
                                    } catch { /* ignore */ }
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-[#D4E8F1] bg-[#EDF5F9] text-[#2B6B8A] hover:bg-[#D4E8F1]"
                            >
                                <Library size={16} /> Salvar na Biblioteca
                            </button>
                        ) : (
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#2B6B8A] bg-[#EDF5F9] border border-[#D4E8F1]">
                                <Check size={16} /> Salvo na Biblioteca ✓
                            </span>
                        )}
                    </div>

                    {showFeedback && (
                        <div className="hub-panel hub-panel-soft p-5 space-y-3 fade-in-up" style={{ background: "var(--surface-1)" }}>
                            <label className="block text-sm font-semibold text-slate-700">
                                <RefreshCw size={14} className="inline mr-2" />
                                Ajustes para refazer
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                placeholder="Descreva o que deseja alterar... Ex: 'mais exemplos', 'linguagem mais simples', 'foco em alfabetização'"
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={loading || !feedbackText.trim()}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${(ENGINE_COLORS[engine] || { from: "#2B6B8A" }).from}, ${(ENGINE_COLORS[engine] || { to: "#3D8CB0" }).to})`,
                                        opacity: loading || !feedbackText.trim() ? 0.5 : 1,
                                    }}
                                >
                                    <RefreshCw size={14} /> Regenerar com ajustes
                                </button>
                                <button
                                    onClick={() => { setShowFeedback(false); setFeedbackText(""); }}
                                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ===== Dynamic Form per Tool =====
function ToolForm({
    toolId,
    segmento,
    formData,
    updateField,
    onDocxUpload,
    onImageUpload,
    extractedText,
    extracting,
    uploadedFile,
    uploadedImagePreview,
    fileInputRef,
    croppedBlob,
    setCroppedBlob,
}: {
    toolId: string;
    segmento: "EI" | "EFAI" | "EFAF" | "EM";
    formData: Record<string, string | number | boolean | string[]>;
    updateField: (key: string, value: string | number | boolean | string[]) => void;
    onDocxUpload: (f: File) => void;
    onImageUpload: (f: File) => void;
    extractedText: string;
    extracting: boolean;
    uploadedFile: File | null;
    uploadedImagePreview: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    croppedBlob: Blob | null;
    setCroppedBlob: (b: Blob | null) => void;
}) {
    const F = (key: string, label: string, placeholder: string, type: "text" | "textarea" | "number" | "select" = "text", options?: string[]) => (
        <div style={{ marginBottom: 16 }} key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {type === "textarea" ? (
                <textarea
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={placeholder}
                    value={(formData[key] as string) || ""}
                    onChange={(e) => updateField(key, e.target.value)}
                />
            ) : type === "select" && options ? (
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" value={(formData[key] as string) || ""} onChange={(e) => updateField(key, e.target.value)}>
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : type === "number" ? (
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder={placeholder} value={(formData[key] as number) || ""} onChange={(e) => updateField(key, parseInt(e.target.value) || 0)} />
            ) : (
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder={placeholder} value={(formData[key] as string) || ""} onChange={(e) => updateField(key, e.target.value)} />
            )}
        </div>
    );

    // Multi-select for Recursos
    const MultiSelect = ({ field, label, options }: { field: string; label: string; options: string[] }) => {
        const selected = (formData[field] as string[]) || [];
        return (
            <div style={{ marginBottom: 16 }}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => {
                                const next = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt];
                                updateField(field, next);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[0.8rem] transition-all cursor-pointer ${selected.includes(opt)
                                ? "bg-blue-50 border-blue-400 text-blue-700 border"
                                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                {selected.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                        {selected.length} selecionado(s)
                    </p>
                )}
            </div>
        );
    };

    const ChecklistSection = () => (
        <details className="border border-slate-200 rounded-lg mb-4" open>
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">☑️ Checklist de Adaptação</summary>
            <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                    ["questoes_desafiadoras", "Questões mais desafiadoras"],
                    ["compreende_instrucoes_complexas", "Compreende instruções complexas"],
                    ["instrucoes_passo_a_passo", "Instruções passo a passo"],
                    ["dividir_em_etapas", "Dividir em etapas menores"],
                    ["paragrafos_curtos", "Parágrafos curtos"],
                    ["dicas_apoio", "Dicas de apoio"],
                    ["compreende_figuras_linguagem", "Compreende figuras de linguagem"],
                    ["descricao_imagens", "Descrição de imagens"],
                ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-slate-600 py-0.5 cursor-pointer">
                        <input type="checkbox" checked={!!formData[key]} onChange={(e) => updateField(key, e.target.checked)} className="rounded" />
                        {label}
                    </label>
                ))}
            </div>
            <div className="px-4 pb-4">
                {F("hiperfoco", "Hiperfoco / Interesse especial (opcional)", "Ex: dinossauros, games, espaço...")}
            </div>
        </details>
    );

    const BloomSection = () => {
        const [selectedCat, setSelectedCat] = useState(Object.keys(TAXONOMIA_BLOOM)[0]);
        const [isOpen, setIsOpen] = useState(false);
        const selected = (formData["verbosBloom"] as string[]) || [];
        return (
            <details className="border border-slate-200 rounded-lg mb-4" open={isOpen}
                onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
            >
                <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">▸ 🧠 Taxonomia de Bloom (opcional)</summary>
                <div className="p-4 space-y-3">
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                        {Object.keys(TAXONOMIA_BLOOM).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-1.5">
                        {TAXONOMIA_BLOOM[selectedCat].map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
                                    updateField("verbosBloom", next);
                                }}
                                className={`px-2.5 py-1 rounded-md text-[0.8rem] transition-all cursor-pointer ${selected.includes(v)
                                    ? "bg-blue-50 border-blue-400 text-blue-700 border"
                                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    {selected.length > 0 && (
                        <p className="text-xs text-blue-600 mt-2">
                            Selecionados: {selected.join(", ")}
                        </p>
                    )}
                </div>
            </details>
        );
    };

    // DOCX Upload Section
    const DocxUploadSection = ({ tipo }: { tipo: string }) => (
        <div className="mb-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                <Upload size={14} className="inline mr-1" />
                Upload de DOCX (ou cole o texto abaixo)
            </label>
            <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && (file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
                        onDocxUpload(file);
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onDocxUpload(file);
                    }}
                />
                {extracting ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                        <Loader2 size={18} style={{ animation: "omni-spin 0.8s linear infinite" }} />
                        <span className="text-sm font-medium">Extraindo texto do DOCX...</span>
                    </div>
                ) : uploadedFile ? (
                    <div className="text-sm text-emerald-600 font-medium">
                        <Check size={16} className="inline mr-1" />
                        {uploadedFile.name} — texto extraído ✓
                    </div>
                ) : (
                    <div>
                        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                            Arraste o arquivo .docx ou clique para selecionar
                        </p>
                    </div>
                )}
            </div>
            {extractedText && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-32 overflow-auto">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Texto extraído ({extractedText.length} caracteres):</p>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{extractedText.slice(0, 500)}{extractedText.length > 500 ? "..." : ""}</p>
                </div>
            )}
            <div className="text-xs text-slate-400 text-center">ou</div>
            {F("texto", `Cole o texto da ${tipo} aqui`, "Cole o conteúdo original...", "textarea")}
        </div>
    );

    // Image Upload Section for Adaptar Atividade
    const ImageUploadSection = () => (
        <div className="mb-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                <ImageIcon size={14} className="inline mr-1" />
                Upload de Imagem da Atividade (OCR automático)
            </label>
            <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#3D8CB0] hover:bg-[#EDF5F9]/30 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) {
                        onImageUpload(file);
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageUpload(file);
                    }}
                />
                {uploadedFile && uploadedFile.type.startsWith("image/") ? (
                    <div className="text-sm text-emerald-600 font-medium">
                        <Check size={16} className="inline mr-1" />
                        {uploadedFile.name} — imagem carregada ✓
                    </div>
                ) : (
                    <div>
                        <ImageIcon size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                            Arraste a foto da atividade ou clique para selecionar
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PNG, JPG — a IA extrairá o texto via OCR
                        </p>
                    </div>
                )}
            </div>
            {uploadedImagePreview && (
                <div className="rounded-lg overflow-hidden">
                    <ImageCropper
                        src={uploadedImagePreview}
                        caption="Recorte a área desejada ou clique 'Aplicar recorte' para usar a imagem completa"
                        onCropComplete={(blob, mime) => setCroppedBlob(blob)}
                    />
                    {croppedBlob && (
                        <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Recorte aplicado</p>
                    )}
                </div>
            )}
            <div className="text-xs text-slate-400 text-center">ou</div>
            {F("texto", "Cole o texto da atividade aqui", "Cole o conteúdo original...", "textarea")}
        </div>
    );

    switch (toolId) {
        case "criar-itens":
            return <>
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("assuntoInteresse", "Assunto de interesse (conexão com a turma)", "Ex: jogos, dinossauros, espaço...")}
                <div className="grid grid-cols-2 gap-4">
                    {F("qtd", "Qtd. Questões", "5", "number")}
                    {F("tipo", "Tipo", "Objetiva", "select", ["Objetiva", "Discursiva", "Mista"])}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {F("nivelDificuldade", "Nível de Dificuldade", "Médio", "select", ["Fácil", "Médio", "Difícil", "Avançado"])}
                </div>
                {/* Image Generation Toggle */}
                <div className="border border-slate-200 rounded-lg p-4 mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!formData["incluirImagens"]}
                            onChange={(e) => updateField("incluirImagens", e.target.checked)}
                            className="rounded"
                        />
                        <ImageIcon size={16} />
                        Incluir imagens ilustrativas
                    </label>
                    {formData["incluirImagens"] && (
                        <div className="mt-3 ml-6">
                            <label className="block text-xs text-slate-500 mb-1">Quantidade de imagens</label>
                            <input
                                type="range"
                                min={1}
                                max={5}
                                value={(formData["qtdImagens"] as number) || 2}
                                onChange={(e) => updateField("qtdImagens", parseInt(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                            <span className="text-xs text-blue-600 font-medium">{(formData["qtdImagens"] as number) || 2} imagens</span>
                        </div>
                    )}
                </div>
                <BloomSection />
            </>;

        case "plano-aula":
            return <>
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("assunto", "Assunto *", "Ex: Sistema Solar")}
                {F("metodologia", "Metodologia", "Selecione", "select", METODOLOGIAS)}
                {/* Conditional: Técnica Ativa only shows when Metodologia = "Metodologia Ativa" */}
                {(formData["metodologia"] === "Metodologia Ativa") && (
                    F("tecnica", "Técnica Ativa", "Selecione", "select", TECNICAS_ATIVAS)
                )}
                <div className="grid grid-cols-2 gap-4">
                    {F("qtdAlunos", "Nº de estudantes", "30", "number")}
                    {F("duracaoMinutos", "Duração", "Selecione", "select", DURACOES)}
                </div>
                <MultiSelect field="recursos" label="Recursos Disponíveis" options={RECURSOS_DISPONIVEIS} />
                <BloomSection />
            </>;

        case "dinamica":
            return <>
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("assunto", "Assunto *", "Ex: Trabalho em equipe")}
                {F("qtdAlunos", "Nº de estudantes", "25", "number")}
                {F("caracteristicasTurma", "Características da turma (opcional)", "Ex: Turma agitada, gostam de competição", "textarea")}
                <BloomSection />
            </>;

        case "papo-mestre":
            return <>
                {F("componenteCurricular", "Componente Curricular *", "Selecione", "select", DISCIPLINAS_PADRAO)}
                {F("assunto", "Assunto da Aula *", "Ex: Revolução Francesa")}
                {F("assuntoInteresse", "Interesse da turma (DUA)", "Ex: games, séries, memes...")}
                {F("hiperfoco", "Hiperfoco do estudante (opcional)", "Ex: dinossauros, trens, mapas...")}
            </>;

        case "mapa-mental":
            return <>
                {F("temaCentral", "Tema Central *", "Ex: Água - ciclo e importância")}
                {F("ramificacoes", "Ramificações sugeridas (opcional)", "Sugira ramos ou deixe em branco", "textarea")}
            </>;

        case "adaptar-prova":
            return <>
                <DocxUploadSection tipo="prova" />
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("tipoProva", "Tipo", "Selecione", "select", ["Prova", "Tarefa", "Avaliação"])}
                <div className="flex flex-wrap gap-4 mb-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!formData["removerRespostas"]} onChange={(e) => updateField("removerRespostas", e.target.checked)} className="rounded" />
                        Remover gabarito/respostas
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!formData["modoProfundo"]} onChange={(e) => updateField("modoProfundo", e.target.checked)} className="rounded" />
                        <Brain size={14} /> Modo Profundo (análise mais detalhada)
                    </label>
                </div>
                <ChecklistSection />
            </>;

        case "adaptar-atividade":
            return <>
                <ImageUploadSection />
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("tipoAtividade", "Tipo", "Selecione", "select", ["Atividade", "Tarefa", "Exercício"])}
                <div className="flex flex-wrap gap-4 mb-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!formData["removerRespostas"]} onChange={(e) => updateField("removerRespostas", e.target.checked)} className="rounded" />
                        Remover gabarito/respostas
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!formData["livroProfessor"]} onChange={(e) => updateField("livroProfessor", e.target.checked)} className="rounded" />
                        📕 Livro do Professor (remover respostas)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!formData["modoProfundo"]} onChange={(e) => updateField("modoProfundo", e.target.checked)} className="rounded" />
                        <Brain size={14} /> Modo Profundo
                    </label>
                </div>
                <ChecklistSection />
            </>;

        case "estudio-visual":
            return <>
                {/* Section 1: Ilustração Educacional */}
                <div className="border border-slate-200 rounded-xl p-5 mb-4 bg-gradient-to-br from-[#EDF5F9]/30 to-white">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Palette size={16} className="text-[#2B6B8A]" /> Ilustração Educacional
                    </h4>
                    {F("descricao", "Descreva a ilustração que deseja *", "Ex: Alunos em roda de leitura na biblioteca", "textarea")}
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mb-3">
                        <input type="checkbox" checked={!!formData["usarHiperfoco"]} onChange={(e) => updateField("usarHiperfoco", e.target.checked)} className="rounded" />
                        🎯 Usar tema/hiperfoco na ilustração
                    </label>
                    {formData["usarHiperfoco"] && (
                        F("temaHiperfoco", "Tema / Hiperfoco", "Ex: dinossauros, espaço, carros...")
                    )}
                </div>

                {/* Section 2: Pictograma CAA */}
                <div className="border border-slate-200 rounded-xl p-5 mb-4 bg-gradient-to-br from-cyan-50/30 to-white">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <PenTool size={16} className="text-cyan-500" /> Pictograma CAA
                    </h4>
                    {F("conceitoCaa", "Conceito para o Pictograma", "Ex: Banheiro, Comer, Brincar")}
                    <p className="text-xs text-slate-400 mt-1">
                        Gera um pictograma de Comunicação Aumentativa e Alternativa (CAA)
                    </p>
                </div>

                {F("feedback", "Ajuste (opcional)", "Alguma correção sobre uma imagem anterior?")}
            </>;

        case "rotina-visual":
            return <>
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("tipoRotina", "Tipo de Rotina", "Selecione", "select", ["Rotina Diária", "Rotina Semanal", "Rotina de Atividades", "Rotina de Transição"])}
                {F("periodo", "Período", "Selecione", "select", ["Manhã", "Tarde", "Integral"])}
                {F("rotinaDetalhada", "Rotina detalhada", "Descreva os horários...\n8:00 - Chegada\n8:30 - Roda de conversa\n9:00 - Atividade\n...", "textarea")}
                {F("pontoAtencao", "Ponto de atenção / Foco", "Ex: Transição para o parque, momento do lanche...")}
                {F("observacoes", "Observações (opcional)", "Informações sobre a turma ou contexto", "textarea")}
            </>;

        case "atividades-ludicas":
            return <>
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("objetivo", "Objetivo Pedagógico *", "Ex: Desenvolver coordenação motora e socialização")}
                {F("espaco", "Espaço Disponível", "Selecione", "select", ["Sala de aula", "Pátio/Quadra", "Área externa", "Sala multiuso"])}
                {F("materiais", "Materiais disponíveis (opcional)", "Ex: bolas, cones, papel, giz de cera")}
                {F("temaInteresse", "Tema de interesse da turma (opcional)", "Ex: Super-heróis, princesas, animais")}
            </>;

        case "sequencia-didatica":
            return <>
                <BnccSelector
                    selected={(formData["habilidadesBncc"] as string[]) || []}
                    onSelect={(h) => updateField("habilidadesBncc", h)}
                    defaultNivel={segmento}
                />
                {F("tema", "Tema/Conteúdo *", "Ex: Frações — conceito, equivalência e operações")}
                {F("duracaoAulas", "Duração (nº de aulas)", "8", "number")}
                {F("objetivos", "Objetivos", "Descreva os objetivos da sequência", "textarea")}
                {F("metodologia", "Metodologia (opcional)", "Selecione", "select", METODOLOGIAS)}
                <BloomSection />
            </>;

        case "criar-experiencia":
            return <>
                <BnccSelector
                    selected={(formData["objetivosEI"] as string[]) || []}
                    onSelect={(h) => updateField("objetivosEI", h)}
                    defaultNivel="EI"
                />
                {F("campoExperiencia", "Campo de Experiência *", "Selecione", "select", [
                    "O eu, o outro e o nós",
                    "Corpo, gestos e movimentos",
                    "Traços, sons, cores e formas",
                    "Escuta, fala, pensamento e imaginação",
                    "Espaços, tempos, quantidades, relações e transformações",
                ])}
                {F("assuntoInteresse", "Tema de interesse da turma", "Ex: animais, fazendinha, super-heróis...")}
                {F("observacoes", "Observações sobre a turma (opcional)", "Ex: turma de 4 anos, gostam muito de atividades ao ar livre", "textarea")}
            </>;

        default:
            return <p>Formulário não configurado para esta ferramenta.</p>;
    }
}
