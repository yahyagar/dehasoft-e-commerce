import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getAuthToken() {
  return (await cookies()).get("auth_token")?.value;
}

export function unauthenticatedResponse() {
  return NextResponse.json(
    {
      data: {},
      message: "Unauthenticated",
    },
    { status: 401 }
  );
}
