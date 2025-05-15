"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, History, MapPin, BarChart3, User, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"
import { clockIn, clockOut, getActiveTimeEntry, getTimeEntries } from "@/lib/actions"
import type { TimeEntry } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const [employeeName, setEmployeeName] = useState<string>("")
  const [employeePosition, setEmployeePosition] = useState<string>("")
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [timeWorked, setTimeWorked] = useState<string>("00:00:00")
  const [isLoading, setIsLoading] = useState(false)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<"granted" | "denied" | "prompt">("prompt")
  const isMobile = useMobile()
  const router = useRouter()

  // Check if employee is logged in
  useEffect(() => {
    const id = sessionStorage.getItem("employeeId")
    const name = sessionStorage.getItem("employeeName")
    const position = sessionStorage.getItem("employeePosition")

    if (!id) {
      router.push("/")
      return
    }

    setEmployeeId(Number.parseInt(id))
    setEmployeeName(name || "Employee")
    setEmployeePosition(position || "")

    // Check if employee is already clocked in
    const checkActiveEntry = async () => {
      if (id) {
        const entry = await getActiveTimeEntry(Number.parseInt(id))
        setActiveEntry(entry)
      }
    }

    // Get recent entries
    const fetchRecentEntries = async () => {
      if (id) {
        const entries = await getTimeEntries(Number.parseInt(id))
        setRecentEntries(entries.slice(0, 5))
      }
    }

    checkActiveEntry()
    fetchRecentEntries()
  }, [router])

  // Get user's location
  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationStatus("denied")
      return
    }

    // Try to get the user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus("granted")
      },
      (error) => {
        console.error("Error getting location:", error)
        setLocationStatus("denied")
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    )
  }, [])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      if (activeEntry) {
        const clockInTime = new Date(activeEntry.clock_in)
        const diff = new Date().getTime() - clockInTime.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setTimeWorked(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        )
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [activeEntry])

  const handleClockInOut = async () => {
    if (!employeeId) return

    setIsLoading(true)

    try {
      if (!activeEntry) {
        // Clock in - pass location if available
        const entry = await clockIn(employeeId, location || undefined)
        if (entry) {
          setActiveEntry(entry)
          toast({
            title: "Clocked In",
            description: `You clocked in at ${new Date(entry.clock_in).toLocaleTimeString()}`,
          })

          // Update recent entries
          const entries = await getTimeEntries(employeeId)
          setRecentEntries(entries.slice(0, 5))
        }
      } else {
        // Clock out - pass location if available
        const entry = await clockOut(activeEntry.id, location || undefined)
        if (entry) {
          setActiveEntry(null)
          toast({
            title: "Clocked Out",
            description: `You clocked out at ${new Date(entry.clock_out!).toLocaleTimeString()}`,
          })
          setTimeWorked("00:00:00")

          // Update recent entries
          const entries = await getTimeEntries(employeeId)
          setRecentEntries(entries.slice(0, 5))
        }
      }
    } catch (error) {
      console.error("Clock in/out error:", error)
      toast({
        title: "Error",
        description: "An error occurred while processing your request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("employeeId")
    sessionStorage.removeItem("employeeName")
    sessionStorage.removeItem("employeePosition")
    router.push("/")
  }

  // Format date as MM/DD/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Format time as HH:MM AM/PM
  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString) return "In progress"
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Calculate duration between two dates in hours and minutes
  const calculateDuration = (start: string, end: string | null | undefined) => {
    if (!end) return "In progress"

    const startDate = new Date(start)
    const endDate = new Date(end)
    const diff = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span className={isMobile ? "sr-only" : ""}>Logout</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={false} />
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container">
          <Tabs defaultValue="clock" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="clock" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>Clock</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>History</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>Stats</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clock">
              <div className="flex flex-col items-center justify-center">
                {locationStatus === "denied" && (
                  <Alert variant="warning" className="mb-4 max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Location access denied</AlertTitle>
                    <AlertDescription>
                      You can still clock in/out, but your location won't be recorded. Enable location services in your
                      browser settings if you want to track location.
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-center text-2xl">Welcome, {employeeName}</CardTitle>
                    <CardDescription className="text-center">
                      {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-5xl font-bold tabular-nums">{timeWorked}</div>
                      <p className="text-sm text-muted-foreground">
                        {activeEntry ? "Time since clock in" : "Ready to start"}
                      </p>
                      {locationStatus === "granted" && (
                        <div className="flex items-center text-xs text-green-600 mt-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>Location tracking enabled</span>
                        </div>
                      )}
                      {locationStatus === "denied" && (
                        <div className="flex items-center text-xs text-amber-600 mt-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>Location tracking disabled</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleClockInOut}
                      className={`w-full h-16 text-lg ${activeEntry ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700"}`}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : activeEntry ? "CLOCK OUT" : "CLOCK IN"}
                    </Button>

                    {activeEntry && (
                      <div className="text-center text-sm text-muted-foreground">
                        Clocked in at {formatTime(activeEntry.clock_in)}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Link href="/time-history">
                      <Button variant="outline">View Full History</Button>
                    </Link>
                  </CardFooter>
                </Card>

                {recentEntries.length > 0 && (
                  <Card className="w-full max-w-md mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentEntries.map((entry) => (
                          <div key={entry.id} className="flex justify-between items-center border-b pb-3">
                            <div>
                              <div className="font-medium">{formatDate(entry.clock_in)}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatTime(entry.clock_in)} - {formatTime(entry.clock_out)}
                              </div>
                            </div>
                            <Badge variant={entry.clock_out ? "outline" : "secondary"}>
                              {calculateDuration(entry.clock_in, entry.clock_out)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Time History</CardTitle>
                  <CardDescription>View your complete time entry history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Link href="/time-history">
                      <Button>View Full History</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Your Statistics</CardTitle>
                  <CardDescription>View your work statistics and analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {recentEntries
                            .reduce((total, entry) => {
                              if (entry.duration) {
                                return total + entry.duration / 3600
                              }
                              return total
                            }, 0)
                            .toFixed(1)}{" "}
                          hrs
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Shifts Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {recentEntries.filter((entry) => entry.clock_out).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>View and manage your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{employeeName}</h3>
                      <p className="text-sm text-muted-foreground">{employeePosition}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
