"use client"

import { getSupabaseClient } from "./pure-supabase"
import { v4 as uuidv4 } from "uuid"
import { encrypt, decrypt } from "./pure-encryption"

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

// Verify admin code
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

// Get admin session
export function getAdminSession(): AdminSession | null {
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

// Logout admin
export function logoutAdmin() {
  if (typeof window === "undefined") return

  localStorage.removeItem("adminAuthenticated")
  localStorage.removeItem("admin_session")
}
