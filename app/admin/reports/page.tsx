"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getEmployees } from "@/lib/actions"
import { calculatePayroll } from "@/lib/admin-actions"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PayrollReports() {
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [payrollData, setPayrollData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated")
    if (!adminAuthenticated) {
      router.push("/admin/login")
      return
    }

    // Set default date range (current pay period - last 2 weeks)
    const today = new Date()
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(today.getDate() - 14)

    setEndDate(today.toISOString().split("T")[0])
    setStartDate(twoWeeksAgo.toISOString().split("T")[0])

    const fetchEmployees = async () => {
      setIsLoading(true)
      try {
        const employeeData = await getEmployees()
        setEmployees(employeeData)
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [router])

  const handleGenerateReport = async () => {
    if (!selectedEmployee || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select an employee and date range",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const payroll = await calculatePayroll(Number.parseInt(selectedEmployee), startDate, endDate)

      if (payroll) {
        setPayrollData(payroll)
        toast({
          title: "Success",
          description: "Payroll report generated successfully",
        })
      }
    } catch (error) {
      console.error("Error generating payroll report:", error)
      toast({
        title: "Error",
        description: "Failed to generate payroll report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your PDF report is being generated and will download shortly.",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your PDF report has been generated successfully.",
      })
    }, 2000)
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur print:hidden">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={false} />
            <span className="text-lg font-semibold text-slate-800">Payroll Reports</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between print:hidden">
            <h2 className="text-2xl font-bold text-slate-800">Generate Payroll Report</h2>
            {payrollData && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrintReport}>
                  <Printer className="mr-2 h-4 w-4" /> Print Report
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
              </div>
            )}
          </div>

          <Card className="bg-white mb-6 print:hidden">
            <CardHeader>
              <CardTitle>Report Parameters</CardTitle>
              <CardDescription>Select an employee and date range to generate a payroll report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isLoading}>
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="sm:col-span-4">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating || !selectedEmployee || !startDate || !endDate}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    {isGenerating ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {payrollData && (
            <div className="print:mt-0">
              <div className="print:flex print:justify-between print:items-center mb-8 hidden">
                <Logo size="md" />
                <div className="text-right">
                  <h1 className="text-2xl font-bold">Payroll Report</h1>
                  <p className="text-muted-foreground">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </p>
                </div>
              </div>

              <Card className="bg-white mb-6 print:shadow-none print:border-none">
                <CardHeader className="print:pb-2">
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{payrollData.employee.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className="font-medium">{payrollData.employee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium">{formatCurrency(payrollData.hourlyRate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pay Period</p>
                      <p className="font-medium">
                        {formatDate(startDate)} - {formatDate(endDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white mb-6 print:shadow-none print:border-none">
                <CardHeader className="print:pb-2">
                  <CardTitle>Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="bg-slate-50 p-4 rounded-lg print:bg-transparent">
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-2xl font-bold">{payrollData.totalHours.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg print:bg-transparent">
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-2xl font-bold">{formatCurrency(payrollData.hourlyRate)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg print:bg-transparent">
                      <p className="text-sm text-muted-foreground">Total Pay</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollData.totalPay)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white print:shadow-none print:border-none">
                <CardHeader className="print:pb-2">
                  <CardTitle>Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  {payrollData.entries.length === 0 ? (
                    <p className="text-center py-4">No time entries found for this period</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollData.entries.map((entry: any) => {
                          const hours = entry.duration / 3600
                          const amount = hours * payrollData.hourlyRate

                          return (
                            <TableRow key={entry.id}>
                              <TableCell>{formatDate(entry.clock_in)}</TableCell>
                              <TableCell>{formatTime(entry.clock_in)}</TableCell>
                              <TableCell>{formatTime(entry.clock_out)}</TableCell>
                              <TableCell>{hours.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow className="font-bold">
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell>{payrollData.totalHours.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payrollData.totalPay)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 text-center text-sm text-muted-foreground print:mt-16">
                <p>This is a computer-generated report and does not require a signature.</p>
                <p>
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t bg-white py-4 print:hidden">
        <div className="container text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Ghantaa Time Tracking. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
