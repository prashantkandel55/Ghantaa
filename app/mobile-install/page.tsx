"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Share2, Info, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"

export default function MobileInstallGuide() {
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const isMobile = useMobile()

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream)
    setIsAndroid(/android/i.test(userAgent))

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
    })

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null)
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
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Install Ghantaa on Your Phone</h2>
            <p className="text-muted-foreground">Get quick access to clock in/out from your device</p>
          </div>

          {isInstalled ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600">App Installed</CardTitle>
                <CardDescription className="text-center">Ghantaa is already installed on your device</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <p className="mb-4">You can now access Ghantaa directly from your home screen.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline">
                    <Link href="/mobile">Employee Access</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/mobile-admin">Admin Access</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={isIOS ? "ios" : isAndroid ? "android" : "general"}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ios">iOS</TabsTrigger>
                <TabsTrigger value="android">Android</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
              </TabsList>

              <TabsContent value="ios" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Install on iPhone or iPad</CardTitle>
                    <CardDescription>Add Ghantaa to your home screen for quick access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium">Open in Safari</h3>
                        <p className="text-sm text-muted-foreground">
                          Make sure you're using Safari browser (not Chrome or others)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium">Tap the Share button</h3>
                        <p className="text-sm text-muted-foreground">
                          Tap the <Share2 className="h-4 w-4 inline" /> Share button at the bottom of the screen
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium">Tap "Add to Home Screen"</h3>
                        <p className="text-sm text-muted-foreground">Scroll down and tap "Add to Home Screen"</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                        4
                      </div>
                      <div>
                        <h3 className="font-medium">Tap "Add"</h3>
                        <p className="text-sm text-muted-foreground">Tap "Add" in the top-right corner</p>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertTitle className="text-blue-700">Benefits</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        Installing as an app gives you full-screen access, offline capabilities, and faster loading
                        times.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="android" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Install on Android</CardTitle>
                    <CardDescription>Add Ghantaa to your home screen for quick access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deferredPrompt ? (
                      <>
                        <p className="text-center">
                          Install Ghantaa on your device for a better experience with offline access and faster loading.
                        </p>
                        <div className="flex justify-center">
                          <Button onClick={handleInstallClick} className="bg-slate-800 hover:bg-slate-700">
                            <Download className="mr-2 h-4 w-4" /> Install Ghantaa
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium">Open in Chrome</h3>
                            <p className="text-sm text-muted-foreground">
                              Make sure you're using Chrome browser for the best experience
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium">Tap the menu button</h3>
                            <p className="text-sm text-muted-foreground">
                              Tap the three dots menu in the top-right corner
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium">Tap "Add to Home screen"</h3>
                            <p className="text-sm text-muted-foreground">
                              Select "Add to Home screen" or "Install app" from the menu
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium">Tap "Add" or "Install"</h3>
                            <p className="text-sm text-muted-foreground">Confirm by tapping "Add" or "Install"</p>
                          </div>
                        </div>
                      </>
                    )}

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertTitle className="text-blue-700">Benefits</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        Installing as an app gives you full-screen access, offline capabilities, and faster loading
                        times.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="general" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Access Ghantaa on Any Device</CardTitle>
                    <CardDescription>Use Ghantaa from your mobile browser</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      You can access Ghantaa directly from your mobile browser without installing it as an app. Simply
                      bookmark this page for quick access.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <Button asChild variant="outline">
                        <Link href="/mobile">Employee Access</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/mobile-admin">Admin Access</Link>
                      </Button>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Recommendation</AlertTitle>
                      <AlertDescription>
                        For the best experience, we recommend installing Ghantaa as an app using the iOS or Android
                        instructions.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
