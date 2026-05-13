import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  return laravelProxy("/admin/orders", {
    token,
  });
}
