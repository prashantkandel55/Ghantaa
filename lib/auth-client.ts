"use client"

import { getSupabaseClient } from "./supabase-client"
import { v4 as uuidv4 } from "uuid"

// This file is safe to use in client components
// It does NOT use next/headers or any server-only APIs

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

// Client-side version of verifyAdminCode
export async function verifyAdminCode(code: string, ipAddress: string): Promise<{ success: boolean; message: string }> {
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
      localStorage.setItem("admin_session", JSON.stringify(session))
    }

    // Log successful login
    await supabase.from("admin_audit_log").insert({
      action: "login",
      user_id: adminUser.id,
      ip_address: ipAddress,
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

// Client-side version of getAdminSession
export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null

  const sessionData = localStorage.getItem("admin_session")

  if (!sessionData) {
    return null
  }

  try {
    const session: AdminSession = JSON.parse(sessionData)

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expiresAt < now) {
      // Session expired, clear storage
      localStorage.removeItem("admin_session")
      return null
    }

    return session
  } catch (error) {
    // Invalid session data
    localStorage.removeItem("admin_session")
    return null
  }
}

// Client-side version of logoutAdmin
export function logoutAdmin() {
  if (typeof window === "undefined") return

  const sessionData = localStorage.getItem("admin_session")

  if (sessionData) {
    try {
      const session: AdminSession = JSON.parse(sessionData)

      // Log logout action
      const supabase = getSupabaseClient()
      supabase.from("admin_audit_log").insert({
        action: "logout",
        user_id: session.userId,
        details: "Admin logout (client)",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Clear session storage
  localStorage.removeItem("admin_session")
}

// Client-side version of requireAdmin
export function requireAdmin(router: any) {
  const session = getAdminSession()

  if (!session) {
    router.push("/admin/login")
    return null
  }

  return session
}

// Client-side version of auditLog
export async function auditLog(action: string, details: string, userId?: number) {
  const session = getAdminSession()
  const supabase = getSupabaseClient()

  await supabase.from("admin_audit_log").insert({
    action,
    user_id: userId || session?.userId,
    details: details + " (client)",
  })
}

// Export encrypt function for compatibility
export function encrypt(data: string): string {
  // Simple encryption for client-side
  return btoa(data)
}

// Export decrypt function for compatibility
export function decrypt(data: string): string {
  // Simple decryption for client-side
  return atob(data)
}
