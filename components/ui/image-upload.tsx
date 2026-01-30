"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Перетащите изображение или нажмите для выбора",
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

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) return;
      await uploadFile(file);
    },
    []
  );

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadFile(file);
  }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    // Для демо: конвертируем в data URL (в проде используйте Supabase Storage)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div className="relative group rounded-lg overflow-hidden border bg-muted aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Превью"
          className="w-full h-full object-cover"
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
            <p className="text-sm text-muted-foreground">Загрузка...</p>
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
              PNG, JPG, GIF до 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
