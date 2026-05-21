import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type {
  Comanda,
  CreateComandaRequest,
  FinalizarComandaRequest,
} from "../types/comandas";
import type { AddItemPedidoResponse, Pedido } from "../types/pedidos";

export async function createComanda(
  payload: CreateComandaRequest
): Promise<Comanda> {
  const response = await api.post<ApiResponse<Comanda>>("/comandas", payload);

  if (!response.data.data) {
    throw new Error("Comanda nao retornada pela API");
  }

  return response.data.data;
}

export async function getComandaById(comandaId: string): Promise<Comanda> {
  const response = await api.get<ApiResponse<Comanda>>(
    `/comandas/${comandaId}`
  );

  if (!response.data.data) {
    throw new Error("Comanda nao retornada pela API");
  }

  return response.data.data;
}

export async function listPedidosComanda(
  comandaId: string
): Promise<Pedido[]> {
  const response = await api.get<ApiResponse<Pedido[]>>(
    `/comandas/${comandaId}/pedidos`
  );

  return response.data.data ?? [];
}

export async function addProdutoComanda(
  comandaId: string,
  payload: { produto_id: string; quantidade: number }
): Promise<AddItemPedidoResponse> {
  const response = await api.post<ApiResponse<AddItemPedidoResponse>>(
    `/comandas/${comandaId}/produtos`,
    payload
  );

  if (!response.data.data) {
    throw new Error("Item nao retornado pela API");
  }

  return response.data.data;
}

export async function finalizarComanda(
  comandaId: string,
  payload: FinalizarComandaRequest
): Promise<Comanda> {
  const response = await api.post<ApiResponse<Comanda>>(
    `/comandas/${comandaId}/finalizar`,
    payload
  );

  if (!response.data.data) {
    throw new Error("Comanda nao retornada pela API");
  }

  return response.data.data;
}
