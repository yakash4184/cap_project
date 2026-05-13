import { AuthForm } from "@/components/auth-form";
import { CitizenOtpLoginForm } from "@/components/citizen-otp-login-form";

export default async function LoginPage({ searchParams }) {
  const params = (await searchParams) || {};
  const isAdminLogin = params.role === "admin" || params.next?.startsWith("/admin");

  if (!isAdminLogin) {
    return <CitizenOtpLoginForm redirectPath={params.next || "/issues"} />;
  }

  return (
    <AuthForm
      mode="login"
      redirectPath={params.next || ""}
      requestedRole={params.role || ""}
    />
  );
}
