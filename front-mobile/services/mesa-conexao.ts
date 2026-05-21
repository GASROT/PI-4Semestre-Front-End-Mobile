import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type { ValidacaoMesaResponse } from "../types/mesa-conexao";

export async function validarTokenMesa(
  mesaId: string,
  token: string
): Promise<ValidacaoMesaResponse> {
  const response = await api.get<ApiResponse<ValidacaoMesaResponse>>(
    `/mesas/${mesaId}/validar-token`,
    { params: { token } }
  );

  if (!response.data.data) {
    throw new Error("Validacao nao retornada pela API");
  }

  return response.data.data;
}

export async function obterComandaAtiva(mesaId: string) {
  try {
    const response = await api.get<ApiResponse<{ id: string }>>(
      `/comandas/mesa/${mesaId}/ativa`
    );
    return response.data.data ?? null;
  } catch (err) {
    if (
      typeof err === "object" &&
      err &&
      "statusCode" in err &&
      (err as { statusCode?: number }).statusCode === 404
    ) {
      return null;
    }
    throw err;
  }
}
