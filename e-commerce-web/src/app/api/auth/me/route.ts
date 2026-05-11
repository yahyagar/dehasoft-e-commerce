import { laravelProxy } from "@/lib/laravel-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      {
        data: {},
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  return laravelProxy("/auth/me", {
    token,
  });
}
