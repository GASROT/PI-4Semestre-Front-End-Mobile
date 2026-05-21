export type StatusMesa = "DISPONIVEL" | "OCUPADA" | "RESERVADA" | "MANUTENCAO";
export type TipoEvento =
  | "CHAMAR_GARCOM"
  | "LIMPEZA_INICIADA"
  | "LIMPEZA_CONCLUIDA"
  | "MESA_ABERTA"
  | "MESA_FECHADA";

export interface StatusMesaHardware {
  id: string;
  st: StatusMesa;
  tk: string;
  url: string;
  num: number;
  cap: number;
  upd: string;
}

export interface EventoHardware {
  id: string;
  tipo: TipoEvento;
  descricao?: string | null;
  criado_em: string;
}

export interface RegistroDeviceResponse {
  success: boolean;
  message: string;
  mesa_id: string;
  device_id: string;
}
