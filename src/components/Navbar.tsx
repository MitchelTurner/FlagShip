"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");

  // Admin is intentionally unlisted — no nav links on public pages.
  if (onAdmin) return null;

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <nav className="glass-strong flex items-center justify-between rounded-2xl px-5 py-3 shadow-lg shadow-black/30">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-cyan-400 to-teal-300 text-white shadow-lg shadow-cyan-500/30">
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M2 8c2.2 0 2.2 2 4.4 2S8.6 8 10.8 8 13 10 15.2 10 17.4 8 19.6 8 21.8 10 24 10" />
                <path d="M2 14c2.2 0 2.2 2 4.4 2s2.2-2 4.4-2 2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight">
              mitchelturner<span className="text-white/40">.dev</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
