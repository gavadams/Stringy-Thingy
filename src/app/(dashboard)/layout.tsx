import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Palette, History, Settings } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r min-h-screen">
            <div className="p-6">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Stringy-Thingy
                </span>
              </Link>
              
              <nav className="space-y-2">
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/generate">
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </Link>
                <Link href="/my-generations">
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="mr-2 h-4 w-4" />
                    My Generations
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
