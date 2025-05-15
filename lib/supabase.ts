import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type Employee = {
  id: number
  name: string
  position: string
  pin: string
  role: "admin" | "employee"
  hourly_rate?: number
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export type TimeEntry = {
  id: number
  employee_id: number
  clock_in: string
  clock_out?: string | null
  duration?: number | null
  location_in?: string | null
  location_out?: string | null
  created_at?: string
  updated_at?: string
}

export type Schedule = {
  id: number
  employee_id: number
  day_of_week: number // 0-6 for Sunday-Saturday
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  created_at?: string
  updated_at?: string
}

export type AdminCode = {
  id: number
  code: string
  created_at?: string
  updated_at?: string
}

// Create a single supabase client for server-side usage
export const createServerClient = () => {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Create a singleton for client-side usage
let clientInstance: ReturnType<typeof createClient> | null = null

export const createBrowserClient = () => {
  if (clientInstance) return clientInstance

  // Create client with real-time enabled
  clientInstance = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return clientInstance
}
