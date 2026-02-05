"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import type { Course } from "@/types/database";
import { ExternalLink } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";

interface CourseQuickViewProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function CourseQuickView({ course, isOpen, onClose, userId }: CourseQuickViewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{course.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {course.cover_image && (
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={course.cover_image}
                alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{courseLevelLabel(course.level)}</Badge>
            {course.average_rating && course.average_rating > 0 && (
              <span className="text-sm text-muted-foreground">
                ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0} отзывов)
              </span>
            )}
          </div>

          {course.description && (
            <p className="text-sm text-muted-foreground">{course.description}</p>
          )}

          {course.location_city && (
            <p className="text-xs text-muted-foreground">
              📍 {course.location_city}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/courses/${course.id}/enroll`} onClick={onClose}>
                Записаться
              </Link>
            </Button>
            {userId && (
              <FavoriteButton courseId={course.id} userId={userId} />
            )}
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/dashboard/courses/${course.id}`} onClick={onClose}>
                Открыть курс <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
