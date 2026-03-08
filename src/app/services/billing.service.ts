import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductList } from '../models/product';
import { environment } from 'src/environments/environment';
import { BillingResponse } from '../models/billing';

@Injectable({
  providedIn: 'root',
})
export class BillingService {

  private UrlTk = `${environment.apiUrl}token=${environment.token}&`;

  constructor(private http: HttpClient) {}

  getProductList(): Observable<ProductList> {
    return this.http.get<ProductList>(
      `${this.UrlTk}method=BuscarProducto`
    );
  }

  public createBill(billNumber: string, date: string): Observable<any> {
    return this.http.post<any>(
      `${this.UrlTk}method=CreaFactura&numero_factura=${billNumber}&fecha=${date}`,
      null
    );
  }

  public createNewLine(
    billNumber: string,
    articleCode: string,
    qty: number
    
  ): Observable<any> {
    return this.http.post<any>(
      `${this.UrlTk}method=AgregaDetalle&codigo_articulo=${articleCode}&cantidad=${qty}&numero_factura=${billNumber}`,
      null
    );
  }

  public getBillingList(billNumber: string): Observable<BillingResponse> {
  return this.http.get<BillingResponse>(
    `${this.UrlTk}method=ObtieneFactura&numero_factura=${billNumber}`
  );
}

  public removeNewLine(line: number, billNumber: string): Observable<any> {
    return this.http.post<any>(
      `${this.UrlTk}method=BorrarDetalle&linea=${line}&numero_factura=${billNumber}`,
      null
    );
  }
}