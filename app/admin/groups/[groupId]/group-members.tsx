"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface GroupMembersProps {
  groupId: string;
  initialMembers: Member[];
}

export function GroupMembers({ groupId, initialMembers }: GroupMembersProps) {
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);

  async function handleSearch() {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    const { data, error: searchError } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(10);
    setSearching(false);
    if (searchError) {
      setError("Не удалось выполнить поиск. Попробуйте позже.");
      return;
    }
    setResults((data ?? []) as Member[]);
  }

  async function addMember(member: Member) {
    if (memberIds.has(member.id)) return;
    const { error: insertError } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: member.id });
    if (insertError) {
      setError("Не удалось добавить участника.");
      return;
    }
    setMembers((prev) => [...prev, member]);
  }

  async function removeMember(memberId: string) {
    const { error: deleteError } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", memberId);
    if (deleteError) {
      setError("Не удалось удалить участника.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Участники группы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или email"
          />
          <Button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? "Поиск..." : "Найти"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(u.full_name ?? u.email ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {u.full_name || u.email || u.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={memberIds.has(u.id)}
                  onClick={() => addMember(u)}
                >
                  {memberIds.has(u.id) ? "Уже в группе" : "Добавить"}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {members.length > 0 ? (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(m.full_name ?? m.email ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {m.full_name || m.email || m.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{m.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMember(m.id)}
                >
                  Удалить
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Участников пока нет.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
