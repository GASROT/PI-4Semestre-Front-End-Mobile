import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type { PerfilUsuario } from "../types/perfil";

export async function getPerfil(): Promise<PerfilUsuario> {
  const response = await api.get<ApiResponse<PerfilUsuario>>("/auth/me");
  if (!response.data.data) {
    throw new Error("Perfil nao retornado pela API");
  }
  return response.data.data;
}
