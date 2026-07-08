"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/LogoMark";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
            <LogoMark className="h-8 w-8 shrink-0 rounded-xl shadow-lg shadow-cyan-500/30 transition group-hover:shadow-cyan-500/45" />
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
