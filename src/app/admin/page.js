// app/admin/page.js
// This is the main admin dashboard page, protected by middleware.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // CORRECTED: Await the cookies() function call.
  const cookieStore = await cookies(); // Access server-side cookies
  const cookie = cookieStore.get("admin-auth");

  // If the 'admin-auth' cookie is not present or its value is not 'true',
  // redirect the user to the login page. This ensures only authenticated users
  // can access this page.
  if (!cookie || cookie.value !== "true") {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 animate-fire text-yellow-400 drop-shadow-lg">
          🔥 Welcome to Admin Dashboard 🔥
        </h1>
        <p className="text-lg text-gray-300">You're logged in as admin.</p>
        <p className="text-sm mt-4 text-gray-400">
          Navigate using the sidebar to control your game!
        </p>
      </div>
    </main>
  );
}
