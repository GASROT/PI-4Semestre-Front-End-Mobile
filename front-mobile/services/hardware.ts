import { api } from "./api";
import type { ApiResponse } from "../types/api";
import type {
  EventoHardware,
  RegistroDeviceResponse,
  StatusMesaHardware,
  TipoEvento,
} from "../types/hardware";

export async function obterStatusMesa(numero: number) {
  const response = await api.get<ApiResponse<StatusMesaHardware>>(
    `/hardware/mesa/${numero}/status`
  );
  if (!response.data.data) {
    throw new Error("Status nao retornado pela API");
  }
  return response.data.data;
}

export async function registrarDevice(mesa_id: string, device_id: string) {
  const response = await api.post<ApiResponse<RegistroDeviceResponse>>(
    "/hardware/device/register",
    { mesa_id, device_id }
  );
  if (!response.data.data) {
    throw new Error("Registro nao retornado pela API");
  }
  return response.data.data;
}

export async function processarEvento(
  mesa_id: string,
  device_id: string,
  tipo: TipoEvento
) {
  const response = await api.post<ApiResponse<{ success: boolean }>>(
    `/hardware/mesa/${mesa_id}/evento`,
    { device_id, tipo }
  );
  return response.data.data ?? null;
}

export async function listarEventos(mesa_id: string) {
  const response = await api.get<ApiResponse<EventoHardware[]>>(
    `/hardware/mesa/${mesa_id}/eventos`
  );
  return response.data.data ?? [];
}

export async function desregistrarDevice(mesa_id: string) {
  const response = await api.post<ApiResponse<{ message: string }>>(
    `/hardware/device/${mesa_id}/unregister`
  );
  return response.data.message ?? "";
}
