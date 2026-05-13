import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

type AdminOrderStatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: AdminOrderStatusRouteContext
) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;
  const body = await request.json();

  return laravelProxy(`/admin/orders/${id}/status`, {
    method: "PUT",
    body,
    token,
  });
}
