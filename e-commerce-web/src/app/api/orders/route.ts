import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  return laravelProxy("/orders", {
    token,
  });
}

export async function POST(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const body = await request.json();

  return laravelProxy("/orders", {
    method: "POST",
    body,
    token,
  });
}
