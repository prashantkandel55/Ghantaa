import { createClient } from "@supabase/supabase-js"
import Cookies from "js-cookie"
import { v4 as uuidv4 } from "uuid"

// Create a Supabase client for browser usage
const createBrowserClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Session duration in seconds (4 hours)
const SESSION_DURATION = 4 * 60 * 60

interface AdminSession {
  id: string
  userId: number
  userName: string
  role: string
  createdAt: number
  expiresAt: number
}

export async function verifyAdminCode(code: string, ipAddress: string): Promise<{ success: boolean; message: string }> {
  const supabase = createBrowserClient()

  try {
    // Verify admin code
    const { data: adminCode, error } = await supabase.from("admin_codes").select("*").eq("code", code).single()

    if (error || !adminCode) {
      return {
        success: false,
        message: "Invalid admin code. Please try again.",
      }
    }

    // Get admin user
    const { data: adminUser } = await supabase
      .from("employees")
      .select("*")
      .eq("role", "admin")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    if (!adminUser) {
      return {
        success: false,
        message: "No admin user found. Please contact system administrator.",
      }
    }

    // Create admin session
    const sessionId = uuidv4()
    const now = Math.floor(Date.now() / 1000)

    const session: AdminSession = {
      id: sessionId,
      userId: adminUser.id,
      userName: adminUser.name,
      role: "admin",
      createdAt: now,
      expiresAt: now + SESSION_DURATION,
    }

    // Store session in cookie using js-cookie
    Cookies.set("admin_session_client", JSON.stringify(session), {
      expires: SESSION_DURATION / (60 * 60 * 24), // Convert seconds to days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    // Log successful login
    await supabase.from("admin_audit_log").insert({
      action: "login",
      user_id: adminUser.id,
      ip_address: ipAddress || "unknown",
      details: "Admin login successful (client)",
    })

    return {
      success: true,
      message: "Authentication successful",
    }
  } catch (error) {
    console.error("Auth error:", error)
    return {
      success: false,
      message: "An error occurred during authentication",
    }
  }
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null

  const sessionCookie = Cookies.get("admin_session_client")

  if (!sessionCookie) {
    return null
  }

  try {
    const session: AdminSession = JSON.parse(sessionCookie)

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expiresAt < now) {
      // Session expired, clear cookie
      Cookies.remove("admin_session_client")
      return null
    }

    return session
  } catch (error) {
    // Invalid session data
    Cookies.remove("admin_session_client")
    return null
  }
}

export function logoutAdmin() {
  if (typeof window === "undefined") return

  const sessionCookie = Cookies.get("admin_session_client")

  if (sessionCookie) {
    try {
      const session: AdminSession = JSON.parse(sessionCookie)

      // Log logout action
      const supabase = createBrowserClient()
      supabase.from("admin_audit_log").insert({
        action: "logout",
        user_id: session.userId,
        details: "Admin logout (client)",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Clear session cookie
  Cookies.remove("admin_session_client")
}

export async function requireAdmin(router: any) {
  const session = getAdminSession()

  if (!session) {
    router.push("/admin/login")
    return null
  }

  return session
}

export async function auditLog(action: string, details: string, userId?: number) {
  const session = getAdminSession()
  const supabase = createBrowserClient()

  await supabase.from("admin_audit_log").insert({
    action,
    user_id: userId || session?.userId,
    details,
  })
}
