export type StatusPreparo =
  | "PENDENTE"
  | "EM_PREPARO"
  | "PRONTO"
  | "ENTREGUE"
  | "CANCELADO";

export type StatusPagamento = "ABERTO" | "PARCIAL" | "PAGO" | "ESTORNADO";

export interface PedidoMesa {
  id: string;
  numero: number;
}

export interface PedidoItem {
  id: string;
  pedido_id?: string;
  produto_id: string;
  quantidade: number;
  num_item: number;
  preco_snapshot: number;
  subtotal: number;
}

export type AddItemPedidoResponse = PedidoItem;

export interface Pedido {
  id: string;
  mesa_id: string;
  comanda_id?: string | null;
  num_pedido: number;
  data_hora: string;
  status_preparo: StatusPreparo;
  status_pagamento: StatusPagamento;
  valor_total: number;
  mesa?: PedidoMesa;
  itens?: PedidoItem[];
  criado_em?: string;
  atualizado_em?: string;
}

export interface CreatePedidoRequest {
  mesa_id: string;
  num_pedido: number;
  comanda_id?: string;
}

export interface AddItemPedidoRequest {
  produto_id: string;
  quantidade: number;
  num_item?: number;
}

export interface UpdatePedidoStatusRequest {
  status_preparo: StatusPreparo;
  status_pagamento: StatusPagamento;
}
