"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Calendar, BarChart3, Plus, Download, Settings, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEmployee, getEmployeeStats, getDailyStats } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState<any>({ totalHours: 0, activeEmployees: 0, totalEmployees: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [newEmployee, setNewEmployee] = useState({ name: "", position: "", pin: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
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
  }, [])

  // Filter employees based on search term and status filter
  useEffect(() => {
    let filtered = employees

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const handleAddEmployee = async () => {
    // Validate input
    if (!newEmployee.name || !newEmployee.position || !newEmployee.pin) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    if (newEmployee.pin.length < 4) {
      toast({
        title: "Validation Error",
        description: "PIN must be at least 4 digits",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const employee = await createEmployee(newEmployee)
      if (employee) {
        toast({
          title: "Success",
          description: `Employee ${employee.name} has been added`,
        })

        // Reset form and refresh data
        setNewEmployee({ name: "", position: "", pin: "" })
        const employeeStats = await getEmployeeStats()
        setEmployees(employeeStats)
        setFilteredEmployees(employeeStats)
      }
    } catch (error) {
      console.error("Error adding employee:", error)
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportData = () => {
    // In a real app, this would generate a CSV or Excel file
    toast({
      title: "Export Started",
      description: "Your data export is being prepared and will download shortly.",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      })
    }, 2000)
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-slate-800 hover:bg-slate-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>Enter the details for the new employee.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="position" className="text-right">
                        Position
                      </Label>
                      <Input
                        id="position"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pin" className="text-right">
                        PIN
                      </Label>
                      <Input
                        id="pin"
                        type="password"
                        value={newEmployee.pin}
                        onChange={(e) => setNewEmployee({ ...newEmployee, pin: e.target.value })}
                        className="col-span-3"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddEmployee}
                      disabled={isSubmitting}
                      className="bg-slate-800 hover:bg-slate-700"
                    >
                      {isSubmitting ? "Adding..." : "Add Employee"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailyStats.totalHours} hrs</div>
                    <p className="text-xs text-muted-foreground">Across {dailyStats.totalEmployees} employees</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Currently Clocked In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailyStats.activeEmployees}</div>
                    <p className="text-xs text-muted-foreground">Out of {dailyStats.totalEmployees} employees</p>
                  </CardContent>
                </Card>

                <Card>
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
                  <Card>
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
                                <p className="text-sm text-muted-foreground">{employee.position}</p>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-sm font-medium ${
                                    employee.isActive ? "text-green-500" : "text-red-500"
                                  }`}
                                >
                                  {employee.isActive ? "Clocked In" : "Clocked Out"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {employee.totalTime} total | {employee.totalEntries} shifts
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Time Reports</CardTitle>
                      <CardDescription>View and export time reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                            <span>Daily Report</span>
                            <span className="text-xs text-muted-foreground">Summary of today's hours</span>
                          </Button>
                          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                            <span>Weekly Report</span>
                            <span className="text-xs text-muted-foreground">Summary of this week's hours</span>
                          </Button>
                          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                            <span>Monthly Report</span>
                            <span className="text-xs text-muted-foreground">Summary of this month's hours</span>
                          </Button>
                          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                            <span>Custom Report</span>
                            <span className="text-xs text-muted-foreground">Create a custom date range report</span>
                          </Button>
                        </div>
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">Export Options</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={handleExportData}>
                              <Download className="mr-2 h-4 w-4" /> Export as CSV
                            </Button>
                            <Button variant="outline" onClick={handleExportData}>
                              <Download className="mr-2 h-4 w-4" /> Export as Excel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-4">
                  <Card>
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
                        <Button className="bg-slate-800 hover:bg-slate-700">
                          <Calendar className="mr-2 h-4 w-4" /> Create Schedule
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
