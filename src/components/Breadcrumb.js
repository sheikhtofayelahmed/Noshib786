"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // Check if we are in admin or agent route
  const isAdmin = pathname.startsWith("/admin");
  const isAgent = pathname.startsWith("/");

  return (
    <nav className="text-cyan-300 mx-6 mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="gap-2 list-none p-0 m-0 flex items-center">
        {/* Show Home only for agent routes */}
        {isAgent && (
          <li className="bg-cyan-400 rounded-md ">
            <Link href="/" className="hover:underline text-white text-xl">
              🎮
            </Link>
          </li>
        )}

        {/* Show Admin only for admin routes */}
        {isAdmin && (
          <li>
            <Link href="/admin" className="hover:text-pink-400 font-bold">
              Admin
            </Link>
          </li>
        )}

        {/* Render other parts after the base */}
        {parts.length > 0 &&
          parts.slice(isAdmin || isAgent ? 1 : 0).map((part, idx) => {
            const href =
              "/" +
              parts.slice(0, idx + (isAdmin || isAgent ? 2 : 1)).join("/");
            const isLast = idx === parts.length - (isAdmin || isAgent ? 2 : 1);

            return (
              <li key={href} className="flex items-center">
                <span className="mx-2">/</span>

                {!isLast ? (
                  <Link href={href} className="hover:underline capitalize">
                    {part.replace(/-/g, " ")}
                  </Link>
                ) : (
                  <span className="capitalize font-bold">
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
