"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BurgerNavItem {
  href: string;
  label: string;
}

export type BurgerNavBottomItem =
  | { type: "link"; href: string; label: string }
  | { type: "logout"; label: string };

interface BurgerNavProps {
  title: string;
  titleHref: string;
  items: BurgerNavItem[];
  homeLink?: { href: string; label: string };
  bottomItems?: BurgerNavBottomItem[];
  className?: string;
}

export function BurgerNav({
  title,
  titleHref,
  items,
  homeLink,
  bottomItems = [],
  className = "",
}: BurgerNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`flex md:hidden items-center justify-between shrink-0 border-b border-border bg-background px-3 py-2 ${className}`}
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <Link
        href={titleHref}
        className="text-lg font-semibold text-primary truncate min-w-0"
      >
        {title}
      </Link>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Меню"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(280px,100vw-2rem)] min-w-[200px]"
        >
          {homeLink && (
            <DropdownMenuItem asChild>
              <Link
                href={homeLink.href}
                className="min-h-[44px] flex items-center cursor-pointer"
                onClick={() => setOpen(false)}
              >
                {homeLink.label}
              </Link>
            </DropdownMenuItem>
          )}
          {homeLink && items.length > 0 && (
            <div className="my-1 h-px bg-border" role="separator" />
          )}
          {items.map(({ href, label }) => (
            <DropdownMenuItem key={href} asChild>
              <Link
                href={href}
                className="min-h-[44px] flex items-center cursor-pointer"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
          {bottomItems.length > 0 && (
            <>
              <div className="my-1 h-px bg-border" role="separator" />
              {bottomItems.map((item, i) =>
                item.type === "link" ? (
                  <DropdownMenuItem key={`${item.href}-${i}`} asChild>
                    <Link
                      href={item.href}
                      className="min-h-[44px] flex items-center cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem key={`logout-${i}`} asChild>
                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="min-h-[44px] flex items-center w-full cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </form>
                  </DropdownMenuItem>
                )
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
