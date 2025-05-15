"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MobileRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push("/mobile")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Redirecting to mobile interface...</p>
    </div>
  )
}
