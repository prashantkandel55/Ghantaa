"use client"

import { createClient } from "@supabase/supabase-js"

// This is a browser-safe version of the Supabase client
// It does NOT use next/headers or any server-only APIs

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabaseClient
}

// Re-export createClient for compatibility
export { createClient } from "@supabase/supabase-js"
