"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseItem {
  id: string;
  title: string;
  is_public?: boolean | null;
}

interface GroupCoursesProps {
  groupId: string;
  initialCourses: CourseItem[];
}

export function GroupCourses({ groupId, initialCourses }: GroupCoursesProps) {
  const supabase = createClient();
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CourseItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseIds = useMemo(() => new Set(courses.map((c) => c.id)), [courses]);

  async function handleSearch() {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    const { data, error: searchError } = await supabase
      .from("courses")
      .select("id, title, is_public")
      .ilike("title", `%${q}%`)
      .order("title")
      .limit(10);
    setSearching(false);
    if (searchError) {
      setError("Не удалось выполнить поиск курсов.");
      return;
    }
    setResults((data ?? []) as CourseItem[]);
  }

  async function addCourse(course: CourseItem) {
    if (courseIds.has(course.id)) return;
    const { error: insertError } = await supabase
      .from("course_groups")
      .insert({ course_id: course.id, group_id: groupId });
    if (insertError) {
      setError("Не удалось добавить курс.");
      return;
    }
    setCourses((prev) => [...prev, course]);
  }

  async function removeCourse(courseId: string) {
    const { error: deleteError } = await supabase
      .from("course_groups")
      .delete()
      .eq("course_id", courseId)
      .eq("group_id", groupId);
    if (deleteError) {
      setError("Не удалось убрать курс.");
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Доступные курсы группы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск курса по названию"
          />
          <Button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? "Поиск..." : "Найти"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  {!c.is_public && (
                    <Badge variant="outline" className="mt-1">
                      Закрытый
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={courseIds.has(c.id)}
                  onClick={() => addCourse(c)}
                >
                  {courseIds.has(c.id) ? "Уже добавлен" : "Добавить"}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {courses.length > 0 ? (
            courses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  {!c.is_public && (
                    <Badge variant="outline" className="mt-1">
                      Закрытый
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCourse(c.id)}
                >
                  Убрать
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Курсы пока не назначены.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
