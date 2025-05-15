"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Clock, CheckCircle, XCircle, LogOut, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getEmployeeStats, getDailyStats } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

export default function MobileAdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([])
  const [activeEmployees, setActiveEmployees] = useState<any[]>([])
  const [inactiveEmployees, setInactiveEmployees] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState<any>({ totalHours: 0, activeEmployees: 0, totalEmployees: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const isMobile = useMobile()
  const router = useRouter()

  // Check if admin is authenticated
  useEffect(() => {
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!adminAuthenticated) {
      router.push("/admin/login")
      return
    }
    setIsAdmin(true)
  }, [router])

  // Fetch initial data
  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [employeeStats, stats] = await Promise.all([getEmployeeStats(), getDailyStats()])

        setEmployees(employeeStats)
        setActiveEmployees(employeeStats.filter((emp) => emp.isActive))
        setInactiveEmployees(employeeStats.filter((emp) => !emp.isActive))
        setDailyStats(stats)
      } catch (error) {
        console.error("Error fetching store data:", error)
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
  }, [isAdmin])

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated")
    router.push("/admin/login")
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
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
            <span className="text-lg font-semibold text-slate-800">Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-white">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-green-500" />
                      Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-green-500">{dailyStats.activeEmployees}</div>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{dailyStats.totalHours}</div>
                    <p className="text-xs text-muted-foreground">Total hours</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="active" className="mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="active" className="text-xs">
                    Active ({activeEmployees.length})
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="text-xs">
                    Inactive ({inactiveEmployees.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">
                    All ({employees.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                  <div className="space-y-3">
                    {activeEmployees.length === 0 ? (
                      <p className="text-center py-4 text-sm">No employees are currently active</p>
                    ) : (
                      activeEmployees
                        .filter(
                          (emp) =>
                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.position.toLowerCase().includes(searchTerm.toLowerCase()),
                        )
                        .map((employee) => (
                          <Card key={employee.id} className="bg-white overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium truncate">{employee.name}</h3>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                                    <Badge className="bg-green-500 ml-2">Active</Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="inactive" className="mt-4">
                  <div className="space-y-3">
                    {inactiveEmployees.length === 0 ? (
                      <p className="text-center py-4 text-sm">All employees are currently active</p>
                    ) : (
                      inactiveEmployees
                        .filter(
                          (emp) =>
                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.position.toLowerCase().includes(searchTerm.toLowerCase()),
                        )
                        .map((employee) => (
                          <Card key={employee.id} className="bg-white overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <XCircle className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium truncate">{employee.name}</h3>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                                    <Badge variant="outline" className="ml-2">
                                      Inactive
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-3">
                    {filteredEmployees.length === 0 ? (
                      <p className="text-center py-4 text-sm">No employees match your search</p>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <Card key={employee.id} className="bg-white overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-full ${
                                  employee.isActive ? "bg-green-100" : "bg-slate-100"
                                } flex items-center justify-center flex-shrink-0`}
                              >
                                {employee.isActive ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-slate-500" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium truncate">{employee.name}</h3>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                                  {employee.isActive ? (
                                    <Badge className="bg-green-500 ml-2">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="ml-2">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-slate-800 hover:bg-slate-700" asChild>
                  <Link href="/admin/reports">
                    <Clock className="mr-2 h-4 w-4" /> Reports
                  </Link>
                </Button>
                <Button className="bg-slate-800 hover:bg-slate-700" asChild>
                  <Link href="/admin/schedules">
                    <Users className="mr-2 h-4 w-4" /> Schedules
                  </Link>
                </Button>
              </div>
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
