import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

import {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../constants/api";
import type { ApiError, ApiResponse } from "../types/api";
import type { AuthSession } from "../types/auth";

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  const response = await refreshApi.post<ApiResponse<AuthSession>>(
    "/auth/refresh",
    { refresh_token: refreshToken }
  );
  const session = response.data.data;
  if (!session?.access_token) {
    return null;
  }

  await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  if (session.refresh_token) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  }

  return session.access_token;
}

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = originalConfig?.url?.includes("/auth/refresh");

    if (status === 401 && originalConfig && !originalConfig._retry && !isRefreshCall) {
      originalConfig._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalConfig);
      }

      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
      ]);
    }

    const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
    const url = error.config?.baseURL && error.config?.url
      ? `${error.config.baseURL}${error.config.url}`
      : error.config?.url ?? "UNKNOWN_URL";
    const apiError: ApiError = {
      message:
        error.response?.data && typeof error.response.data === "object"
          ? (error.response.data as { message?: string }).message ??
            "Erro na requisicao"
          : "Erro na requisicao",
      statusCode: error.response?.status,
      details: error.response?.data,
    };

    console.error("API error", {
      method,
      url,
      status: error.response?.status,
      response: error.response?.data,
    });

    apiError.message = `${apiError.message} | ${method} ${url}`;

    return Promise.reject(apiError);
  }
);
