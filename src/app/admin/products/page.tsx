import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  // Server-side authentication and admin check
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  if (user.profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">
          Manage Products
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-secondary-700 mb-4">
            Product Management
          </h2>
          <p className="text-secondary-600 mb-6">
            Manage your string art kits and products
          </p>
          <div className="text-secondary-500">
            Product management interface coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
