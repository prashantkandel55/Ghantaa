import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ArrowRight, Smartphone, ComputerIcon as Desktop, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white py-4">
        <div className="container flex justify-between items-center">
          <Logo />
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-slate-50 py-16 md:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Time tracking that works for everyone</h1>
                <p className="text-xl text-slate-600">
                  Ghantaa makes it easy to track employee hours, manage schedules, and generate reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-slate-800 hover:bg-slate-700">
                    <Link href="/mobile-access">
                      <Smartphone className="mr-2 h-5 w-5" />
                      Clock In/Out (Mobile)
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/">
                      <Desktop className="mr-2 h-5 w-5" />
                      Desktop Version
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border">
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-24 w-24 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg border">
                <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mobile Access</h3>
                <p className="text-slate-600">Clock in and out from your own device - no special hardware needed.</p>
                <Link href="/mobile-access" className="inline-flex items-center mt-4 text-slate-800 font-medium">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
                <p className="text-slate-600">
                  Accurately track hours with location verification and real-time updates.
                </p>
                <Link href="/employee-dashboard" className="inline-flex items-center mt-4 text-slate-800 font-medium">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
                <p className="text-slate-600">Manage employees, view reports, and handle schedules from anywhere.</p>
                <Link href="/admin/login" className="inline-flex items-center mt-4 text-slate-800 font-medium">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <Logo size="sm" />
            </div>
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Ghantaa Time Tracking. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
