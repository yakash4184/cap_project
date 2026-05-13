"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, MailCheck } from "lucide-react";

import { authApi } from "@/lib/api";
import { storeSession } from "@/lib/auth";

const REQUIRED_MARK = <span className="ml-1 text-red-600">*</span>;

export function CitizenOtpLoginForm({ redirectPath = "" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendSecondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setResendSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [resendSecondsLeft]);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsRequesting(true);

    try {
      const response = await authApi.requestOtp({
        email,
      });

      setOtpRequested(true);
      setOtp("");
      setResendSecondsLeft(response.resendCooldownSeconds || 60);
      if (response.deliveryMode === "console" && response.debugOtp) {
        setNotice(
          `Email service configured nahi hai. Local test OTP: ${response.debugOtp}`
        );
      } else if (response.deliveryMode === "console") {
        setNotice(
          "SMTP configured nahi hai. OTP backend server terminal me generate hua hai."
        );
      } else {
        setNotice("OTP sent to your email. Please verify to continue.");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsVerifying(true);

    try {
      const response = await authApi.verifyOtp({
        email,
        otp,
      });

      storeSession(response);
      router.push(redirectPath || "/issues");
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const canResend = otpRequested && resendSecondsLeft === 0;

  return (
    <div className="grid min-h-[calc(100vh-120px)] place-items-center px-4 py-12">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon sm:text-sm">
          Citizen Secure Login
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Login with Email OTP
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Enter your email, verify OTP, then submit and track complaints securely.
        </p>

        <form className="mt-8 space-y-4" onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Email Address
              {REQUIRED_MARK}
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={otpRequested}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon disabled:bg-slate-50"
              placeholder="you@example.com"
            />
          </label>

          {otpRequested ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                OTP
                {REQUIRED_MARK}
              </span>
              <input
                required
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
                placeholder="Enter 6-digit OTP"
              />
            </label>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {notice}
            </div>
          ) : null}

          {!otpRequested ? (
            <button
              type="submit"
              disabled={isRequesting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRequesting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
              Send OTP
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isVerifying}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifying ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Verify OTP and Login
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={!canResend || isRequesting}
                className="w-full rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {canResend
                  ? "Resend OTP"
                  : `Resend OTP in ${resendSecondsLeft}s`}
              </button>
            </div>
          )}
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Admin account?{" "}
          <Link
            href="/login?next=/admin&role=admin"
            className="font-semibold text-lagoon"
          >
            Login as admin
          </Link>
        </p>
      </div>
    </div>
  );
}
