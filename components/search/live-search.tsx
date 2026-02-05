"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { searchCourses } from "@/app/actions/search-courses";
import type { Course } from "@/types/database";
import { courseLevelLabel } from "@/lib/course-level";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveSearchProps {
  onSelect?: (course: Course) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export function LiveSearch({ onSelect, placeholder = "Поиск курсов...", showFilters = true }: LiveSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    level?: string;
    minRating?: number;
    location?: string;
  }>({});

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length === 0 && Object.keys(filters).length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const courses = await searchCourses(debouncedQuery, filters);
        setResults(courses);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, filters]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={filters.level || ""}
            onChange={(e) => setFilters({ ...filters, level: e.target.value || undefined })}
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">Все уровни</option>
            <option value="beginner">Начальный</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
          </select>
          <select
            value={filters.minRating || ""}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">Любой рейтинг</option>
            <option value="5">5 звезд</option>
            <option value="4">4+ звезд</option>
            <option value="3">3+ звезд</option>
          </select>
          <select
            value={filters.location || ""}
            onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
            className="h-9 min-h-[44px] sm:min-h-0 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">Все районы</option>
            <option value="Алматы">Алматы</option>
            <option value="Алмалинский район">Алмалинский район</option>
            <option value="Бостандыкский район">Бостандыкский район</option>
            <option value="Медеуский район">Медеуский район</option>
            <option value="Ауэзовский район">Ауэзовский район</option>
          </select>
        </div>
      )}

      {/* Результаты поиска */}
      {loading && (
        <Card className="absolute z-50 mt-2 w-full">
          <CardContent className="p-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <Card className="absolute z-50 mt-2 w-full max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            <div className="space-y-1">
              {results.map((course) => (
                <Link
                  key={course.id}
                  href={`/dashboard/courses/${course.id}`}
                  onClick={() => onSelect?.(course)}
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {course.cover_image && (
                    <div className="relative h-16 w-16 shrink-0 rounded overflow-hidden">
                      <Image
                        src={course.cover_image}
                        alt={`${course.title} — Курсы йоги в Алматы`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {courseLevelLabel(course.level)}
                      </Badge>
                      {course.average_rating && course.average_rating > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0})
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
