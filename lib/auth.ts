// REMOVED "use server" directive
// Import only client-side modules
import { getSupabaseClient } from "./pure-supabase"
import { encrypt, decrypt } from "./pure-encryption"
import { v4 as uuidv4 } from "uuid"

// Session duration in seconds (4 hours)
const SESSION_DURATION = 4 * 60 * 60

// Maximum failed login attempts before temporary lockout
const MAX_FAILED_ATTEMPTS = 5

// Lockout duration in seconds (15 minutes)
const LOCKOUT_DURATION = 15 * 60

interface AdminSession {
  id: string
  userId: number
  userName: string
  role: string
  createdAt: number
  expiresAt: number
}

// Verify admin code - already async
export async function verifyAdminCode(code: string): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient()

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

    // Store session in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("adminAuthenticated", "true")
      localStorage.setItem("admin_session", encrypt(JSON.stringify(session)))
    }

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

// Get admin session - make async
export async function getAdminSession(): Promise<AdminSession | null> {
  if (typeof window === "undefined") return null

  const sessionData = localStorage.getItem("admin_session")

  if (!sessionData) {
    return null
  }

  try {
    const decryptedSession = decrypt(sessionData)
    const session: AdminSession = JSON.parse(decryptedSession)

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expiresAt < now) {
      // Session expired, clear storage
      localStorage.removeItem("adminAuthenticated")
      localStorage.removeItem("admin_session")
      return null
    }

    return session
  } catch (error) {
    // Invalid session data
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("admin_session")
    return null
  }
}

// Logout admin - make async
export async function logoutAdmin() {
  if (typeof window === "undefined") return

  localStorage.removeItem("adminAuthenticated")
  localStorage.removeItem("admin_session")
}

// Require admin (client-side) - make async
export async function requireAdmin(router) {
  const session = await getAdminSession()

  if (!session) {
    router.push("/admin/login")
    return null
  }

  return session
}

// Audit log (client-side) - already async
export async function auditLog(action: string, details: string, userId?: number) {
  const session = await getAdminSession()
  const supabase = getSupabaseClient()

  await supabase.from("admin_audit_log").insert({
    action,
    user_id: userId || session?.userId,
    details: details + " (client)",
  })
}
