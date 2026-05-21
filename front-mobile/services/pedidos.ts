import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type {
  AddItemPedidoRequest,
  AddItemPedidoResponse,
  CreatePedidoRequest,
  Pedido,
  UpdatePedidoStatusRequest,
} from "../types/pedidos";

export async function listPedidos(): Promise<Pedido[]> {
  const response = await api.get<ApiResponse<Pedido[]>>("/pedidos");
  return response.data.data ?? [];
}

export async function createPedido(
  payload: CreatePedidoRequest
): Promise<Pedido> {
  const response = await api.post<ApiResponse<Pedido>>("/pedidos", payload);
  if (!response.data.data) {
    throw new Error("Pedido nao retornado pela API");
  }
  return response.data.data;
}

export async function addItemPedido(
  pedidoId: string,
  payload: AddItemPedidoRequest
): Promise<AddItemPedidoResponse> {
  const response = await api.post<ApiResponse<AddItemPedidoResponse>>(
    `/pedidos/${pedidoId}/itens`,
    payload
  );
  if (!response.data.data) {
    throw new Error("Item nao retornado pela API");
  }
  return response.data.data;
}

export async function updatePedidoStatus(
  pedidoId: string,
  payload: UpdatePedidoStatusRequest
): Promise<Pedido> {
  const response = await api.patch<ApiResponse<Pedido>>(
    `/pedidos/${pedidoId}/status`,
    payload
  );
  if (!response.data.data) {
    throw new Error("Pedido nao retornado pela API");
  }
  return response.data.data;
}
