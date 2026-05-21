import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type { Produto } from "../types/produtos";

export async function listProdutos(): Promise<Produto[]> {
  const response = await api.get<ApiResponse<Produto[]>>("/produtos");
  return response.data.data ?? [];
}
