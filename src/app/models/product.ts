export interface ProductList {
  PRODUCTOS: Product[];
  ALERTA?: string;
}

export interface Product {
  PRECIO: number;
  CODIGO_ARTICULO: string;
  DESCRIPCION: string;
}