"use client";

import { useRef, useState, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

function getCroppedCanvas(
    image: HTMLImageElement,
    crop: PixelCrop,
    mime = "image/jpeg",
    quality = 0.9
): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.reject(new Error("No 2d context"));

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0, 0,
        crop.width * scaleX,
        crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error("Canvas empty")),
            mime,
            quality
        );
    });
}

type Props = {
    src: string;
    onCropComplete: (blob: Blob, mime: string) => void;
    aspect?: number;
    caption?: string;
};

export function ImageCropper({ src, onCropComplete, aspect, caption }: Props) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect || width / height));
        },
        [aspect]
    );

    const handleApply = useCallback(async () => {
        if (!imgRef.current || !completedCrop) return;
        const blob = await getCroppedCanvas(imgRef.current, completedCrop);
        onCropComplete(blob, "image/jpeg");
    }, [completedCrop, onCropComplete]);

    return (
        <div className="space-y-3">
            {caption && <p className="text-sm text-slate-600">{caption}</p>}
            <div className="max-w-full overflow-auto rounded-lg border border-slate-200 bg-slate-50">
                <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                    aspect={aspect}
                    className="max-h-[400px]"
                >
                    <img
                        ref={imgRef}
                        src={src}
                        alt="Recorte"
                        onLoad={onImageLoad}
                        className="max-h-[400px] w-auto"
                    />
                </ReactCrop>
            </div>
            <button
                type="button"
                onClick={handleApply}
                disabled={!completedCrop}
                className="px-4 py-2 bg-[#2B6B8A] text-white rounded-lg text-sm font-medium hover:bg-[#1E4F6A] disabled:opacity-40 transition-colors"
            >
                ✂️ Aplicar recorte
            </button>
        </div>
    );
}
