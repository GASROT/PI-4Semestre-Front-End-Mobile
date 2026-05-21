import { api } from "./api";
import type { ApiResponse } from "../types/api";

type Role = "ADMIN" | "GARCOM" | "CLIENTE";

export interface CreateUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  celular?: string;
  turno?: string;
  roles?: Role[];
}

export async function createUsuario(payload: CreateUsuarioRequest) {
  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    "/usuarios",
    payload
  );

  if (!response.data.data) {
    throw new Error("Usuario nao retornado pela API");
  }

  return response.data.data;
}
