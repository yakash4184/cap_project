"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { authApi } from "@/lib/api";
import { clearSession, storeSession } from "@/lib/auth";
import { departments } from "@/lib/constants";

const REQUIRED_MARK = <span className="ml-1 text-red-600">*</span>;

export function AuthForm({ mode = "login", redirectPath = "", requestedRole = "" }) {
  const isLogin = mode === "login";
  const isAdminRegister = mode === "admin-register";
  const router = useRouter();
  const nextPath = redirectPath || "";
  const isAdminLoginRequest = requestedRole === "admin" || nextPath.startsWith("/admin");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    secretKey: "",
    department: departments[0] || "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let response;

      if (isLogin) {
        if (!isAdminLoginRequest) {
          throw new Error("Citizen login uses Email OTP only.");
        }

        response = await authApi.login({
            email: formState.email,
            password: formState.password,
          });

        if (isAdminLoginRequest && response.user.role !== "admin") {
          clearSession();
          throw new Error("Admin login required. Please use an admin account.");
        }
      } else if (isAdminRegister) {
        response = await authApi.registerAdmin({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          department: formState.department,
          adminRegistrationSecret: formState.secretKey,
        });
      } else {
        throw new Error("Citizen password signup is disabled. Use Email OTP login.");
      }

      storeSession(response);

      if (isAdminLoginRequest || isAdminRegister) {
        router.push("/admin");
        return;
      }

      if (nextPath) {
        router.push(nextPath);
        return;
      }

      router.push(response.user.role === "admin" ? "/admin" : "/issues");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-120px)] place-items-center px-4 py-12">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon sm:text-sm">
          {isLogin ? "Admin Login" : isAdminRegister ? "Admin Secure Signup" : "Create Account"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {isLogin
            ? "Admin authentication required"
            : isAdminRegister
              ? "Create an admin account with secret key"
              : "Start reporting civic issues"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {isLogin
            ? "Admin Portal access is protected. Log in with an admin account to continue."
            : isAdminRegister
              ? "Provide the configured secret key before creating a new admin account."
              : "Citizen accounts can submit and track issues. Admin accounts use secure admin signup."}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Full name
                {REQUIRED_MARK}
              </span>
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

          {isAdminRegister ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Secret Key
                {REQUIRED_MARK}
              </span>
              <input
                required
                value={formState.secretKey}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    secretKey: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
                placeholder="Enter admin secret key"
              />
            </label>
          ) : null}

          {isAdminRegister ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Department
                {REQUIRED_MARK}
              </span>
              <select
                required
                value={formState.department}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    department: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Email
              {REQUIRED_MARK}
            </span>
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
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Password
              {REQUIRED_MARK}
            </span>
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

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isLogin ? "Login" : isAdminRegister ? "Create admin account" : "Create account"}
          </button>
        </form>

        {isLogin ? (
          <p className="mt-6 text-sm text-slate-500">
            Need an admin account?{" "}
            <Link
              href="/register-admin?next=/admin&role=admin"
              className="font-semibold text-lagoon"
            >
              Create admin account
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-sm text-slate-500">
            Already registered?{" "}
            <Link
              href={isAdminRegister ? "/login?next=/admin&role=admin" : "/login"}
              className="font-semibold text-lagoon"
            >
              {isAdminRegister ? "Admin login" : "Log in"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
