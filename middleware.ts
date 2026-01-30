import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { AppRole } from "@/types/database";
import { getUserRole } from "@/lib/auth/get-user-role";

const DASHBOARD_PREFIX = "/dashboard";
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

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

  const pathname = request.nextUrl.pathname;
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/auth/callback";
  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX);
  const isAdmin = pathname.startsWith(ADMIN_PREFIX);
  const isSuperAdminRoute = pathname.startsWith(`${ADMIN_PREFIX}/super`);

  // Redirect unauthenticated users from protected routes
  if (!user && (isDashboard || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Allow auth callback and login/signup without role check
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
      const url = request.nextUrl.clone();
      url.pathname =
        role === "super_admin" ? "/admin/super" : role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Role-based access: всегда определяем роль через service role (anon-профиль часто null из-за RLS)
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

    // Client: only /dashboard
    if (role === "client" && isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Admin/super_admin: always redirect away from /dashboard
    if ((role === "admin" || role === "super_admin") && isDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = role === "super_admin" ? "/admin/super" : "/admin";
      return NextResponse.redirect(url);
    }

    // Admin: /admin but not /admin/super
    if (role === "admin" && isSuperAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
