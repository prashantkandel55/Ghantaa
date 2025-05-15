"use client"

import { getSupabaseClient } from "./pure-supabase"

// This file does NOT use any server-only APIs like revalidatePath or next/headers

// Employee actions
export async function getEmployees() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("employees").select("*").order("name")

  if (error) {
    console.error("Error fetching employees:", error)
    return []
  }

  return data || []
}

export async function getEmployeeByPin(pin: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("employees").select("*").eq("pin", pin).single()

  if (error) {
    console.error("Error fetching employee by PIN:", error)
    return null
  }

  return data
}

export async function createEmployee(employee) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("employees").insert([employee]).select().single()

  if (error) {
    console.error("Error creating employee:", error)
    return null
  }

  return data
}

// Time entry actions
export async function getTimeEntries(employeeId) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("employee_id", employeeId)
    .order("clock_in", { ascending: false })

  if (error) {
    console.error("Error fetching time entries:", error)
    return []
  }

  return data || []
}

export async function getActiveTimeEntry(employeeId) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("employee_id", employeeId)
    .is("clock_out", null)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    console.error("Error fetching active time entry:", error)
    return null
  }

  return data || null
}

export async function clockIn(employeeId, location) {
  const supabase = getSupabaseClient()

  // Check if employee is already clocked in
  const activeEntry = await getActiveTimeEntry(employeeId)
  if (activeEntry) {
    return activeEntry
  }

  const entry = {
    employee_id: employeeId,
    clock_in: new Date().toISOString(),
    location_in: location ? JSON.stringify(location) : null,
  }

  const { data, error } = await supabase.from("time_entries").insert([entry]).select().single()

  if (error) {
    console.error("Error clocking in:", error)
    return null
  }

  return data
}

export async function clockOut(entryId, location) {
  const supabase = getSupabaseClient()

  // Get the current entry to calculate duration
  const { data: currentEntry, error: fetchError } = await supabase
    .from("time_entries")
    .select("*")
    .eq("id", entryId)
    .single()

  if (fetchError || !currentEntry) {
    console.error("Error fetching time entry for clock out:", fetchError)
    return null
  }

  const clockOutTime = new Date()
  const clockInTime = new Date(currentEntry.clock_in)
  const durationInSeconds = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000)

  const updateData = {
    clock_out: clockOutTime.toISOString(),
    duration: durationInSeconds,
    location_out: location ? JSON.stringify(location) : null,
  }

  const { data, error } = await supabase.from("time_entries").update(updateData).eq("id", entryId).select().single()

  if (error) {
    console.error("Error clocking out:", error)
    return null
  }

  return data
}

// Dashboard and reporting actions
export async function getEmployeeStats() {
  const supabase = getSupabaseClient()

  // Get all employees
  const { data: employees, error: employeeError } = await supabase.from("employees").select("*")

  if (employeeError || !employees) {
    console.error("Error fetching employees for stats:", employeeError)
    return []
  }

  // For each employee, get their time entries and calculate stats
  const stats = await Promise.all(
    employees.map(async (employee) => {
      const { data: entries, error: entriesError } = await supabase
        .from("time_entries")
        .select("*")
        .eq("employee_id", employee.id)

      if (entriesError) {
        console.error(`Error fetching time entries for employee ${employee.id}:`, entriesError)
        return {
          ...employee,
          totalHours: 0,
          totalEntries: 0,
          isActive: false,
        }
      }

      const completedEntries = entries?.filter((entry) => entry.clock_out) || []
      const totalSeconds = completedEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
      const totalHours = Math.floor(totalSeconds / 3600)
      const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

      const isActive = entries?.some((entry) => entry.clock_out === null) || false

      return {
        ...employee,
        totalTime: `${totalHours}h ${totalMinutes}m`,
        totalSeconds,
        totalEntries: completedEntries.length,
        isActive,
      }
    }),
  )

  return stats
}

export async function getDailyStats() {
  const supabase = getSupabaseClient()

  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  // Get all time entries for today
  const { data: entries, error } = await supabase.from("time_entries").select("*").gte("clock_in", todayIso)

  if (error) {
    console.error("Error fetching daily stats:", error)
    return {
      totalHours: 0,
      activeEmployees: 0,
      totalEmployees: 0,
    }
  }

  // Calculate total hours worked today
  const completedEntries = entries?.filter((entry) => entry.clock_out) || []
  const totalSeconds = completedEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

  // Count active employees
  const activeEmployees = new Set(
    entries?.filter((entry) => entry.clock_out === null).map((entry) => entry.employee_id),
  )

  // Get total employee count
  const { count: totalEmployees, error: countError } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })

  if (countError) {
    console.error("Error counting employees:", countError)
  }

  return {
    totalHours: `${totalHours}.${Math.floor(totalMinutes / 6)}`,
    activeEmployees: activeEmployees.size,
    totalEmployees: totalEmployees || 0,
  }
}

// Get weekly stats
export async function getWeeklyStats() {
  const supabase = getSupabaseClient()

  // Get the start of the current week (Sunday)
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Go to Sunday
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfWeekIso = startOfWeek.toISOString()

  // Get all time entries for this week
  const { data: entries, error } = await supabase.from("time_entries").select("*").gte("clock_in", startOfWeekIso)

  if (error) {
    console.error("Error fetching weekly stats:", error)
    return {
      totalHours: 0,
      entriesCount: 0,
      dailyBreakdown: [],
    }
  }

  // Calculate total hours worked this week
  const completedEntries = entries?.filter((entry) => entry.clock_out) || []
  const totalSeconds = completedEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

  // Create daily breakdown
  const dailyBreakdown = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)

    const dayEntries = completedEntries.filter((entry) => {
      const entryDate = new Date(entry.clock_in)
      return (
        entryDate.getDate() === day.getDate() &&
        entryDate.getMonth() === day.getMonth() &&
        entryDate.getFullYear() === day.getFullYear()
      )
    })

    const daySeconds = dayEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
    const dayHours = Math.floor(daySeconds / 3600)
    const dayMinutes = Math.floor((daySeconds % 3600) / 60)

    dailyBreakdown.push({
      date: day.toISOString(),
      dayName: day.toLocaleDateString("en-US", { weekday: "short" }),
      hours: dayHours,
      minutes: dayMinutes,
      totalSeconds: daySeconds,
      entriesCount: dayEntries.length,
    })
  }

  return {
    totalHours: `${totalHours}.${Math.floor(totalMinutes / 6)}`,
    totalSeconds,
    entriesCount: completedEntries.length,
    dailyBreakdown,
  }
}
