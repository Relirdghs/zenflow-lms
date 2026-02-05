"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      asChild
      className={cn(
        "justify-start w-full",
        isActive && "bg-primary/10 text-primary font-medium"
      )}
    >
      <Link href={href} className="flex items-center">
        <Icon className="mr-2 h-4 w-4 shrink-0" />
        {label}
      </Link>
    </Button>
  );
}
