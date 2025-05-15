"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Download,
  Search,
  Clock,
  LogOut,
  Shield,
  Store,
  Tablet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAdminSession, logoutAdmin } from "@/lib/auth"
import { getEmployeeStats, getDailyStats } from "@/lib/actions"

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState<any>({ totalHours: 0, activeEmployees: 0, totalEmployees: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const adminSession = getAdminSession()
    if (!adminSession) {
      router.push("/admin/login")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [employeeStats, stats] = await Promise.all([getEmployeeStats(), getDailyStats()])

        setEmployees(employeeStats)
        setFilteredEmployees(employeeStats)
        setDailyStats(stats)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh data every minute
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [router])

  // Filter employees based on search term and status filter
  useEffect(() => {
    let filtered = employees

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((emp) => {
        if (filterStatus === "active") return emp.isActive
        if (filterStatus === "inactive") return !emp.isActive
        return true
      })
    }

    setFilteredEmployees(filtered)
  }, [searchTerm, filterStatus, employees])

  const handleLogout = async () => {
    try {
      logoutAdmin()
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if there's an error
      router.push("/admin/login")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Main</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={false} />
            <span className="text-lg font-semibold text-slate-800">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/security">
                  <Shield className="mr-2 h-4 w-4" /> Security
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/reports">
                  <FileText className="mr-2 h-4 w-4" /> Reports
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/store-dashboard">
                  <Store className="mr-2 h-4 w-4" /> Store Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/kiosk">
                  <Tablet className="mr-2 h-4 w-4" /> Kiosk Mode
                </Link>
              </Button>
              <Button className="bg-slate-800 hover:bg-slate-700" asChild>
                <Link href="/admin/schedules">
                  <Calendar className="mr-2 h-4 w-4" /> Manage Schedules
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center">Loading dashboard data...</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailyStats.totalHours} hrs</div>
                    <p className="text-xs text-muted-foreground">Across {dailyStats.totalEmployees} employees</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-green-500" />
                      Currently On Shift
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{dailyStats.activeEmployees}</div>
                    <p className="text-xs text-muted-foreground">Out of {dailyStats.totalEmployees} employees</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(employees.reduce((total, emp) => total + (emp.totalSeconds || 0), 0) / 3600).toFixed(1)} hrs
                    </div>
                    <p className="text-xs text-muted-foreground">This week so far</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="employees" className="mt-6">
                <TabsList>
                  <TabsTrigger value="employees" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Employees
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="mt-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Employee Management</CardTitle>
                      <CardDescription>View and manage your employees</CardDescription>
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search employees..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select defaultValue="all" onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            <SelectItem value="active">Currently Active</SelectItem>
                            <SelectItem value="inactive">Currently Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredEmployees.length === 0 ? (
                          <p className="text-center py-4">
                            {searchTerm || filterStatus !== "all"
                              ? "No employees match your search criteria."
                              : "No employees found. Add your first employee to get started."}
                          </p>
                        ) : (
                          filteredEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between border-b pb-4">
                              <div>
                                <h3 className="font-medium">{employee.name}</h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">{employee.position || "No position"}</p>
                                  <Badge variant="outline" className="text-xs">
                                    ${employee.hourly_rate || 0}/hr
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-sm font-medium ${
                                    employee.isActive ? "text-green-500" : "text-slate-500"
                                  }`}
                                >
                                  {employee.isActive ? "On Shift" : "Off Shift"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {employee.totalTime || "0h"} total | {employee.totalEntries || 0} shifts
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports" className="mt-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Time Reports</CardTitle>
                      <CardDescription>View and export time reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Link href="/admin/reports/daily">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center">
                              <span>Daily Report</span>
                              <span className="text-xs text-muted-foreground">Summary of today's hours</span>
                            </Button>
                          </Link>
                          <Link href="/admin/reports/weekly">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center">
                              <span>Weekly Report</span>
                              <span className="text-xs text-muted-foreground">Summary of this week's hours</span>
                            </Button>
                          </Link>
                          <Link href="/admin/reports/monthly">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center">
                              <span>Monthly Report</span>
                              <span className="text-xs text-muted-foreground">Summary of this month's hours</span>
                            </Button>
                          </Link>
                          <Link href="/admin/reports/custom">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center">
                              <span>Custom Report</span>
                              <span className="text-xs text-muted-foreground">Create a custom date range report</span>
                            </Button>
                          </Link>
                        </div>
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">Export Options</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" asChild>
                              <Link href="/admin/reports/export/csv">
                                <Download className="mr-2 h-4 w-4" /> Export as CSV
                              </Link>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link href="/admin/reports/export/pdf">
                                <Download className="mr-2 h-4 w-4" /> Export as PDF
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Employee Schedule</CardTitle>
                      <CardDescription>View and manage employee schedules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium mb-2">Schedule Management</h3>
                        <p className="text-muted-foreground mb-4">
                          Create and manage employee schedules, shifts, and time off requests.
                        </p>
                        <Button className="bg-slate-800 hover:bg-slate-700" asChild>
                          <Link href="/admin/schedules">
                            <Calendar className="mr-2 h-4 w-4" /> Manage Schedules
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
