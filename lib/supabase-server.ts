import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// This file should only be imported in Server Components in the App Router
export const createServerClient = () => {
  const cookieStore = cookies()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
  return supabase
}

// Re-export createClient for compatibility
export { createClient }

// Re-export from pure-supabase.ts
export * from "./pure-supabase"
