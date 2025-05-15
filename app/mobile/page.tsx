"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, User, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { getEmployeeByPin, clockIn, clockOut, getActiveTimeEntry } from "@/lib/actions"

export default function MobilePage() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [activeEntry, setActiveEntry] = useState<any>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const router = useRouter()

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pin) {
      toast({
        title: "Error",
        description: "Please enter your PIN",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get employee by PIN
      const employeeData = await getEmployeeByPin(pin)

      if (!employeeData) {
        toast({
          title: "Error",
          description: "Invalid PIN. Please try again.",
          variant: "destructive",
        })
        setPin("")
        setIsLoading(false)
        return
      }

      setEmployee(employeeData)

      // Check if employee is already clocked in
      const activeEntryData = await getActiveTimeEntry(employeeData.id)
      if (activeEntryData) {
        setActiveEntry(activeEntryData)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockIn = async () => {
    if (!employee) return

    setIsLoading(true)

    try {
      const entry = await clockIn(employee.id, location)

      if (entry) {
        setActiveEntry(entry)

        toast({
          title: "Success",
          description: "You have successfully clocked in.",
        })
      } else {
        throw new Error("Failed to clock in")
      }
    } catch (error) {
      console.error("Clock in error:", error)
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!activeEntry) return

    setIsLoading(true)

    try {
      const entry = await clockOut(activeEntry.id, location)

      if (entry) {
        setActiveEntry(null)

        toast({
          title: "Success",
          description: "You have successfully clocked out.",
        })
      } else {
        throw new Error("Failed to clock out")
      }
    } catch (error) {
      console.error("Clock out error:", error)
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setEmployee(null)
    setActiveEntry(null)
    setPin("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
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
          {!employee ? (
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Mobile Clock In/Out</CardTitle>
                <CardDescription className="text-center">Enter your PIN to clock in or out</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="pin">Employee PIN</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pin"
                        type="password"
                        placeholder="Enter your PIN"
                        className="pl-9 text-center text-xl tracking-widest"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={4}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Continue"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Welcome, {employee.name}</CardTitle>
                <CardDescription className="text-center">
                  {activeEntry ? "You are currently clocked in" : "You are currently clocked out"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-center">
                  <User className="h-16 w-16 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">{employee.position || "Employee"}</p>
                  {activeEntry && (
                    <p className="text-sm text-muted-foreground">
                      Clocked in at {new Date(activeEntry.clock_in).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex justify-center">
                  {activeEntry ? (
                    <Button className="w-32 bg-red-600 hover:bg-red-700" onClick={handleClockOut} disabled={isLoading}>
                      <Clock className="mr-2 h-4 w-4" />
                      Clock Out
                    </Button>
                  ) : (
                    <Button
                      className="w-32 bg-green-600 hover:bg-green-700"
                      onClick={handleClockIn}
                      disabled={isLoading}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Clock In
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          )}
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
