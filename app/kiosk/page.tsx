"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, User, ArrowRight } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getEmployeeByPin, clockIn, clockOut, getActiveTimeEntry } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { useRealtimeSubscription } from "@/hooks/use-realtime"

export default function KioskMode() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const router = useRouter()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Subscribe to real-time updates for time_entries
  useRealtimeSubscription(
    "time_entries",
    async (payload) => {
      if (payload.new) {
        // Add to recent activity
        const supabase = createBrowserClient()
        const { data: employee } = await supabase
          .from("employees")
          .select("name")
          .eq("id", payload.new.employee_id)
          .single()

        const newActivity = {
          id: payload.new.id,
          employeeName: employee?.name || "Employee",
          action: payload.new.clock_out ? "clock_out" : "clock_in",
          time: payload.new.clock_out ? new Date(payload.new.clock_out) : new Date(payload.new.clock_in),
        }

        setRecentActivity((prev) => [newActivity, ...prev].slice(0, 5))
      }
    },
    { event: "*" },
  )

  const handlePinInput = (value: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + value)
    }
  }

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  const handleSubmit = async () => {
    if (pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const employee = await getEmployeeByPin(pin)

      if (employee) {
        // Check if employee is already clocked in
        const activeEntry = await getActiveTimeEntry(employee.id)

        if (activeEntry) {
          // Clock out
          const entry = await clockOut(activeEntry.id)
          if (entry) {
            toast({
              title: "Success",
              description: `${employee.name} has clocked out`,
            })
          }
        } else {
          // Clock in
          const entry = await clockIn(employee.id)
          if (entry) {
            toast({
              title: "Success",
              description: `${employee.name} has clocked in`,
            })
          }
        }
      } else {
        toast({
          title: "Invalid PIN",
          description: "No employee found with this PIN",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Clock in/out error:", error)
      toast({
        title: "Error",
        description: "An error occurred while processing your request",
        variant: "destructive",
      })
    } finally {
      setPin("")
      setIsLoading(false)
    }
  }

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString()
  }

  // Format date as Day, Month Date, Year
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" showTagline={false} />
            <div className="text-2xl font-bold">Kiosk Mode</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">{formatTime(currentTime)}</div>
            <div className="text-slate-400">{formatDate(currentTime)}</div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Employee Clock In/Out</h2>
                    <p className="text-slate-400">Enter your PIN to clock in or out</p>
                  </div>

                  <div className="flex justify-center mb-8">
                    <div className="w-full max-w-[250px] rounded-md border border-slate-700 bg-slate-900 p-4 text-center text-3xl font-mono tracking-widest">
                      {pin
                        .split("")
                        .map((_, i) => "•")
                        .join("")}
                      {Array(4 - pin.length)
                        .fill("_")
                        .join("")}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, index) => (
                      <Button
                        key={index}
                        variant={num === "" ? "ghost" : "outline"}
                        className={`h-16 text-2xl ${
                          num !== ""
                            ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                            : "text-transparent cursor-default"
                        }`}
                        disabled={num === ""}
                        onClick={() => {
                          if (num === "⌫") {
                            handleBackspace()
                          } else if (typeof num === "number") {
                            handlePinInput(num.toString())
                          }
                        }}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>

                  <Button
                    className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
                    onClick={handleSubmit}
                    disabled={pin.length < 4 || isLoading}
                  >
                    {isLoading ? "Processing..." : "Clock In / Out"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Recent clock in/out activity will appear here</p>
                      </div>
                    ) : (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 border-b border-slate-700 pb-4">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              activity.action === "clock_in" ? "bg-green-900" : "bg-red-900"
                            }`}
                          >
                            {activity.action === "clock_in" ? (
                              <ArrowRight className="h-6 w-6 text-green-400" />
                            ) : (
                              <ArrowRight className="h-6 w-6 text-red-400 transform rotate-180" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{activity.employeeName}</div>
                            <div className="text-sm text-slate-400">
                              {activity.action === "clock_in" ? "Clocked In" : "Clocked Out"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="tabular-nums">{formatTime(activity.time)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-8">
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300" asChild>
                      <a href="/admin/store-dashboard">
                        <User className="mr-2 h-4 w-4" /> Admin Dashboard
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-800 py-4">
        <div className="container text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Ghantaa Time Tracking. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
