import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Получить группы пользователя (через group_members, fallback на enrollments)
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const { data: enrollmentGroups } = await supabase
    .from("enrollments")
    .select("group_id")
    .eq("user_id", user.id)
    .not("group_id", "is", null);

  const groupIds = [
    ...new Set([
      ...(memberships ?? []).map((m) => m.group_id).filter(Boolean),
      ...(enrollmentGroups ?? []).map((e) => e.group_id).filter(Boolean),
    ] as string[]),
  ];

  // Получить цели групп
  const { data: groupGoals } = groupIds.length > 0
    ? await supabase
        .from("goals")
        .select("id, title, description, is_completed, deadline, group_id")
        .in("group_id", groupIds)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Цели группы</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Цели вашей группы для практики йоги</p>
      </div>

      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Цели группы</h2>
        {groupGoals && groupGoals.length > 0 ? (
          <ul className="space-y-3">
            {groupGoals.map((g) => (
              <li key={g.id}>
                <Card className={g.is_completed ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`text-base font-medium ${g.is_completed ? "line-through text-muted-foreground" : ""}`}>
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
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {groupIds.length === 0
                  ? "Вы не состоите ни в одной группе. Обратитесь к администратору."
                  : "Нет целей. Администратор группы установит цели для вашей группы."}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
