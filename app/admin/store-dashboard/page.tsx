"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployeeStats, getDailyStats } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { useRealtimeSubscription } from "@/hooks/use-realtime"
import { createBrowserClient } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StoreDashboard() {
  const [employees, setEmployees] = useState<any[]>([])
  const [activeEmployees, setActiveEmployees] = useState<any[]>([])
  const [inactiveEmployees, setInactiveEmployees] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState<any>({ totalHours: 0, activeEmployees: 0, totalEmployees: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [storeCapacity, setStoreCapacity] = useState(0)
  const router = useRouter()

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [employeeStats, stats] = await Promise.all([getEmployeeStats(), getDailyStats()])

        setEmployees(employeeStats)
        setActiveEmployees(employeeStats.filter((emp) => emp.isActive))
        setInactiveEmployees(employeeStats.filter((emp) => !emp.isActive))
        setDailyStats(stats)

        // Calculate store capacity (active employees / total employees)
        const capacity = stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0
        setStoreCapacity(capacity)
      } catch (error) {
        console.error("Error fetching store data:", error)
        toast({
          title: "Error",
          description: "Failed to load store dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Subscribe to real-time updates for time_entries
  useRealtimeSubscription(
    "time_entries",
    async (payload) => {
      // Refresh employee stats when time entries change
      const employeeStats = await getEmployeeStats()
      const stats = await getDailyStats()

      setEmployees(employeeStats)
      setActiveEmployees(employeeStats.filter((emp) => emp.isActive))
      setInactiveEmployees(employeeStats.filter((emp) => !emp.isActive))
      setDailyStats(stats)

      // Calculate store capacity
      const capacity = stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0
      setStoreCapacity(capacity)

      // Show toast notification for clock in/out events
      if (payload.new) {
        const supabase = createBrowserClient()
        const { data: employee } = await supabase
          .from("employees")
          .select("name")
          .eq("id", payload.new.employee_id)
          .single()

        if (payload.new.clock_out && !payload.old?.clock_out) {
          // Clock out event
          toast({
            title: "Employee Clocked Out",
            description: `${employee?.name || "Employee"} has clocked out`,
          })
        } else if (!payload.old) {
          // New clock in event
          toast({
            title: "Employee Clocked In",
            description: `${employee?.name || "Employee"} has clocked in`,
          })
        }
      }
    },
    { event: "*" },
  )

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={false} />
            <span className="text-lg font-semibold text-slate-800">Store Dashboard</span>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{formatTime(currentTime)}</div>
            <div className="text-muted-foreground text-xs">{formatDate(currentTime)}</div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Store Status Dashboard</h2>
            <p className="text-muted-foreground">Real-time monitoring of store employees</p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center">Loading store data...</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      Active Employees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{dailyStats.activeEmployees}</div>
                    <p className="text-xs text-muted-foreground">Currently on shift</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <UserX className="h-4 w-4 text-slate-500" />
                      Inactive Employees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-500">
                      {dailyStats.totalEmployees - dailyStats.activeEmployees}
                    </div>
                    <p className="text-xs text-muted-foreground">Not currently on shift</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Total Hours Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dailyStats.totalHours} hrs</div>
                    <p className="text-xs text-muted-foreground">Across all employees</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white mb-6">
                <CardHeader>
                  <CardTitle>Store Capacity</CardTitle>
                  <CardDescription>Current staffing level relative to total employees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Staffing Level</span>
                        <span className="text-sm font-medium">{storeCapacity}%</span>
                      </div>
                      <Progress value={storeCapacity} className="h-2" />
                    </div>

                    {storeCapacity < 30 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Low Staffing Alert</AlertTitle>
                        <AlertDescription>
                          Store is currently understaffed. Consider calling in additional employees.
                        </AlertDescription>
                      </Alert>
                    )}

                    {storeCapacity >= 30 && storeCapacity < 70 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Moderate Staffing</AlertTitle>
                        <AlertDescription>Store has adequate staffing for normal operations.</AlertDescription>
                      </Alert>
                    )}

                    {storeCapacity >= 70 && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-700">Optimal Staffing</AlertTitle>
                        <AlertDescription className="text-green-600">
                          Store is well-staffed with most employees on shift.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="active" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Active Employees
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Inactive Employees
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Employees
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Currently On Shift</CardTitle>
                      <CardDescription>Employees currently clocked in</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeEmployees.length === 0 ? (
                          <p className="text-center py-4">No employees are currently on shift</p>
                        ) : (
                          activeEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between border-b pb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <UserCheck className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{employee.name}</h3>
                                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-green-500">On Shift</Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="inactive">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Not On Shift</CardTitle>
                      <CardDescription>Employees currently clocked out</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {inactiveEmployees.length === 0 ? (
                          <p className="text-center py-4">All employees are currently on shift</p>
                        ) : (
                          inactiveEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between border-b pb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                  <UserX className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{employee.name}</h3>
                                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">Off Shift</Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="all">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>All Employees</CardTitle>
                      <CardDescription>Complete employee roster</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {employees.length === 0 ? (
                          <p className="text-center py-4">No employees found</p>
                        ) : (
                          employees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between border-b pb-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-10 w-10 rounded-full ${employee.isActive ? "bg-green-100" : "bg-slate-100"} flex items-center justify-center`}
                                >
                                  {employee.isActive ? (
                                    <UserCheck className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <UserX className="h-5 w-5 text-slate-500" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{employee.name}</h3>
                                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {employee.isActive ? (
                                  <Badge className="bg-green-500">On Shift</Badge>
                                ) : (
                                  <Badge variant="outline">Off Shift</Badge>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Real-Time Activity Feed</CardTitle>
                  <CardDescription>Live updates of employee clock in/out events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div id="activity-feed" className="h-64 overflow-y-auto border rounded-md p-4">
                    <p className="text-center text-muted-foreground">
                      Real-time activity will appear here as employees clock in and out
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
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
