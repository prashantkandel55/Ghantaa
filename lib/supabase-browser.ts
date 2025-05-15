import { createClient } from "@supabase/supabase-js"

// This file is safe to import in both client and server components
// It does NOT use next/headers

// Create a singleton instance of the Supabase client for browser usage
let browserClient: ReturnType<typeof createClient> | null = null

export function getBrowserClient() {
  if (browserClient) return browserClient

  browserClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  return browserClient
}

// Re-export createClient for compatibility
export { createClient }
