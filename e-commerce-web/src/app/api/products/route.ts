import { laravelProxy } from "@/lib/laravel-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query ? `/products?${query}` : "/products";

  return laravelProxy(path);
}
