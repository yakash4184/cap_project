"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCircle2,
  UserRoundSearch,
} from "lucide-react";

import { clearSession, getStoredSession } from "@/lib/auth";

export function SiteHeader() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon text-white shadow-glow">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight text-ink">Civic Connect Portal</p>
            <p className="text-xs text-slate-500">Citizen services and issue resolution</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          <Link
            href="/#overview"
            className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-blue-50 hover:text-lagoon"
          >
            Overview
          </Link>
          <Link
            href="/issues"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-slate-700 transition hover:bg-blue-50 hover:text-lagoon"
          >
            <UserRoundSearch className="h-4 w-4" />
            Citizen Desk
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-slate-700 transition hover:bg-blue-50 hover:text-lagoon"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin Control
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2 text-sm text-slate-700 sm:flex sm:items-center sm:gap-2">
                {session.user?.role === "admin" ? (
                  <ShieldCheck className="h-4 w-4 text-lagoon" />
                ) : (
                  <UserCircle2 className="h-4 w-4 text-accent" />
                )}
                <span>{session.user?.name}</span>
              </div>
              <button
                type="button"
                className="rounded-full border border-blue-100 bg-white p-3 text-slate-700 transition hover:bg-blue-50"
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
                className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-lagoon px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <nav className="flex w-full items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/65 p-2 text-xs font-semibold text-slate-700 md:hidden">
          <Link
            href="/#overview"
            className="rounded-xl px-3 py-2 transition hover:bg-white hover:text-lagoon"
          >
            Overview
          </Link>
          <Link
            href="/issues"
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 transition hover:bg-white hover:text-lagoon"
          >
            <UserRoundSearch className="h-3.5 w-3.5" />
            Issues
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 transition hover:bg-white hover:text-lagoon"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
