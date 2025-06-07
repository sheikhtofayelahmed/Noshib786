import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin-auth");

  if (!cookie || cookie.value !== "true") {
    redirect("/admin/login");
  }
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 animate-fire text-fire-500 drop-shadow-lg">
          🔥 Welcome to Admin Page 🔥
        </h1>
        <p className="text-lg text-gray-300">You're logged in as admin.</p>
      </div>
    </main>
  );
}
