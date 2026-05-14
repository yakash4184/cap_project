import { AuthForm } from "@/components/auth-form";

const readParam = (value, fallback = "") => {
  if (Array.isArray(value)) {
    return String(value[0] || fallback);
  }
  if (typeof value === "string") {
    return value;
  }
  return fallback;
};

export default async function AdminRegisterPage({ searchParams }) {
  const params = (await searchParams) || {};
  const nextPath = readParam(params.next, "/admin");
  const role = readParam(params.role, "admin");

  return (
    <AuthForm
      mode="admin-register"
      redirectPath={nextPath}
      requestedRole={role}
    />
  );
}
