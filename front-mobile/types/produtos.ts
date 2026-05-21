export interface Produto {
  id: string;
  nome: string;
  preco_unitario: number;
  qtd_estoque: number;
  ativo: boolean;
  desativado_em?: string | null;
  criado_em?: string;
}
