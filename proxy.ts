import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renamed Middleware → Proxy (same functionality). Refreshes the
// Supabase session cookie so tokens don't silently expire.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // If Supabase isn't configured (local dev without auth), do nothing.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser(); // validates + refreshes the token
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
