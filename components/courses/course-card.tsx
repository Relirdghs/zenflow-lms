"use client";

import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courseLevelLabel } from "@/lib/course-level";
import { CourseQuickView } from "@/components/course-quick-view";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import type { Course } from "@/types/database";

interface CourseCardProps {
  course: Course;
  userId: string;
}

export const CourseCard = memo(function CourseCard({ course, userId }: CourseCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setQuickViewOpen(true)}
      >
        {course.cover_image && (
          <div className="relative h-36 bg-muted">
            <Image
              src={course.cover_image}
              alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="font-medium">{course.title}</span>
            <Badge variant="secondary">{courseLevelLabel(course.level)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {course.description}
          </p>
          {course.average_rating && course.average_rating > 0 && (
            <div className="text-xs text-muted-foreground mb-2">
              ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0})
            </div>
          )}
          <div className="flex gap-2">
            <div onClick={(e) => e.stopPropagation()} className="flex gap-2 w-full">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/dashboard/courses/${course.id}/enroll`}>
                  Записаться
                </Link>
              </Button>
              <FavoriteButton 
                courseId={course.id} 
                userId={userId} 
                variant="outline" 
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <CourseQuickView
        course={course}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        userId={userId}
      />
    </>
  );
});
