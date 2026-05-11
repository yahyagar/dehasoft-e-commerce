import { laravelRequest } from "@/lib/laravel-api";
import type { LaravelAuthResponse } from "@/types/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await laravelRequest("/auth/login", {
    method: "POST",
    body,
  });

  if (result.status !== 200) {
    return NextResponse.json(result.data, {
      status: result.status,
    });
  }

  const loginData = result.data as LaravelAuthResponse;
  const token = loginData.data?.token;

  if (!token) {
    return NextResponse.json(
      {
        data: {},
        message: "Token was not returned from Laravel",
      },
      { status: 500 }
    );
  }

  const response = NextResponse.json(
    {
      data: {
        user: loginData.data?.user,
      },
      message: loginData.message ?? "Login successful",
    },
    { status: result.status }
  );

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
