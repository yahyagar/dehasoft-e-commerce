import { getAuthToken, unauthenticatedResponse } from "@/lib/auth-cookie";
import { laravelProxy } from "@/lib/laravel-api";

type OrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: OrderRouteContext) {
  const token = await getAuthToken();

  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await params;

  return laravelProxy(`/orders/${id}`, {
    token,
  });
}
