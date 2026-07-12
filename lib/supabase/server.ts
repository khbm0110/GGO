import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use inside Server Components, Server Actions, and Route Handlers.
// Reads the user's session from cookies, so RLS policies apply based on
// the real logged-in user — never bypassed from the server side.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Can be called from a Server Component where cookies can't
            // be set — safe to ignore since middleware refreshes sessions.
          }
        },
      },
    }
  );
}

// Admin client — SERVICE ROLE KEY, bypasses RLS. Only import this in
// server-only code (route handlers / admin dashboard actions) that
// explicitly needs elevated access (e.g. banning a user). NEVER import
// this in a file that could end up in a client bundle.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
