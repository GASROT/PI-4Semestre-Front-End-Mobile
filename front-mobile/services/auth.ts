import AsyncStorage from "@react-native-async-storage/async-storage";

import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/api";
import { api } from "./api";
import type { AuthSession, LoginRequest } from "../types/auth";
import type { ApiResponse } from "../types/api";

export async function login(payload: LoginRequest): Promise<AuthSession> {
  const response = await api.post<ApiResponse<AuthSession>>(
    "/auth/login",
    payload
  );

  const session = response.data.data;
  if (!session?.access_token) {
    throw new Error("Token nao retornado pela API");
  }

  await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  if (session.refresh_token) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  }
  return session;
}

export async function me(): Promise<AuthSession["user"]> {
  const response = await api.get<ApiResponse<AuthSession["user"]>>("/auth/me");
  if (!response.data.data) {
    throw new Error("Usuario nao retornado pela API");
  }
  return response.data.data;
}
