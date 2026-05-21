export interface ValidacaoMesaResponse {
  valido: boolean;
  mesa_numero: number;
  sessao_id: string | null;
  comanda_id?: string | null;
}
