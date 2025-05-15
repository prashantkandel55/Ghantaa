import { Logo } from "@/components/logo"
import { QRCode } from "@/components/qr-code"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MobileAccessPage() {
  // This would be dynamically generated in a real app
  const baseUrl = "https://ghantaa-time-tracking.vercel.app"
  const mobileUrl = `${baseUrl}/mobile`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white py-4">
        <div className="container">
          <Logo />
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Mobile Employee Interface</h1>
            <p className="text-slate-600">Access Ghantaa on your mobile device to clock in and out from anywhere</p>
          </div>

          <div className="flex justify-center">
            <QRCode url={mobileUrl} title="Scan to open on your phone" size={250} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Access Options</h2>

            <div className="space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/mobile">Open Mobile Interface</Link>
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/mobile-install">Installation Instructions</Link>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 space-y-2">
            <h3 className="font-medium">Features</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Clock in/out from your personal device</li>
              <li>• Location verification for accurate tracking</li>
              <li>• View your current time status</li>
              <li>• Track hours worked in real-time</li>
              <li>• Works offline when internet connection is spotty</li>
            </ul>
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
