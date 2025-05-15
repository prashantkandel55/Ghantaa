"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Share2, Info } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export default function MobileAppPage() {
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

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
              <span>Back to Login</span>
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
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Ghantaa Mobile App</h2>
            <p className="text-muted-foreground">Install our web app on your device for the best experience</p>
          </div>

          <div className="max-w-md mx-auto">
            {isInstalled ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-green-600">App Installed</CardTitle>
                  <CardDescription className="text-center">Ghantaa is already installed on your device</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4">You can now access Ghantaa directly from your home screen.</p>
                  <Button asChild>
                    <Link href="/">Open Ghantaa</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : isIOS ? (
              <Card>
                <CardHeader>
                  <CardTitle>Install on iOS</CardTitle>
                  <CardDescription>Add Ghantaa to your home screen for quick access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Tap the Share button</h3>
                      <p className="text-sm text-muted-foreground">
                        Tap the <Share2 className="h-4 w-4 inline" /> Share button in Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Tap "Add to Home Screen"</h3>
                      <p className="text-sm text-muted-foreground">Scroll down and tap "Add to Home Screen"</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-blue-100 text-blue-600 mr-3">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Tap "Add"</h3>
                      <p className="text-sm text-muted-foreground">Tap "Add" in the top-right corner</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-700">
                        This website will be installed as an app on your home screen and will run in full-screen mode.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isAndroid && deferredPrompt ? (
              <Card>
                <CardHeader>
                  <CardTitle>Install on Android</CardTitle>
                  <CardDescription>Add Ghantaa to your home screen for quick access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center">
                    Install Ghantaa on your device for a better experience with offline access and faster loading.
                  </p>
                  <div className="flex justify-center">
                    <Button onClick={handleInstallClick} className="bg-slate-800 hover:bg-slate-700">
                      <Download className="mr-2 h-4 w-4" /> Install Ghantaa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Install Ghantaa</CardTitle>
                  <CardDescription>Add our web app to your device</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Ghantaa is a Progressive Web App (PWA) that can be installed on your device for a better experience:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Faster access from your home screen</li>
                    <li>Works offline or with poor internet connection</li>
                    <li>Looks and feels like a native app</li>
                    <li>Receives updates automatically</li>
                  </ul>
                  <div className="bg-slate-100 p-4 rounded-md">
                    <p className="text-sm text-center">
                      To install, open this website in Chrome (Android) or Safari (iOS) and follow the installation
                      instructions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
