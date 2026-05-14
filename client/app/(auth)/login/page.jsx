import { AuthForm } from "@/components/auth-form";
import { CitizenOtpLoginForm } from "@/components/citizen-otp-login-form";

const readParam = (value, fallback = "") => {
  if (Array.isArray(value)) {
    return String(value[0] || fallback);
  }
  if (typeof value === "string") {
    return value;
  }
  return fallback;
};

export default async function LoginPage({ searchParams }) {
  const params = (await searchParams) || {};
  const nextPath = readParam(params.next, "/issues");
  const role = readParam(params.role, "");
  const isAdminLogin = role === "admin" || nextPath.startsWith("/admin");

  if (!isAdminLogin) {
    return <CitizenOtpLoginForm redirectPath={nextPath} />;
  }

  return (
    <AuthForm
      mode="login"
      redirectPath={nextPath}
      requestedRole={role}
    />
  );
}
