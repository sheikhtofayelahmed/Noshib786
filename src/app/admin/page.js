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
    <main className="min-h-screen -mt-32 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-center">
          <h1 className="font-bangla text-2xl md:text-7xl font-bold mb-4 text-yellow-400 drop-shadow-lg animate-flicker">
            🔥 আল্লাহ ভরসা 🔥
          </h1>
          <img
            src="dowa.png"
            alt="Dowa"
            className="mx-auto pt-10 w-64 md:w-96 drop-shadow-2xl animate-pulse"
          />
        </div>
      </div>
    </main>
  );
}
