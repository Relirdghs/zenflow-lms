import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function AdminGroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = getUserRole(profile?.role ?? null, user);
  const isSuperAdmin = role === "super_admin";

  const query = supabase
    .from("groups")
    .select("id, name, admin_id, avatar_url")
    .order("name");
  if (!isSuperAdmin) {
    query.eq("admin_id", user.id);
  }
  const { data: groups } = await query;

  const groupIds = groups?.map((g) => g.id) ?? [];
  const { data: goals } = groupIds.length > 0
    ? await supabase.from("goals").select("group_id").in("group_id", groupIds)
    : { data: [] };

  const { data: members } = groupIds.length > 0
    ? await supabase.from("group_members").select("group_id").in("group_id", groupIds)
    : { data: [] };

  const goalsCount = (goals ?? []).reduce<Record<string, number>>((acc, g) => {
    if (!g.group_id) return acc;
    acc[g.group_id] = (acc[g.group_id] ?? 0) + 1;
    return acc;
  }, {});

  const membersCount = (members ?? []).reduce<Record<string, number>>((acc, m) => {
    if (!m.group_id) return acc;
    acc[m.group_id] = (acc[m.group_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Группы</h1>
          <p className="text-muted-foreground">Управление группами клиентов</p>
        </div>
        <Button asChild>
          <Link href="/admin/groups/new">Новая группа</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(groups ?? []).map((g) => (
          <Card key={g.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={g.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {g.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{g.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {membersCount[g.id] ?? 0} участников
                  </Badge>
                  <Badge variant="secondary">
                    {goalsCount[g.id] ?? 0} целей
                  </Badge>
                </div>
              </div>
            </CardHeader>
              <CardContent>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/groups/${g.id}`}>Редактировать</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!groups || groups.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Нет групп.</p>
            <Button asChild>
              <Link href="/admin/groups/new">Создать первую группу</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
