import { laravelProxy } from "@/lib/laravel-api";

type ProductDetailRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: ProductDetailRouteContext
) {
  const { id } = await params;
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query ? `/products/${id}?${query}` : `/products/${id}`;

  return laravelProxy(path);
}
