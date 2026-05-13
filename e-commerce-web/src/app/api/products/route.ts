import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query ? `/products?${query}` : "/products";

  return laravelProxy(path);
}

export async function POST(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.json();

  return laravelProxy("/products", {
    method: "POST",
    body,
    token,
  });
}
