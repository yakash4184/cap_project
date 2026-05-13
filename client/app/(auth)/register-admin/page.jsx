import { AuthForm } from "@/components/auth-form";

export default async function AdminRegisterPage({ searchParams }) {
  const params = (await searchParams) || {};

  return (
    <AuthForm
      mode="admin-register"
      redirectPath={params.next || "/admin"}
      requestedRole={params.role || "admin"}
    />
  );
}
