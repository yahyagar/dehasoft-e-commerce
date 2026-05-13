import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAuthToken } from "@/lib/auth-cookie";
import { laravelRequest } from "@/lib/laravel-api";
import type { AuthClientResponse } from "@/types/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const result = await laravelRequest("/auth/me", {
    token,
  });
  const authData = result.data as AuthClientResponse;
  const user = authData.data?.user;

  if (result.status !== 200 || user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[280px_1fr]">
      <AdminSidebar adminName={user.name} />
      <main>{children}</main>
    </div>
  );
}
