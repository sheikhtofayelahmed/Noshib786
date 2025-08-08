"use client";

import { LucideHome } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // Check if we are in admin or agent route
  const isAdmin = pathname.startsWith("/admin");
  const isAgent = pathname.startsWith("/");

  return (
    <nav className="mx-6 mb-4 text-sm font-mono" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 p-0 m-0 list-none">
        {/* Home icon for agent routes */}
        {isAgent && (
          <li className=" shadow-lg hover:scale-105 transition-transform">
            <Link
              href="/"
              className="flex items-center justify-center w-8 h-8 text-lg"
              title="Home"
            >
              <LucideHome></LucideHome>
            </Link>
          </li>
        )}

        {/* Admin link */}
        {isAdmin && (
          <li className="bg-gradient-to-br from-pink-500 to-pink-700 px-3 py-1 rounded-full shadow hover:shadow-lg hover:scale-105 transition-transform">
            <Link href="/admin" className="text-white font-bold tracking-wide">
              👑 Admin
            </Link>
          </li>
        )}

        {/* Remaining breadcrumb parts */}
        {parts.length > 0 &&
          parts.slice(isAdmin || isAgent ? 1 : 0).map((part, idx) => {
            const href =
              "/" +
              parts.slice(0, idx + (isAdmin || isAgent ? 2 : 1)).join("/");
            const isLast = idx === parts.length - (isAdmin || isAgent ? 2 : 1);

            return (
              <li key={href} className="flex items-center">
                {/* Divider */}
                <span className="mx-1 text-yellow-300">🎲</span>

                {!isLast ? (
                  <Link
                    href={href}
                    className="px-3 py-1 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 text-yellow-300 hover:from-purple-500 hover:to-indigo-700 hover:text-white capitalize transition-colors shadow-md hover:shadow-lg"
                  >
                    {part.replace(/-/g, " ")}
                  </Link>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white font-bold capitalize shadow-inner">
                    {part.replace(/-/g, " ")}
                  </span>
                )}
              </li>
            );
          })}
      </ol>
    </nav>
  );
}
