import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export default async function MyGenerationsPage() {
  // Server-side authentication check
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">
          My Generations
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-secondary-700 mb-4">
            Your String Art Creations
          </h2>
          <p className="text-secondary-600 mb-6">
            View and manage your string art designs
          </p>
          <div className="text-secondary-500">
            No generations yet. Start creating!
          </div>
        </div>
      </div>
    </div>
  );
}
