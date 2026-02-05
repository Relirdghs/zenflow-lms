import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, MessageSquare, Plus, FileText } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { count: coursesCount } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("created_by", user.id);

  const { count: groupsCount } = await supabase
    .from("groups")
    .select("id", { count: "exact", head: true })
    .eq("admin_id", user.id);

  // Получаем количество отзывов на модерацию
  const { count: reviewsCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("is_moderated", false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Обзор администратора</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Управление курсами, группами и чатами</p>
      </div>

      {/* Быстрые действия */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild size="lg" className="h-auto py-6 flex flex-col gap-2">
            <Link href="/admin/courses/new">
              <Plus className="h-6 w-6" />
              <span>Создать курс</span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
            <Link href="/admin/reviews">
              <MessageSquare className="h-6 w-6" />
              <span>Модерация отзывов</span>
              {reviewsCount && reviewsCount > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {reviewsCount} новых
                </span>
              )}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
            <Link href="/admin/courses">
              <BookOpen className="h-6 w-6" />
              <span>Управление курсами</span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
            <Link href="/admin/groups">
              <Users className="h-6 w-6" />
              <span>Управление группами</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Статистика</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Курсы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{coursesCount ?? 0}</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/admin/courses">Управление курсами</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Группы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{groupsCount ?? 0}</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/admin/groups">Управление группами</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
