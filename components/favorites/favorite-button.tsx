"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite, isFavorite } from "@/app/actions/favorites";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  courseId: string;
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({ courseId, userId, variant = "outline", size = "default" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkFavorite = async () => {
      const result = await isFavorite(userId, courseId);
      setFavorited(result);
      setLoading(false);
    };
    checkFavorite();
  }, [userId, courseId]);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleFavorite(userId, courseId);
    setFavorited(result);
    setLoading(false);
    router.refresh();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={favorited ? "text-red-500 hover:text-red-600" : ""}
      aria-label={favorited ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
      {size !== "icon" && (
        <span className="ml-2">{favorited ? "В избранном" : "В избранное"}</span>
      )}
    </Button>
  );
}
