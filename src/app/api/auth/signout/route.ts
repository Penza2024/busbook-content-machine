import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as Partial<import("next/dist/compiled/@edge-runtime/cookies").RequestCookie>))
        },
      },
    }
  )

  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL!))
}
