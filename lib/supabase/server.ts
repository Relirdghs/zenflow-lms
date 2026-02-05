import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function stubClient() {
  const empty = Promise.resolve({ data: null, error: null });
  const emptyCount = Promise.resolve({ data: null, count: 0, error: null });
  const emptyList = { data: [] as any[], error: null };
  const chain = (): any => ({
    select: () => chain(),
    eq: () => chain(),
    order: () => chain(),
    limit: () => chain(),
    single: () => empty,
    then(onFulfill: (v: { data: any[]; error: null }) => any) {
      Promise.resolve().then(() => onFulfill(emptyList));
    },
    catch: () => Promise.resolve(emptyList),
  });
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: (_table: string) => ({
      select: (opts?: string | string[] | { count?: string; head?: boolean }) => {
        if (opts && typeof opts === "object" && "head" in opts && opts.head)
          return emptyCount;
        return chain();
      },
      eq: () => chain(),
      order: () => chain(),
      limit: () => chain(),
      single: () => empty,
      then(onFulfill: (v: { data: any[]; count?: number; error: null }) => any) {
        Promise.resolve().then(() => onFulfill(emptyList));
      },
      catch: () => Promise.resolve(emptyList),
    }),
  };
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return stubClient() as ReturnType<typeof createServerClient>;

  try {
    const cookieStore = await cookies();
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Components
          }
        },
      },
    });
  } catch {
    return stubClient() as ReturnType<typeof createServerClient>;
  }
}
