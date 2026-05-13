import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

export async function GET(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query ? `/cart?${query}` : "/cart";

  return laravelProxy(path, {
    token,
  });
}

export async function DELETE() {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  return laravelProxy("/cart", {
    method: "DELETE",
    token,
  });
}
