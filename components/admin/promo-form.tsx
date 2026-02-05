"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PromoForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const discountPercent = formData.get("discount_percent") ? Number(formData.get("discount_percent")) : null;
    const couponCode = formData.get("coupon_code") as string;
    const startsAt = formData.get("starts_at") as string;
    const endsAt = formData.get("ends_at") as string;

    const { error } = await supabase.from("promotions").insert({
      title,
      description: description || null,
      discount_percent: discountPercent,
      coupon_code: couponCode || null,
      starts_at: startsAt,
      ends_at: endsAt,
      is_active: true,
    });

    if (error) {
      toast.error("Ошибка при создании промо-акции");
      console.error(error);
    } else {
      toast.success("Промо-акция создана!");
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать промо-акцию
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать промо-акцию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_percent">Скидка (%)</Label>
              <Input
                id="discount_percent"
                name="discount_percent"
                type="number"
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="coupon_code">Код купона</Label>
              <Input id="coupon_code" name="coupon_code" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starts_at">Начало *</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
              />
            </div>
            <div>
              <Label htmlFor="ends_at">Окончание *</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="min-h-[44px] sm:min-h-0">
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="min-h-[44px] sm:min-h-0">
              {loading ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
