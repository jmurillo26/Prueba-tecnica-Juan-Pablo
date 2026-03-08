export interface BillingResponse {
  DETALLES: BillingDetail[];
  FACTURA: BillInfo;
  ALERTA?: string;
}

export interface BillingDetail {
  LINEA: number;
  CODIGO_ARTICULO: string;
  ARTICULO: string;
  CANTIDAD: number;
  PRECIO: number;
  TOTAL_LINEA: number;
}

export interface BillInfo {
  TOTAL: number;
  FECHA: string;
  NUMERO_FACTURA: number;
  USUARIO: string;
}