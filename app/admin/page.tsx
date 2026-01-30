import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Обзор администратора</h1>
        <p className="text-muted-foreground">Управление курсами, группами и чатами</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Курсы</CardTitle>
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
            <CardTitle className="text-base">Группы</CardTitle>
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
  );
}
