import type { ApiResponse } from "@/types/api";

export type AuthRole = "customer" | "admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
};

export type LaravelAuthResponse = ApiResponse<{
  user: AuthUser;
  token: string;
}>;

export type AuthClientResponse = ApiResponse<{
  user: AuthUser;
}>;
