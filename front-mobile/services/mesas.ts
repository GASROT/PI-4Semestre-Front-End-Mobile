import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type { Mesa } from "../types/mesas";

export async function listMesas(): Promise<Mesa[]> {
  const response = await api.get<ApiResponse<Mesa[]>>("/mesas");
  return response.data.data ?? [];
}

export async function fecharMesa(mesaId: string): Promise<void> {
  await api.post<ApiResponse<unknown>>(`/mesas/${mesaId}/fechar-com-evento`);
}
