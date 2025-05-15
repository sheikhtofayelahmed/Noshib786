'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const capital = (word) => word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <nav className="text-yellow-400 font-mono text-sm md:text-base mb-4">
      <ul className="flex items-center space-x-2">
        <li>
          <Link href="/admin" className="hover:text-pink-400 font-bold">
            🎮 Admin
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          return (
            <li key={href} className="flex items-center space-x-2">
              <span className="text-red-500">➤</span>
              {isLast ? (
                <span className="text-yellow-300 font-bold">{capital(segment)}</span>
              ) : (
                <Link href={href} className="hover:text-pink-400">
                  {capital(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
