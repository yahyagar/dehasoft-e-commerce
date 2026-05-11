import { getAuthToken } from "@/lib/auth-cookie";
import { laravelRequest } from "@/lib/laravel-api";
import { NextResponse } from "next/server";

export async function POST() {
  const token = await getAuthToken();

  if (!token) {
    const response = NextResponse.json(
      {
        data: {},
        message: "Unauthenticated",
      },
      { status: 401 }
    );

    response.cookies.delete("auth_token");

    return response;
  }

  const result = await laravelRequest("/auth/logout", {
    method: "POST",
    token,
  });

  const response = NextResponse.json(result.data, {
    status: result.status,
  });

  response.cookies.delete("auth_token");

  return response;
}
