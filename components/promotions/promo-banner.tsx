"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Promotion } from "@/types/database";
import { toast } from "sonner";

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endsAt).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">До окончания:</span>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <Badge variant="outline">
            {timeLeft.days}д {timeLeft.hours}ч
          </Badge>
        )}
        {timeLeft.days === 0 && (
          <Badge variant="outline">
            {timeLeft.hours}ч {timeLeft.minutes}м {timeLeft.seconds}с
          </Badge>
        )}
      </div>
    </div>
  );
}

export function PromoBanner() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPromotion = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setPromotion(data as Promotion);
      }
    };

    loadPromotion();
  }, []);

  if (!promotion) {
    return null;
  }

  const handleCopyCoupon = async () => {
    if (promotion.coupon_code) {
      await navigator.clipboard.writeText(promotion.coupon_code);
      setCopied(true);
      toast.success("Купон скопирован!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{promotion.title}</h3>
            {promotion.description && (
              <p className="text-sm text-muted-foreground mb-2">{promotion.description}</p>
            )}
            {promotion.discount_percent && (
              <Badge variant="default" className="mb-2">
                Скидка {promotion.discount_percent}%
              </Badge>
            )}
            <CountdownTimer endsAt={promotion.ends_at} />
          </div>
          {promotion.coupon_code && (
            <Button
              variant="outline"
              onClick={handleCopyCoupon}
              className="shrink-0"
              aria-label={copied ? "Купон скопирован" : `Скопировать купон ${promotion.coupon_code}`}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {promotion.coupon_code}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
