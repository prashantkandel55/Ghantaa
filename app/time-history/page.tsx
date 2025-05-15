"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTimeEntries } from "@/lib/actions"
import type { TimeEntry } from "@/lib/supabase"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TimeHistory() {
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const [employeeName, setEmployeeName] = useState<string>("")
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchDate, setSearchDate] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const router = useRouter()

  // Check if employee is logged in
  useEffect(() => {
    const id = sessionStorage.getItem("employeeId")
    const name = sessionStorage.getItem("employeeName")

    if (!id) {
      router.push("/")
      return
    }

    setEmployeeId(Number.parseInt(id))
    setEmployeeName(name || "Employee")

    // Fetch time entries
    const fetchTimeEntries = async () => {
      setIsLoading(true)
      const entries = await getTimeEntries(Number.parseInt(id))
      setTimeEntries(entries)
      setFilteredEntries(entries)
      setIsLoading(false)
    }

    fetchTimeEntries()
  }, [router])

  // Filter and sort entries when search or sort changes
  useEffect(() => {
    let filtered = [...timeEntries]

    // Apply date filter if searchDate is provided
    if (searchDate) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.clock_in).toLocaleDateString()
        return entryDate.includes(searchDate)
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.clock_in).getTime()
      const dateB = new Date(b.clock_in).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredEntries(filtered)
  }, [searchDate, sortOrder, timeEntries])

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

  // Group entries by date
  const groupEntriesByDate = (entries: TimeEntry[]) => {
    const grouped: Record<string, TimeEntry[]> = {}

    entries.forEach((entry) => {
      const date = new Date(entry.clock_in).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(entry)
    })

    return grouped
  }

  const groupedEntries = groupEntriesByDate(filteredEntries)

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your time history is being exported and will download shortly.",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your time history has been exported successfully.",
      })
    }, 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/employee-dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
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
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Time History</h2>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export History
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by date (MM/DD/YYYY)"
                    className="pl-8"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
                <Select defaultValue="newest" onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center">Loading time entries...</p>
                  </CardContent>
                </Card>
              ) : filteredEntries.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center">No time entries found for this period</p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedEntries).map(([date, entries]) => (
                  <Card key={date}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {entries.map((entry) => (
                          <div key={entry.id} className="grid grid-cols-3 text-sm border-b pb-2">
                            <div>
                              <p className="text-muted-foreground">Clock In</p>
                              <p className="font-medium">{formatTime(entry.clock_in)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Clock Out</p>
                              <p className="font-medium">{formatTime(entry.clock_out)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Hours</p>
                              <p className="font-medium">{calculateDuration(entry.clock_in, entry.clock_out)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="week" className="space-y-4">
              {/* Filter for this week's entries */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Showing entries from the current week</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="space-y-4">
              {/* Filter for this month's entries */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Showing entries from the current month</p>
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
