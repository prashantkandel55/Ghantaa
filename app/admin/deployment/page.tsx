"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Server, Globe, Database, Shield, CheckCircle2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { PreLaunchChecklist } from "@/components/pre-launch-checklist"

export default function DeploymentGuidePage() {
  const [deploymentStatus, setDeploymentStatus] = useState<"not-started" | "in-progress" | "completed">("not-started")

  const simulateDeployment = () => {
    setDeploymentStatus("in-progress")

    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus("completed")
    }, 3000)
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
            <span className="text-lg font-semibold text-slate-800">Deployment Guide</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Ghantaa Deployment Guide</h2>
            <p className="text-muted-foreground">Follow these steps to deploy your time tracking app</p>
          </div>

          <Tabs defaultValue="checklist" className="space-y-6">
            <TabsList>
              <TabsTrigger value="checklist" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Pre-Launch Checklist
              </TabsTrigger>
              <TabsTrigger value="deployment" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Deployment Steps
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domain Setup
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Migration
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Checklist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist">
              <PreLaunchChecklist />
            </TabsContent>

            <TabsContent value="deployment">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Steps</CardTitle>
                  <CardDescription>Follow these steps to deploy Ghantaa to production</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-green-100 text-green-600 mr-3">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium">Set up environment variables</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure all required environment variables are set in your production environment.
                        </p>
                        <div className="mt-2 bg-slate-100 p-3 rounded text-sm font-mono">
                          <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
                          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
                          <p>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</p>
                          <p>ENCRYPTION_KEY=your-encryption-key</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-green-100 text-green-600 mr-3">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">Build the application</h3>
                        <p className="text-sm text-muted-foreground">
                          Run the build command to create an optimized production build.
                        </p>
                        <div className="mt-2 bg-slate-100 p-3 rounded text-sm font-mono">
                          <p>npm run build</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-green-100 text-green-600 mr-3">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium">Deploy to Vercel</h3>
                        <p className="text-sm text-muted-foreground">
                          Deploy your application to Vercel for optimal performance.
                        </p>
                        <div className="mt-2">
                          <Button
                            onClick={simulateDeployment}
                            disabled={deploymentStatus !== "not-started"}
                            className="bg-black hover:bg-gray-800"
                          >
                            {deploymentStatus === "not-started" && "Deploy to Vercel"}
                            {deploymentStatus === "in-progress" && "Deploying..."}
                            {deploymentStatus === "completed" && "Deployed Successfully"}
                          </Button>

                          {deploymentStatus === "completed" && (
                            <div className="mt-2 flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              <span className="text-sm">Deployment successful! Your app is now live.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-green-100 text-green-600 mr-3">
                        4
                      </div>
                      <div>
                        <h3 className="font-medium">Configure custom domain</h3>
                        <p className="text-sm text-muted-foreground">
                          Set up your custom domain for a professional appearance.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline">Configure Domain</Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-green-100 text-green-600 mr-3">
                        5
                      </div>
                      <div>
                        <h3 className="font-medium">Monitor application</h3>
                        <p className="text-sm text-muted-foreground">
                          Set up monitoring and analytics to track application performance.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline">Set Up Monitoring</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Setup</CardTitle>
                  <CardDescription>Configure your custom domain for Ghantaa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Domain Configuration Required</h3>
                        <p className="text-sm text-amber-700">
                          For a professional appearance, configure a custom domain for your application instead of using
                          the default Vercel URL.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Recommended Domains</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-md p-4">
                          <p className="font-medium">ghantaa.com</p>
                          <p className="text-sm text-muted-foreground">Primary domain option</p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm">
                              Check Availability
                            </Button>
                          </div>
                        </div>
                        <div className="border rounded-md p-4">
                          <p className="font-medium">ghantaa.app</p>
                          <p className="text-sm text-muted-foreground">Modern app domain</p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm">
                              Check Availability
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">DNS Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        After purchasing your domain, configure these DNS records with your domain provider:
                      </p>
                      <div className="bg-slate-100 p-3 rounded text-sm font-mono">
                        <p>Type: A, Name: @, Value: 76.76.21.21</p>
                        <p>Type: CNAME, Name: www, Value: cname.vercel-dns.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Migration</CardTitle>
                  <CardDescription>Prepare your database for production</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Database Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Before migrating to production, create a backup of your development database.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline">Create Database Backup</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Production Database Setup</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensure your production database is properly configured with all required tables.
                      </p>
                      <div className="bg-slate-100 p-3 rounded text-sm font-mono overflow-auto">
                        <p>-- Required tables</p>
                        <p>- employees</p>
                        <p>- time_entries</p>
                        <p>- schedules</p>
                        <p>- admin_codes</p>
                        <p>- login_attempts</p>
                        <p>- admin_audit_log</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Database Indexing</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensure all necessary indexes are created for optimal performance.
                      </p>
                      <div className="bg-slate-100 p-3 rounded text-sm font-mono overflow-auto">
                        <p>-- Recommended indexes</p>
                        <p>CREATE INDEX idx_time_entries_employee_id ON time_entries(employee_id);</p>
                        <p>CREATE INDEX idx_time_entries_clock_in ON time_entries(clock_in);</p>
                        <p>CREATE INDEX idx_schedules_employee_id ON schedules(employee_id);</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Database Connection Pool</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure connection pooling for better performance under load.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline">Configure Connection Pool</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Checklist</CardTitle>
                  <CardDescription>Ensure your application is secure before going live</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Environment Variables</h3>
                        <p className="text-sm text-muted-foreground">
                          All sensitive information is stored in environment variables, not in the codebase.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Authentication Security</h3>
                        <p className="text-sm text-muted-foreground">
                          Secure authentication with rate limiting and session management is implemented.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Data Encryption</h3>
                        <p className="text-sm text-muted-foreground">
                          Sensitive data is encrypted both in transit (HTTPS) and at rest.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Input Validation</h3>
                        <p className="text-sm text-muted-foreground">
                          All user inputs are validated to prevent injection attacks.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">CSRF Protection</h3>
                        <p className="text-sm text-muted-foreground">
                          Cross-Site Request Forgery protection is implemented.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">XSS Prevention</h3>
                        <p className="text-sm text-muted-foreground">
                          Cross-Site Scripting prevention measures are in place.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Security Headers</h3>
                        <p className="text-sm text-muted-foreground">
                          Appropriate security headers are configured (Content-Security-Policy, X-XSS-Protection, etc.).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Database Security</h3>
                        <p className="text-sm text-muted-foreground">
                          Database access is properly restricted and queries are parameterized.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Audit Logging</h3>
                        <p className="text-sm text-muted-foreground">
                          Security events are logged for monitoring and compliance.
                        </p>
                      </div>
                    </div>
                  </div>
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
