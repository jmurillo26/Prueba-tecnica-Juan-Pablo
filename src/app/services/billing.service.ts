import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductList } from '../models/product';
import { environment } from 'src/environments/environment';
import { BillingResponse } from '../models/billing';
import { BillOperationResponse } from '../models/BillOperationResponse';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private urlTk = `${environment.apiUrl}token=${environment.token}&`;

  constructor(private http: HttpClient) {}

  public getProductList(): Observable<ProductList> {
    return this.http.get<ProductList>(
      `${this.urlTk}method=BuscarProducto`
    );
  }

  public createBill(
    billNumber: string,
    date: string
  ): Observable<BillOperationResponse> {
    return this.http.post<BillOperationResponse>(
      `${this.urlTk}method=CreaFactura&numero_factura=${billNumber}&fecha=${date}`,
      null
    );
  }

  public createNewLine(
    billNumber: string,
    articleCode: string,
    qty: number
  ): Observable<BillOperationResponse> {
    return this.http.post<BillOperationResponse>(
      `${this.urlTk}method=AgregaDetalle&codigo_articulo=${articleCode}&cantidad=${qty}&numero_factura=${billNumber}`,
      null
    );
  }

  public getBillingList(billNumber: string): Observable<BillingResponse> {
    return this.http.get<BillingResponse>(
      `${this.urlTk}method=ObtieneFactura&numero_factura=${billNumber}`
    );
  }

  public removeNewLine(
    line: number,
    billNumber: string
  ): Observable<BillOperationResponse> {
    return this.http.post<BillOperationResponse>(
      `${this.urlTk}method=BorrarDetalle&linea=${line}&numero_factura=${billNumber}`,
      null
    );
  }
}