/**
 * Compressão de imagens para APIs de visão.
 * Usa sharp para redimensionar imagens grandes antes de enviar para GPT-4o / Gemini.
 */

/**
 * Reduz tamanho da imagem se necessário para evitar falhas na API de visão.
 * @param imageBuffer Buffer da imagem original
 * @param maxBytes Tamanho máximo em bytes (padrão: 3MB)
 * @returns Buffer da imagem comprimida (ou original se já abaixo do limite)
 */
export async function comprimirImagemParaVision(
    imageBuffer: Buffer,
    maxBytes: number = 3_000_000
): Promise<Buffer> {
    if (imageBuffer.length <= maxBytes) return imageBuffer;

    try {
        let sharp: any;
        try {
            sharp = (await import("sharp")).default;
        } catch {
            console.warn("sharp não instalado — imagem enviada sem compressão.");
            return imageBuffer;
        }

        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1024;
        const height = metadata.height || 1024;
        const scale = Math.sqrt(maxBytes / imageBuffer.length);
        const newWidth = Math.max(256, Math.min(width, Math.floor(width * scale)));
        const newHeight = Math.max(256, Math.min(height, Math.floor(height * scale)));

        const compressed = await sharp(imageBuffer)
            .resize(newWidth, newHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();

        return compressed.length > imageBuffer.length ? imageBuffer : compressed;
    } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
        return imageBuffer;
    }
}

/**
 * Converte File/Blob para Buffer e comprime se necessário.
 */
export async function comprimirArquivoImagem(
    file: File | Blob,
    maxBytes: number = 3_000_000
): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return comprimirImagemParaVision(buffer, maxBytes);
}
