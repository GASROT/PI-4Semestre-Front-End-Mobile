export type MetodoPagamento = "DINHEIRO" | "CARTAO" | "PIX";

export interface FinalizarComandaRequest {
  metodo_pagamento: MetodoPagamento;
}

export interface CreateComandaRequest {
  mesa_id: string;
}

export interface Comanda {
  id: string;
  mesa_id: string;
  usuario_id?: string | null;
  status: "ABERTA" | "FINALIZADA" | "CANCELADA";
  total: number;
  criado_em?: string;
  finalizado_em?: string | null;
}
