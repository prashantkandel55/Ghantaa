"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { verifyAdminCode } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminLogin() {
  const [adminCode, setAdminCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminCode) {
      toast({
        title: "Error",
        description: "Please enter an admin code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await verifyAdminCode(adminCode)

      if (result.success) {
        toast({
          title: "Success",
          description: "Admin authentication successful",
        })

        router.push("/admin/dashboard")
      } else {
        setErrorMessage(result.message)
        setAdminCode("")
      }
    } catch (error) {
      console.error("Admin login error:", error)
      setErrorMessage("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Login</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={false} />
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Secure Admin Access</CardTitle>
              <CardDescription className="text-center">
                Enter your admin code to access the admin dashboard
              </CardDescription>
            </CardHeader>
            {errorMessage && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Authentication Failed</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="adminCode">Admin Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminCode"
                      type="password"
                      placeholder="Enter admin code"
                      className="pl-9"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Security Notice:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    <li>Multiple failed attempts will temporarily lock your account</li>
                    <li>All admin actions are logged for security purposes</li>
                    <li>Sessions automatically expire after 4 hours of inactivity</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Access Admin Dashboard"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <footer className="border-t bg-white py-4">
        <div className="container text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Ghantaa Time Tracking. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
