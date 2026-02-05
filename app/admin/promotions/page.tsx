import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserRole } from "@/lib/auth/get-user-role";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PromoForm } from "@/components/admin/promo-form";

export default async function AdminPromotionsPage() {
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
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Управление промо-акциями</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Создавайте и управляйте промо-акциями для пользователей
          </p>
        </div>
        <PromoForm />
      </div>

      {!promotions || promotions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Нет промо-акций. Создайте первую акцию.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo: any) => {
            const isActive = promo.is_active && new Date(promo.ends_at) > new Date();
            const isExpired = new Date(promo.ends_at) < new Date();

            return (
              <Card key={promo.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{promo.title}</CardTitle>
                    <Badge variant={isActive ? "default" : isExpired ? "secondary" : "outline"}>
                      {isActive ? "Активна" : isExpired ? "Завершена" : "Неактивна"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>
                  )}
                  {promo.discount_percent && (
                    <p className="text-lg font-semibold mb-2">Скидка {promo.discount_percent}%</p>
                  )}
                  {promo.coupon_code && (
                    <p className="text-sm font-mono bg-muted p-2 rounded mb-2">
                      {promo.coupon_code}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1 mb-4">
                    <p>Начало: {new Date(promo.starts_at).toLocaleDateString("ru-RU")}</p>
                    <p>Окончание: {new Date(promo.ends_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/admin/promotions/${promo.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
