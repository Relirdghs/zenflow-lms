"use client";

import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({ title, text, url, variant = "outline", size = "sm" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || "",
          url,
        });
      } catch (error) {
        // Пользователь отменил шаринг
      }
    } else {
      // Fallback: копирование в буфер обмена
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ссылка скопирована!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button onClick={handleShare} variant={variant} size={size} aria-label={copied ? "Ссылка скопирована" : "Поделиться курсом"}>
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Скопировано
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Поделиться
        </>
      )}
    </Button>
  );
}
