"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getEmployees } from "@/lib/actions"
import { createSchedule, deleteSchedule } from "@/lib/admin-actions"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createServerClient } from "@/lib/supabase-server"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ScheduleManagement() {
  const [employees, setEmployees] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newSchedule, setNewSchedule] = useState({
    employee_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!adminAuthenticated) {
      router.push("/admin/login")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const employeeData = await getEmployees()

        // For each employee, fetch their schedules
        const employeesWithSchedules = await Promise.all(
          employeeData.map(async (employee) => {
            const supabase = createServerClient()
            const { data: schedules } = await supabase
              .from("schedules")
              .select("*")
              .eq("employee_id", employee.id)
              .order("day_of_week")

            return {
              ...employee,
              schedules: schedules || [],
            }
          }),
        )

        setEmployees(employeesWithSchedules)

        // Flatten all schedules for the table view
        const allSchedules = employeesWithSchedules.flatMap((employee) =>
          (employee.schedules || []).map((schedule: any) => ({
            ...schedule,
            employee_name: employee.name,
          })),
        )

        setSchedules(allSchedules)
      } catch (error) {
        console.error("Error fetching schedule data:", error)
        toast({
          title: "Error",
          description: "Failed to load schedule data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleAddSchedule = async () => {
    // Validate input
    if (!newSchedule.employee_id || !newSchedule.day_of_week || !newSchedule.start_time || !newSchedule.end_time) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const schedule = await createSchedule({
        employee_id: Number.parseInt(newSchedule.employee_id),
        day_of_week: Number.parseInt(newSchedule.day_of_week),
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
      })

      if (schedule) {
        toast({
          title: "Success",
          description: "Schedule has been added",
        })

        // Reset form and refresh data
        setNewSchedule({
          employee_id: "",
          day_of_week: "",
          start_time: "",
          end_time: "",
        })

        // Refresh the page to show updated schedules
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding schedule:", error)
      toast({
        title: "Error",
        description: "Failed to add schedule",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSchedule = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      try {
        const success = await deleteSchedule(id)

        if (success) {
          toast({
            title: "Success",
            description: "Schedule has been deleted",
          })

          // Remove the deleted schedule from the state
          setSchedules(schedules.filter((schedule) => schedule.id !== id))
        }
      } catch (error) {
        console.error("Error deleting schedule:", error)
        toast({
          title: "Error",
          description: "Failed to delete schedule",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={false} />
            <span className="text-lg font-semibold text-slate-800">Schedule Management</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Employee Schedules</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-slate-800 hover:bg-slate-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Schedule</DialogTitle>
                  <DialogDescription>Create a new schedule for an employee.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employee" className="text-right">
                      Employee
                    </Label>
                    <Select
                      value={newSchedule.employee_id}
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, employee_id: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="day" className="text-right">
                      Day
                    </Label>
                    <Select
                      value={newSchedule.day_of_week}
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, day_of_week: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSchedule.end_time}
                      onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddSchedule}
                    disabled={isSubmitting}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    {isSubmitting ? "Adding..." : "Add Schedule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center">Loading schedules...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>View and manage employee work schedules</CardDescription>
              </CardHeader>
              <CardContent>
                {schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No Schedules Found</h3>
                    <p className="text-muted-foreground mb-4">No employee schedules have been created yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.employee_name}</TableCell>
                          <TableCell>{DAYS_OF_WEEK[schedule.day_of_week]}</TableCell>
                          <TableCell>{schedule.start_time}</TableCell>
                          <TableCell>{schedule.end_time}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/admin/schedules/${schedule.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
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
