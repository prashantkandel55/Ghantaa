"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getAdminSession } from "@/lib/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      return
    }

    // Check if admin is authenticated
    const session = getAdminSession()

    if (!session && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [pathname, router])

  return children
}
