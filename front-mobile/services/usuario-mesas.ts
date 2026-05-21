import { api } from "./api";
import type { ApiResponse } from "../types/api";

export interface UsuarioMesaLink {
  id: string;
  usuario_id: string;
  mesa_id: string;
  mesa?: {
    id: string;
    numero: number;
    capacidade: number;
    status: string;
  };
}

const LINK_CACHE_TTL_MS = 2000;
let cachedLinks: UsuarioMesaLink[] | null = null;
let cachedAt = 0;
let inflight: Promise<UsuarioMesaLink[]> | null = null;

export async function createUsuarioMesaLink(
  mesaId: string
): Promise<UsuarioMesaLink> {
  const response = await api.post<ApiResponse<UsuarioMesaLink>>(
    "/usuario-mesas",
    {
      mesa_id: mesaId,
    }
  );

  if (!response.data.data) {
    throw new Error("Vinculo nao retornado pela API");
  }

  return response.data.data;
}

export async function removeUsuarioMesaLinkByMesa(
  mesaId: string
): Promise<UsuarioMesaLink | null> {
  const response = await api.delete<ApiResponse<UsuarioMesaLink>>(
    `/usuario-mesas/mesa/${mesaId}`
  );
  return response.data.data ?? null;
}

export async function listUsuarioMesasByUsuario(
  usuarioId: string
): Promise<UsuarioMesaLink[]> {
  const response = await api.get<ApiResponse<UsuarioMesaLink[]>>(
    `/usuario-mesas/usuario/${usuarioId}`
  );
  return response.data.data ?? [];
}

export async function listUsuarioMesasForAuth(): Promise<UsuarioMesaLink[]> {
  const now = Date.now();
  if (cachedLinks && now - cachedAt < LINK_CACHE_TTL_MS) {
    return cachedLinks;
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    const response = await api.get<ApiResponse<UsuarioMesaLink[]>>(
      "/usuario-mesas/me"
    );
    const links = response.data.data ?? [];
    cachedLinks = links;
    cachedAt = Date.now();
    inflight = null;
    return links;
  })();

  return inflight;
}

export async function removeUsuarioMesaLinkById(
  usuarioMesaId: string
): Promise<UsuarioMesaLink | null> {
  const response = await api.delete<ApiResponse<UsuarioMesaLink>>(
    `/usuario-mesas/${usuarioMesaId}`
  );
  return response.data.data ?? null;
}
