import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target } from "lucide-react";
import { GroupGoalsForm } from "./group-goals-form";
import { GroupForm } from "../group-form";
import { GroupMembers } from "./group-members";
import { GroupCourses } from "./group-courses";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function GroupDetailsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = getUserRole(profile?.role ?? null, user);
  const isSuperAdmin = role === "super_admin";

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, admin_id, avatar_url")
    .eq("id", groupId)
    .single();

  if (!group) notFound();
  if (group.admin_id !== user.id && !isSuperAdmin) notFound();

  const { data: groupGoals } = await supabase
    .from("goals")
    .select("id, title, description, is_completed, deadline")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);

  const memberIds = memberRows?.map((m) => m.user_id) ?? [];
  const { data: memberProfiles } = memberIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", memberIds)
        .order("full_name")
    : { data: [] };

  const { data: courseGroupRows } = await supabase
    .from("course_groups")
    .select("course_id")
    .eq("group_id", groupId);

  const courseIds = courseGroupRows?.map((c) => c.course_id) ?? [];
  const { data: assignedCourses } = courseIds.length > 0
    ? await supabase
        .from("courses")
        .select("id, title, is_public")
        .in("id", courseIds)
        .order("title")
    : { data: [] };

  const initialMembers = (memberProfiles ?? []) as {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  }[];

  const initialCourses = (assignedCourses ?? []) as {
    id: string;
    title: string;
    is_public?: boolean | null;
  }[];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/groups">← Группы</Link>
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarImage src={group.avatar_url ?? undefined} />
          <AvatarFallback>{group.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{group.name}</h1>
          <p className="text-muted-foreground">
            Участников: {memberIds.length}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-4">Данные группы</h2>
        <GroupForm
          groupId={groupId}
          defaultName={group.name}
          defaultAvatarUrl={group.avatar_url ?? ""}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Участники</h2>
        <GroupMembers groupId={groupId} initialMembers={initialMembers} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Курсы группы</h2>
        <GroupCourses groupId={groupId} initialCourses={initialCourses} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Цели группы</h2>
        <GroupGoalsForm groupId={groupId} />
        
        <div className="mt-6 space-y-3">
          {groupGoals && groupGoals.length > 0 ? (
            groupGoals.map((g) => (
              <Card key={g.id} className={g.is_completed ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle
                        className={`text-base font-medium ${
                          g.is_completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {g.title}
                      </CardTitle>
                      {g.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {g.description}
                        </p>
                      )}
                      {g.deadline && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Срок: {new Date(g.deadline).toLocaleDateString("ru-RU")}
                        </p>
                      )}
                    </div>
                    <form action={`/admin/groups/${groupId}/goals/${g.id}/toggle`} method="post">
                      <Button type="submit" variant="ghost" size="sm">
                        {g.is_completed ? "Вернуть" : "Выполнено"}
                      </Button>
                    </form>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Нет целей. Добавьте цель для группы выше.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
