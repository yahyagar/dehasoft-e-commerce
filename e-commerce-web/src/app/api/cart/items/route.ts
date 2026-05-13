import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

export async function POST(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const body = await request.json();

  return laravelProxy("/cart/items", {
    method: "POST",
    body,
    token,
  });
}
