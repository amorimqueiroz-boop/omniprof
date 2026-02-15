/**
 * Export Service — PDF & DOCX para resultados de ferramentas OmniProf
 * Executa no cliente (browser) para evitar dependências nativas no servidor.
 */

import { saveAs } from "file-saver";

// ─── Helpers ───

function limparTexto(texto: string): string {
    return texto
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/#{1,4}\s*/g, "")
        .replace(/•/g, "-")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/\u2013/g, "-")
        .replace(/\u2014/g, "--")
        .replace(/\u2026/g, "...")
        .replace(/\u00A0/g, " ");
}

function gerarNomeArquivo(ferramenta: string, extensao: string): string {
    const hoje = new Date().toISOString().slice(0, 10);
    const nome = ferramenta
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");
    return `OmniProf_${nome}_${hoje}.${extensao}`;
}

// ════════════════════════════════════════════════
// PDF EXPORT
// ════════════════════════════════════════════════

const PDF_LEFT = 15;
const PDF_RIGHT = 15;
const PDF_TOP = 20;
const PDF_PAGE_WIDTH = 210;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_LEFT - PDF_RIGHT;

export async function exportarPDF(
    ferramenta: string,
    conteudo: string,
    analise?: string
): Promise<void> {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let y = PDF_TOP;

    // Header
    const addHeader = () => {
        doc.setFillColor(238, 242, 255); // primary-50
        doc.rect(0, 0, PDF_PAGE_WIDTH, 42, "F");

        // Accent bar
        doc.setFillColor(99, 102, 241); // primary
        doc.rect(0, 0, PDF_PAGE_WIDTH, 3, "F");

        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`OMNIPROF — ${ferramenta.toUpperCase()}`, PDF_LEFT, 22);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Gerado por OmniProf • plataforma de ferramentas para professores", PDF_LEFT, 28);

        doc.setDrawColor(226, 232, 240);
        doc.line(PDF_LEFT, 42, PDF_PAGE_WIDTH - PDF_RIGHT, 42);

        y = 50;
    };

    const checkPage = () => {
        if (y > 270) {
            doc.addPage();
            addHeader();
        }
    };

    addHeader();

    // Process análise (if present)
    if (analise) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text("ANÁLISE PEDAGÓGICA", PDF_LEFT, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        const linhasAnalise = doc.splitTextToSize(limparTexto(analise), PDF_CONTENT_WIDTH);
        for (const line of linhasAnalise) {
            checkPage();
            doc.text(line, PDF_LEFT, y);
            y += 6;
        }
        y += 6;

        // Separator
        checkPage();
        doc.setDrawColor(226, 232, 240);
        doc.line(PDF_LEFT, y, PDF_PAGE_WIDTH - PDF_RIGHT, y);
        y += 8;
    }

    // Process main content
    const linhas = conteudo.split("\n");

    for (const rawLine of linhas) {
        const line = rawLine.trim();
        if (!line) {
            y += 3;
            continue;
        }

        checkPage();

        // Section headers (## or ###)
        if (line.startsWith("###") || line.startsWith("##")) {
            y += 4;

            doc.setFillColor(241, 245, 249);
            doc.rect(PDF_LEFT, y - 4, PDF_CONTENT_WIDTH, 10, "F");

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(67, 56, 202); // primary-dark
            const titulo = limparTexto(line.replace(/#/g, "").trim());
            doc.text(titulo, PDF_LEFT + 4, y + 3);
            doc.setTextColor(30, 41, 59);

            y += 14;
        }
        // Bullets
        else if (line.startsWith("-") || line.startsWith("*") || line.startsWith("•")) {
            const texto = limparTexto(line.replace(/^[-*•]\s*/, "").trim());
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("•", PDF_LEFT, y);
            const wrapped = doc.splitTextToSize(texto, PDF_CONTENT_WIDTH - 6);
            doc.text(wrapped[0], PDF_LEFT + 6, y);
            y += 6;
            for (let i = 1; i < wrapped.length; i++) {
                checkPage();
                doc.text(wrapped[i], PDF_LEFT + 6, y);
                y += 6;
            }
        }
        // Numbered lists
        else if (/^\d+[.)]\s/.test(line)) {
            const match = line.match(/^(\d+[.)])\s*(.*)/);
            if (match) {
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text(match[1], PDF_LEFT, y);
                doc.setFont("helvetica", "normal");
                const wrapped = doc.splitTextToSize(limparTexto(match[2]), PDF_CONTENT_WIDTH - 10);
                doc.text(wrapped[0], PDF_LEFT + 10, y);
                y += 6;
                for (let i = 1; i < wrapped.length; i++) {
                    checkPage();
                    doc.text(wrapped[i], PDF_LEFT + 10, y);
                    y += 6;
                }
            }
        }
        // Normal text
        else {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const wrapped = doc.splitTextToSize(limparTexto(line), PDF_CONTENT_WIDTH);
            for (const wl of wrapped) {
                checkPage();
                doc.text(wl, PDF_LEFT, y);
                y += 6;
            }
        }
    }

    // Footer on all pages
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Página ${i}/${pages} | Gerado via OmniProf`,
            PDF_PAGE_WIDTH / 2,
            290,
            { align: "center" }
        );
    }

    const blob = doc.output("blob");
    saveAs(blob, gerarNomeArquivo(ferramenta, "pdf"));
}

// ════════════════════════════════════════════════
// DOCX EXPORT
// ════════════════════════════════════════════════

export async function exportarDOCX(
    ferramenta: string,
    conteudo: string,
    analise?: string
): Promise<void> {
    const docx = await import("docx");
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

    const children: InstanceType<typeof Paragraph>[] = [];

    // Title
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: `OMNIPROF — ${ferramenta.toUpperCase()}`,
                    bold: true,
                    size: 32,
                    color: "4338CA",
                    font: "Calibri",
                }),
            ],
        })
    );

    // Subtitle
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
            },
            children: [
                new TextRun({
                    text: `Gerado por OmniProf • ${new Date().toLocaleDateString("pt-BR")}`,
                    italics: true,
                    size: 18,
                    color: "94A3B8",
                    font: "Calibri",
                }),
            ],
        })
    );

    // Análise
    if (analise) {
        children.push(
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                children: [
                    new TextRun({ text: "Análise Pedagógica", bold: true, color: "6366F1", font: "Calibri" }),
                ],
            })
        );
        children.push(
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: limparTexto(analise), size: 22, font: "Calibri" }),
                ],
            })
        );
    }

    // Main content
    const linhas = conteudo.split("\n");

    for (const rawLine of linhas) {
        const line = rawLine.trim();
        if (!line) {
            children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
            continue;
        }

        if (line.startsWith("###")) {
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 80 },
                    children: [
                        new TextRun({
                            text: limparTexto(line.replace(/#/g, "").trim()),
                            bold: true,
                            color: "4338CA",
                            font: "Calibri",
                        }),
                    ],
                })
            );
        } else if (line.startsWith("##")) {
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 100 },
                    border: {
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E7FF" },
                    },
                    children: [
                        new TextRun({
                            text: limparTexto(line.replace(/#/g, "").trim()),
                            bold: true,
                            color: "4338CA",
                            font: "Calibri",
                        }),
                    ],
                })
            );
        } else if (line.startsWith("-") || line.startsWith("*") || line.startsWith("•")) {
            children.push(
                new Paragraph({
                    bullet: { level: 0 },
                    spacing: { after: 60 },
                    children: [
                        new TextRun({
                            text: limparTexto(line.replace(/^[-*•]\s*/, "").trim()),
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                })
            );
        } else if (/^\d+[.)]\s/.test(line)) {
            const match = line.match(/^(\d+[.)])\s*(.*)/);
            if (match) {
                children.push(
                    new Paragraph({
                        spacing: { after: 60 },
                        children: [
                            new TextRun({ text: `${match[1]} `, bold: true, size: 22, font: "Calibri" }),
                            new TextRun({ text: limparTexto(match[2]), size: 22, font: "Calibri" }),
                        ],
                    })
                );
            }
        } else {
            children.push(
                new Paragraph({
                    spacing: { after: 80 },
                    children: [
                        new TextRun({ text: limparTexto(line), size: 22, font: "Calibri" }),
                    ],
                })
            );
        }
    }

    const doc = new Document({
        sections: [{ children }],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, gerarNomeArquivo(ferramenta, "docx"));
}
