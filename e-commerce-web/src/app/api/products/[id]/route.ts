import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
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

export async function PUT(request: Request, { params }: ProductDetailRouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");
  const body = isMultipart ? await request.formData() : await request.json();

  if (body instanceof FormData) {
    body.set("_method", "PUT");
  }

  return laravelProxy(`/products/${id}`, {
    method: isMultipart ? "POST" : "PUT",
    body,
    token,
  });
}

export async function DELETE(
  _request: Request,
  { params }: ProductDetailRouteContext
) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;

  return laravelProxy(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}
