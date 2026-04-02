"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, UserCircle2 } from "lucide-react";

import { clearSession, getStoredSession } from "@/lib/auth";

export function SiteHeader() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white shadow-glow">
            CI
          </div>
          <div>
            <p className="font-semibold tracking-tight text-ink">Civic Lens</p>
            <p className="text-xs text-slate-500">Issue reporting and resolution</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/#overview">Overview</Link>
          <Link href="/issues">Citizen Desk</Link>
          <Link href="/admin">Admin Control</Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 sm:flex sm:items-center sm:gap-2">
                {session.user?.role === "admin" ? (
                  <ShieldCheck className="h-4 w-4 text-lagoon" />
                ) : (
                  <UserCircle2 className="h-4 w-4 text-accent" />
                )}
                <span>{session.user?.name}</span>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/70 bg-white/80 p-3 text-slate-700 transition hover:bg-white"
                onClick={() => {
                  clearSession();
                  setSession(null);
                }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
