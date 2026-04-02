"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { authApi } from "@/lib/api";
import { storeSession } from "@/lib/auth";

export function AuthForm({ mode = "login" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = isLogin
        ? await authApi.login({
            email: formState.email,
            password: formState.password,
          })
        : await authApi.register(formState);

      storeSession(response);
      router.push(response.user.role === "admin" ? "/admin" : "/issues");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-120px)] place-items-center px-4 py-12">
      <div className="glass-panel w-full max-w-xl rounded-[32px] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-lagoon">
          {isLogin ? "Welcome Back" : "Create Account"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
          {isLogin ? "Access the civic operations hub" : "Start reporting civic issues"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {isLogin
            ? "Log in as a citizen or admin to track, assign, and resolve reported issues."
            : "Citizen accounts can submit and track issues. Admin accounts can manage workflows."}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Full name</span>
              <input
                required
                value={formState.name}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
                placeholder="Akash Yadav"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
            <input
              required
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  email: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
            <input
              required
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  password: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
              placeholder="At least 6 characters"
            />
          </label>

          {!isLogin ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Role</span>
              <select
                value={formState.role}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    role: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
              >
                <option value="user">Citizen</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isLogin ? "Login" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          {isLogin ? "Need an account?" : "Already registered?"}{" "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-semibold text-lagoon"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
