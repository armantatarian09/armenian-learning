"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/review", label: "Review" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="top-nav" aria-label="Primary">
      <Link href="/" className="brand" aria-label="ArmenianLingo home">
        ArmenianLingo
      </Link>
      <nav className="nav-links">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
