import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Settings, Package, Users, BarChart, FileText, Palette } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication and admin check
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  if (user.profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <ProtectedRoute requireAdmin={true}>
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
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Products
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                </Link>
                <Link href="/admin/codes">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Codes
                  </Button>
                </Link>
                <Link href="/admin/content">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Content
                  </Button>
                </Link>
                <Link href="/admin/frame-generator">
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Frame Generator
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/admin/settings">
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
