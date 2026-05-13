import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

type CartItemRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: CartItemRouteContext
) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;
  const body = await request.json();

  return laravelProxy(`/cart/items/${id}`, {
    method: "PUT",
    body,
    token,
  });
}

export async function DELETE(
  _request: Request,
  { params }: CartItemRouteContext
) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;

  return laravelProxy(`/cart/items/${id}`, {
    method: "DELETE",
    token,
  });
}
