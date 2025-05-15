"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "./supabase"
import type { Schedule } from "./supabase"
import { requireAdmin, auditLog } from "./auth"

// Admin employee management
export async function getEmployeeWithSchedule(employeeId: number): Promise<any> {
  // Ensure admin is authenticated
  await requireAdmin()

  const supabase = createServerClient()

  // Get employee details
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .single()

  if (employeeError || !employee) {
    console.error("Error fetching employee:", employeeError)
    return null
  }

  // Get employee's schedule
  const { data: schedules, error: scheduleError } = await supabase
    .from("schedules")
    .select("*")
    .eq("employee_id", employeeId)

  if (scheduleError) {
    console.error("Error fetching employee schedule:", scheduleError)
    return { ...employee, schedules: [] }
  }

  // Log the action
  await auditLog("view_employee", `Viewed employee details for ${employee.name} (ID: ${employee.id})`)

  return { ...employee, schedules: schedules || [] }
}

// Schedule management
export async function createSchedule(
  schedule: Omit<Schedule, "id" | "created_at" | "updated_at">,
): Promise<Schedule | null> {
  // Ensure admin is authenticated
  const session = await requireAdmin()

  const supabase = createServerClient()

  const { data, error } = await supabase.from("schedules").insert([schedule]).select().single()

  if (error) {
    console.error("Error creating schedule:", error)
    return null
  }

  // Log the action
  await auditLog(
    "create_schedule",
    `Created schedule for employee ID ${schedule.employee_id} on ${schedule.day_of_week}`,
    session.userId,
  )

  revalidatePath("/admin/schedules")
  return data
}

export async function updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule | null> {
  // Ensure admin is authenticated
  const session = await requireAdmin()

  const supabase = createServerClient()

  const { data, error } = await supabase.from("schedules").update(schedule).eq("id", id).select().single()

  if (error) {
    console.error("Error updating schedule:", error)
    return null
  }

  // Log the action
  await auditLog("update_schedule", `Updated schedule ID ${id} for employee ID ${schedule.employee_id}`, session.userId)

  revalidatePath("/admin/schedules")
  return data
}

export async function deleteSchedule(id: number): Promise<boolean> {
  // Ensure admin is authenticated
  const session = await requireAdmin()

  const supabase = createServerClient()

  // Get schedule details before deletion for audit log
  const { data: scheduleData } = await supabase.from("schedules").select("*").eq("id", id).single()

  const { error } = await supabase.from("schedules").delete().eq("id", id)

  if (error) {
    console.error("Error deleting schedule:", error)
    return false
  }

  // Log the action
  await auditLog(
    "delete_schedule",
    `Deleted schedule ID ${id} for employee ID ${scheduleData?.employee_id}`,
    session.userId,
  )

  revalidatePath("/admin/schedules")
  return true
}

// Payroll calculations
export async function calculatePayroll(employeeId: number, startDate: string, endDate: string): Promise<any> {
  // Ensure admin is authenticated
  const session = await requireAdmin()

  const supabase = createServerClient()

  // Get employee details including hourly rate
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .single()

  if (employeeError || !employee) {
    console.error("Error fetching employee for payroll:", employeeError)
    return null
  }

  // Get time entries within date range
  const { data: entries, error: entriesError } = await supabase
    .from("time_entries")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("clock_in", startDate)
    .lte("clock_in", endDate)
    .order("clock_in")

  if (entriesError) {
    console.error("Error fetching time entries for payroll:", entriesError)
    return { employee, entries: [], totalHours: 0, totalPay: 0 }
  }

  // Calculate total hours and pay
  const completedEntries = entries?.filter((entry) => entry.clock_out) || []
  const totalSeconds = completedEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
  const totalHours = totalSeconds / 3600
  const hourlyRate = employee.hourly_rate || 15.0
  const totalPay = totalHours * hourlyRate

  // Log the action
  await auditLog(
    "generate_payroll",
    `Generated payroll report for ${employee.name} from ${startDate} to ${endDate}`,
    session.userId,
  )

  return {
    employee,
    entries: completedEntries,
    totalHours,
    totalPay,
    hourlyRate,
  }
}
