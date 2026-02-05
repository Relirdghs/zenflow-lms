import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { AppRole } from "@/types/database";
import { getUserRole } from "@/lib/auth/get-user-role";

const DASHBOARD_PREFIX = "/dashboard";
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/") {
    return NextResponse.next({ request });
  }

  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX);
  const isAdmin = pathname.startsWith(ADMIN_PREFIX);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthPage =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/auth/callback";
    const isSuperAdminRoute = pathname.startsWith(`${ADMIN_PREFIX}/super`);

    if (!user && (isDashboard || isAdmin)) {
      const nextUrl = request.nextUrl.clone();
      nextUrl.pathname = "/login";
      nextUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(nextUrl);
    }

    if (isAuthPage) {
      if (user) {
        let role: AppRole;
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { getRoleForRedirect } = await import("@/lib/auth/role-for-middleware");
          role = await getRoleForRedirect(user.id, user.email, user.user_metadata);
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          role = getUserRole(profile?.role as AppRole | null | undefined, user);
        }
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname =
          role === "super_admin" ? "/admin/super" : role === "admin" ? "/admin" : "/dashboard";
        return NextResponse.redirect(nextUrl);
      }
      return response;
    }

    if (user && (isDashboard || isAdmin)) {
      let role: AppRole;
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { getRoleForRedirect } = await import("@/lib/auth/role-for-middleware");
        role = await getRoleForRedirect(user.id, user.email, user.user_metadata);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        role = getUserRole(profile?.role as AppRole | null | undefined, user);
      }

      if (role === "client" && isAdmin) {
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = "/dashboard";
        return NextResponse.redirect(nextUrl);
      }

      if ((role === "admin" || role === "super_admin") && isDashboard) {
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = role === "super_admin" ? "/admin/super" : "/admin";
        return NextResponse.redirect(nextUrl);
      }

      if (role === "admin" && isSuperAdminRoute) {
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = "/admin";
        return NextResponse.redirect(nextUrl);
      }
    }

    return response;
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
