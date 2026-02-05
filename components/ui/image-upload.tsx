"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";

// Настройки оптимизации изображений
const IMAGE_CONFIG = {
  maxWidth: 500,
  maxHeight: 500,
  quality: 0.85, // 85% качество (хороший баланс размер/качество)
  format: "image/webp" as const, // WebP для лучшего сжатия
  fallbackFormat: "image/jpeg" as const, // Fallback если WebP не поддерживается
};

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  /** Максимальная ширина изображения (по умолчанию 500) */
  maxWidth?: number;
  /** Максимальная высота изображения (по умолчанию 500) */
  maxHeight?: number;
  /** Качество сжатия 0-1 (по умолчанию 0.85) */
  quality?: number;
}

/**
 * Оптимизирует изображение:
 * 1. Уменьшает до maxWidth x maxHeight (сохраняя пропорции)
 * 2. Удаляет всю мета-дату (EXIF и др.) через canvas
 * 3. Сжимает в WebP/JPEG для уменьшения размера
 */
async function optimizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Создаём canvas для отрисовки (это удаляет всю мета-дату!)
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Высокое качество интерполяции
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Рисуем изображение на canvas (это удаляет EXIF и другие метаданные)
      ctx.drawImage(img, 0, 0, width, height);

      // Пробуем WebP, если не поддерживается — JPEG
      let dataUrl = canvas.toDataURL(IMAGE_CONFIG.format, quality);
      
      // Проверяем что WebP поддерживается (если нет, будет PNG)
      if (!dataUrl.startsWith("data:image/webp")) {
        dataUrl = canvas.toDataURL(IMAGE_CONFIG.fallbackFormat, quality);
      }

      // Логируем экономию размера (для отладки)
      const originalSize = file.size;
      const newSize = Math.round((dataUrl.length * 3) / 4); // Примерный размер base64
      console.log(
        `Image optimized: ${Math.round(originalSize / 1024)}KB → ~${Math.round(newSize / 1024)}KB ` +
        `(${width}x${height}, ${Math.round((1 - newSize / originalSize) * 100)}% saved)`
      );

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Перетащите изображение или нажмите для выбора",
  maxWidth = IMAGE_CONFIG.maxWidth,
  maxHeight = IMAGE_CONFIG.maxHeight,
  quality = IMAGE_CONFIG.quality,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      // Оптимизируем изображение: ресайз + удаление метаданных + сжатие
      const optimizedDataUrl = await optimizeImage(file, maxWidth, maxHeight, quality);
      onChange(optimizedDataUrl);
    } catch (error) {
      console.error("Error optimizing image:", error);
      // Fallback: просто читаем как data URL без оптимизации
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }, [maxWidth, maxHeight, quality, onChange]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) return;
      await processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await processFile(file);
  }, [processFile]);

  if (value) {
    return (
      <div className="relative group rounded-lg overflow-hidden border bg-muted aspect-video">
        {/* 
          Using <img> instead of next/image because:
          1. Preview images are base64 data URLs from FileReader
          2. next/image doesn't optimize data URLs
          3. This is a preview component, actual content uses next/image
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Превью"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <X className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-lg border-2 border-dashed transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      } ${uploading ? "pointer-events-none opacity-50" : ""}`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
        {uploading ? (
          <>
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Оптимизация...</p>
          </>
        ) : (
          <>
            {isDragging ? (
              <ImageIcon className="h-12 w-12 text-primary mb-3" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground mb-3" />
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WebP • Авто-сжатие до {maxWidth}×{maxHeight}px
            </p>
          </>
        )}
      </div>
    </div>
  );
}
