import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

type AdminOrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: AdminOrderRouteContext
) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;

  return laravelProxy(`/admin/orders/${id}`, {
    token,
  });
}
