"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Store, Monitor, Tablet, Smartphone, Check, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function StoreSetupGuide() {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})

  const toggleStep = (step: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }))
  }

  const getCompletionPercentage = (section: string) => {
    const steps = Object.keys(completedSteps).filter((key) => key.startsWith(section))
    if (steps.length === 0) return 0

    const completed = steps.filter((step) => completedSteps[step]).length
    return Math.round((completed / steps.length) * 100)
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
            <span className="text-lg font-semibold text-slate-800">Store Setup Guide</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <Store className="mr-2 h-6 w-6" /> Store Integration Guide
            </h2>
            <p className="text-muted-foreground">Follow these steps to set up Ghantaa in your store</p>
          </div>

          <Tabs defaultValue="hardware" className="space-y-6">
            <TabsList>
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Hardware Setup
                <Badge variant={getCompletionPercentage("hardware") === 100 ? "default" : "outline"} className="ml-2">
                  {getCompletionPercentage("hardware")}%
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="software" className="flex items-center gap-2">
                <Tablet className="h-4 w-4" />
                Software Setup
                <Badge variant={getCompletionPercentage("software") === 100 ? "default" : "outline"} className="ml-2">
                  {getCompletionPercentage("software")}%
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="deployment" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Deployment
                <Badge variant={getCompletionPercentage("deployment") === 100 ? "default" : "outline"} className="ml-2">
                  {getCompletionPercentage("deployment")}%
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hardware">
              <Card>
                <CardHeader>
                  <CardTitle>Hardware Setup</CardTitle>
                  <CardDescription>Prepare your store's hardware for Ghantaa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["hardware-1"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("hardware-1")}
                      >
                        {completedSteps["hardware-1"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Set up a dedicated kiosk device</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose a tablet or touchscreen computer that will serve as your clock in/out kiosk. We
                          recommend using a device with at least a 10" screen for optimal usability.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">iPad</Badge>
                          <Badge variant="outline">Android Tablet</Badge>
                          <Badge variant="outline">Touchscreen PC</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["hardware-2"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("hardware-2")}
                      >
                        {completedSteps["hardware-2"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Mount the device securely</h3>
                        <p className="text-sm text-muted-foreground">
                          Install a secure mount or kiosk stand near the entrance of your store or in the break room.
                          Ensure it's at a comfortable height for all employees to use.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["hardware-3"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("hardware-3")}
                      >
                        {completedSteps["hardware-3"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Set up reliable internet connection</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure your kiosk device has a stable Wi-Fi or wired internet connection. For optimal
                          performance, we recommend a minimum of 10 Mbps download and 5 Mbps upload speeds.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["hardware-4"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("hardware-4")}
                      >
                        {completedSteps["hardware-4"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Connect power supply</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure your kiosk device is connected to a reliable power source. We recommend using a UPS
                          (Uninterruptible Power Supply) to prevent data loss during power outages.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["hardware-5"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("hardware-5")}
                      >
                        {completedSteps["hardware-5"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Set up manager's dashboard device</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure a separate computer or tablet for store managers to access the admin dashboard. This
                          should be in a secure location, like the manager's office.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Alert>
                    <AlertTitle>Hardware Recommendation</AlertTitle>
                    <AlertDescription>
                      For optimal performance, we recommend using an iPad or Android tablet with at least 4GB of RAM and
                      running the latest OS version. Keep the device in kiosk mode to prevent unauthorized access.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="software">
              <Card>
                <CardHeader>
                  <CardTitle>Software Setup</CardTitle>
                  <CardDescription>Configure the software for your store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["software-1"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("software-1")}
                      >
                        {completedSteps["software-1"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Set up kiosk mode</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure your device to run in kiosk mode, which will display only the Ghantaa app. For
                          iPads, use Guided Access. For Android, use Screen Pinning or a dedicated kiosk app.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/kiosk">Preview Kiosk Mode</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["software-2"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("software-2")}
                      >
                        {completedSteps["software-2"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Add employees to the system</h3>
                        <p className="text-sm text-muted-foreground">
                          Add all your store employees to the Ghantaa system. Assign unique PINs to each employee and
                          set their hourly rates and positions.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/dashboard">Manage Employees</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["software-3"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("software-3")}
                      >
                        {completedSteps["software-3"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Configure employee schedules</h3>
                        <p className="text-sm text-muted-foreground">
                          Set up work schedules for all employees. This will help track attendance and generate accurate
                          reports for payroll.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/schedules">Manage Schedules</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["software-4"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("software-4")}
                      >
                        {completedSteps["software-4"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Set up admin accounts</h3>
                        <p className="text-sm text-muted-foreground">
                          Create admin accounts for store managers. Set secure admin codes and ensure only authorized
                          personnel have access to the admin dashboard.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["software-5"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("software-5")}
                      >
                        {completedSteps["software-5"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Configure real-time notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Set up real-time notifications for important events like employee clock in/out, missed shifts,
                          or unauthorized access attempts.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/store-dashboard">View Real-Time Dashboard</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deployment">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment</CardTitle>
                  <CardDescription>Deploy Ghantaa in your store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["deployment-1"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("deployment-1")}
                      >
                        {completedSteps["deployment-1"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Install as PWA on kiosk device</h3>
                        <p className="text-sm text-muted-foreground">
                          Install Ghantaa as a Progressive Web App (PWA) on your kiosk device. This will allow the app
                          to run in full-screen mode and work offline if needed.
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/mobile-app">Install Instructions</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["deployment-2"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("deployment-2")}
                      >
                        {completedSteps["deployment-2"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Train employees</h3>
                        <p className="text-sm text-muted-foreground">
                          Train all employees on how to use the Ghantaa kiosk for clock in/out. Ensure they understand
                          the importance of using their unique PIN.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["deployment-3"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("deployment-3")}
                      >
                        {completedSteps["deployment-3"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Train managers</h3>
                        <p className="text-sm text-muted-foreground">
                          Train store managers on how to use the admin dashboard for monitoring employee attendance,
                          generating reports, and managing schedules.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["deployment-4"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("deployment-4")}
                      >
                        {completedSteps["deployment-4"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Conduct a trial run</h3>
                        <p className="text-sm text-muted-foreground">
                          Conduct a trial run with a few employees to ensure everything is working correctly. Address
                          any issues before full deployment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mr-4 h-8 w-8 shrink-0 rounded-full ${completedSteps["deployment-5"] ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""}`}
                        onClick={() => toggleStep("deployment-5")}
                      >
                        {completedSteps["deployment-5"] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Go live</h3>
                        <p className="text-sm text-muted-foreground">
                          Once everything is set up and tested, go live with Ghantaa in your store. Monitor the system
                          closely during the first few days to ensure smooth operation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Ready for Deployment</AlertTitle>
                    <AlertDescription className="text-green-600">
                      Once you've completed all the steps above, your Ghantaa system will be ready for use in your
                      store. For additional support, contact our customer service team.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
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
