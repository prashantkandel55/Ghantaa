"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, RefreshCw, Search, CheckCircle, XCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function SecurityPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loginAttempts, setLoginAttempts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const fetchSecurityData = async () => {
      setIsLoading(true)
      try {
        // Fetch audit logs and login attempts from API
        const logsRes = await fetch("/api/admin/audit-logs")
        const attemptsRes = await fetch("/api/admin/login-attempts")
        const logs = await logsRes.json()
        const attempts = await attemptsRes.json()
        setAuditLogs(logs || [])
        setLoginAttempts(attempts || [])
      } catch (error) {
        console.error("Error fetching security data:", error)
        toast({
          title: "Error",
          description: "Failed to load security data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecurityData()
  }, [router])

  // Filter audit logs based on search term and action filter
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employees?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = filterAction === "all" || log.action === filterAction

    return matchesSearch && matchesAction
  })

  const refreshData = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Refreshed",
        description: "Security data has been refreshed",
      })
    }, 1000)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get action badge variant
  const getActionBadge = (action: string) => {
    switch (action) {
      case "login":
        return <Badge className="bg-green-500">Login</Badge>
      case "logout":
        return <Badge className="bg-blue-500">Logout</Badge>
      case "failed_login":
        return <Badge className="bg-red-500">Failed Login</Badge>
      default:
        return <Badge>{action}</Badge>
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
            <span className="text-lg font-semibold text-slate-800">Security Center</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <Shield className="mr-2 h-6 w-6 text-slate-800" /> Security Monitoring
            </h2>
            <p className="text-muted-foreground">Monitor security events and login attempts</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed Login Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">
                  {loginAttempts.reduce((total, attempt) => total + (attempt.attempt_count || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total failed attempts</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {loginAttempts.filter((attempt) => attempt.is_locked).length}
                </div>
                <p className="text-xs text-muted-foreground">Currently locked IP addresses</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs.length}</div>
                <p className="text-xs text-muted-foreground">Total logged events</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white mb-6">
            <CardHeader>
              <CardTitle>Login Attempts</CardTitle>
              <CardDescription>Recent login attempts and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading login attempts...</div>
              ) : loginAttempts.length === 0 ? (
                <div className="text-center py-4">No login attempts recorded</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Attempt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.ip_address}</TableCell>
                        <TableCell>{attempt.attempt_count}</TableCell>
                        <TableCell>
                          {attempt.is_locked ? (
                            <div className="flex items-center text-red-500">
                              <XCircle className="h-4 w-4 mr-1" /> Locked until {formatDate(attempt.locked_until)}
                            </div>
                          ) : (
                            <div className="flex items-center text-green-500">
                              <CheckCircle className="h-4 w-4 mr-1" /> Active
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(attempt.last_attempt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Security Audit Log</CardTitle>
              <CardDescription>Record of all security-related activities</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select defaultValue="all" onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="failed_login">Failed Login</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading audit logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-4">No audit logs found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>{log.employees?.name || "System"}</TableCell>
                        <TableCell>{log.ip_address || "N/A"}</TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
