export type StatusMesa = "DISPONIVEL" | "OCUPADA" | "RESERVADA" | "MANUTENCAO";

export interface Mesa {
  id: string;
  numero: number;
  capacidade: number;
  status: StatusMesa;
  codigo_mesa: number;
  ativa: boolean;
  token_acesso?: string | null;
  sessao_id?: string | null;
  device_id?: string | null;
  aberta_em?: string | null;
  fechada_em?: string | null;
  total: number;
  criado_em?: string;
  atualizado_em?: string;
}
