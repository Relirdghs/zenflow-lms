import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale/ru";
import Link from "next/link";
import { createClient as createClientClient } from "@/lib/supabase/client";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Уведомления</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Все уведомления прочитаны"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton userId={user.id} />}
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              У вас нет уведомлений.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.is_read ? "opacity-75" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(notification.created_at || ""), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    </div>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                    )}
                    {notification.link && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={notification.link}>Перейти</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
