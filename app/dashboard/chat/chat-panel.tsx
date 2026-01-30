"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AppRole } from "@/types/database";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  text: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

interface Thread {
  /** For "my threads": other user id. For "view all": "id1-id2" (sorted). */
  otherId: string;
  otherName: string;
  lastMessage?: string;
  lastAt?: string;
  /** Only set in view-all mode: [id1, id2] for loading messages. */
  pair?: [string, string];
}

interface ChatPanelProps {
  userId: string;
  role: AppRole;
}

export function ChatPanel({ userId, role }: ChatPanelProps) {
  const supabase = createClient();
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewAllMode, setViewAllMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load threads: for client/admin = my threads; for super_admin + viewAllMode = all threads
  useEffect(() => {
    async function loadThreads() {
      const query = supabase
        .from("messages")
        .select("sender_id, receiver_id, text, created_at")
        .order("created_at", { ascending: false });
      if (!(isSuperAdmin && viewAllMode)) {
        query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      }
      const { data: msgs } = await query;

      const seen = new Map<string, { name: string; last: string; at: string; pair?: [string, string] }>();
      const isViewAll = isSuperAdmin && viewAllMode;
      msgs?.forEach((m) => {
        const a = m.sender_id;
        const b = m.receiver_id ?? "";
        const key = isViewAll ? [a, b].sort().join("-") : (a === userId ? b : a);
        if (!key) return;
        if (isViewAll && (a === userId && b === userId)) return;
        if (!seen.has(key)) {
          seen.set(key, {
            name: key.slice(0, 12),
            last: m.text,
            at: m.created_at,
            pair: isViewAll ? [a, b].sort() as [string, string] : undefined,
          });
        }
      });

      const ids = isViewAll
        ? Array.from(seen.keys()).flatMap((k) => k.split("-"))
        : Array.from(seen.keys());
      const uniqIds = [...new Set(ids)];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", uniqIds);

      const list: Thread[] = Array.from(seen.entries())
        .filter(([otherId]) => otherId !== userId)
        .map(([otherId, v]) => {
          const name = isViewAll && v.pair
            ? (v.pair.map((id) => profiles?.find((x) => x.id === id)?.full_name || profiles?.find((x) => x.id === id)?.email || id.slice(0, 8)).join(" / "))
            : (profiles?.find((x) => x.id === otherId)?.full_name || profiles?.find((x) => x.id === otherId)?.email || otherId.slice(0, 8));
          return {
            otherId,
            otherName: name as string,
            lastMessage: v.last,
            lastAt: v.at,
            pair: v.pair,
          };
        });
      setThreads(list);
      if (list.length > 0 && !selectedThread) setSelectedThread(list[0].otherId);
    }
    loadThreads();
  }, [userId, selectedThread, supabase, isSuperAdmin, viewAllMode]);

  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }
    const isPair = selectedThread.includes("-");
    const [id1, id2] = isPair ? selectedThread.split("-") : [userId, selectedThread];
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select(`
          id,
          sender_id,
          receiver_id,
          text,
          created_at,
          profiles:sender_id (full_name, email)
        `)
        .or(
          isPair
            ? `and(sender_id.eq.${id1},receiver_id.eq.${id2}),and(sender_id.eq.${id2},receiver_id.eq.${id1})`
            : `and(sender_id.eq.${userId},receiver_id.eq.${selectedThread}),and(sender_id.eq.${selectedThread},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as unknown as Message[]);
    }
    loadMessages();

    const channel = supabase
      .channel(`messages:${userId}:${selectedThread}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          const match = isPair
              ? ((newMsg.sender_id === id1 && newMsg.receiver_id === id2) || (newMsg.sender_id === id2 && newMsg.receiver_id === id1))
              : ((newMsg.sender_id === userId && newMsg.receiver_id === selectedThread) || (newMsg.receiver_id === userId && newMsg.sender_id === selectedThread));
          if (match) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread, userId, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || !selectedThread) return;
    const isPair = selectedThread.includes("-");
    if (isPair) return; // view-only thread, cannot send
    setLoading(true);
    await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: selectedThread,
      text,
    });
    setInput("");
    setLoading(false);
  }

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || !isAdmin) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq("id", userId)
      .limit(10);
    setSearchResults((data ?? []).map((p) => ({
      id: p.id,
      name: p.full_name || p.email || p.id.slice(0, 8),
    })));
    setSearching(false);
  }, [isAdmin, supabase, userId]);

  const startChat = useCallback((otherUserId: string, name: string) => {
    setSelectedThread(otherUserId);
    setSearchQuery("");
    setSearchResults([]);
    // Добавить новый чат в список threads
    setThreads((prev) => {
      const exists = prev.find((t) => t.otherId === otherUserId);
      if (exists) return prev;
      return [{ otherId: otherUserId, otherName: name }, ...prev];
    });
  }, []);

  return (
    <div className="flex flex-col sm:flex-row flex-1 min-h-0 gap-3 sm:gap-4">
      <Card className="w-full sm:w-56 md:w-64 shrink-0 flex flex-col overflow-hidden max-h-[30vh] sm:max-h-none">
        <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
          {isSuperAdmin && (
            <Button
              variant={viewAllMode ? "secondary" : "outline"}
              size="sm"
              className="w-full mb-2"
              onClick={() => setViewAllMode(!viewAllMode)}
            >
              {viewAllMode ? "Все беседы" : "Мои беседы"}
            </Button>
          )}
          {isAdmin && !viewAllMode && (
            <div className="space-y-2">
              <Input
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="h-9 sm:h-8 text-sm min-h-[44px] sm:min-h-0"
              />
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-32 overflow-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => startChat(user.id, user.name)}
                      className="w-full text-left p-2 text-sm hover:bg-muted border-b last:border-0"
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="text-sm font-medium">Беседы</p>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {threads.map((t) => (
                <button
                  key={t.otherId}
                  type="button"
                  onClick={() => setSelectedThread(t.otherId)}
                  className={`w-full text-left rounded-lg p-2 text-sm transition-colors ${
                    selectedThread === t.otherId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium truncate">{t.otherName}</p>
                  {t.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {t.lastMessage}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col min-w-0 min-h-0">
        {selectedThread ? (
          <>
            <CardHeader className="py-2 sm:py-3 px-3 sm:px-4 border-b shrink-0">
              <p className="font-medium text-sm sm:text-base truncate">
                {threads.find((t) => t.otherId === selectedThread)?.otherName ??
                  selectedThread.slice(0, 8)}
              </p>
            </CardHeader>
            <ScrollArea ref={scrollRef} className="flex-1 p-3 sm:p-4 min-h-0">
              <div className="space-y-2 sm:space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        m.sender_id === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="break-words">{m.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          m.sender_id === userId ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <CardContent className="p-2 sm:p-3 border-t flex gap-2 shrink-0">
              <Input
                disabled={selectedThread.includes("-")}
                placeholder="Сообщение..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                className="min-h-[44px] sm:min-h-0"
              />
              <Button onClick={send} disabled={loading || !input.trim() || selectedThread.includes("-")} className="shrink-0 min-h-[44px] sm:min-h-0 px-3 sm:px-4">
                <span className="hidden sm:inline">Отправить</span>
                <span className="sm:hidden">→</span>
              </Button>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm sm:text-base">
            Выберите беседу
          </CardContent>
        )}
      </Card>
    </div>
  );
}
