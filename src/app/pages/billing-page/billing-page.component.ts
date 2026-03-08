import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BillingDetail, BillingResponse } from './../../models/billing';
import { BillOperationResponse } from './../../models/BillOperationResponse';
import { ProductList } from './../../models/product';
import { BillingService } from './../../services/billing.service';

declare var window: any;

interface ApiErrorBody {
  ALERTA?: string;
  message?: string;
}

@Component({
  selector: 'app-billing-page',
  templateUrl: './billing-page.component.html',
  styleUrls: ['./billing-page.component.css'],
})
export class BillingPageComponent implements OnInit, OnDestroy {
  formBill: FormGroup;
  formDetail: FormGroup;

  sendBill = '';
  sendDate = '';
  total = 0;

  productList?: ProductList;
  billingList?: BillingResponse;

  message = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';

  billModalMessage = '';
  billModalAlertType: 'success' | 'danger' | 'warning' | 'info' = 'danger';
  billNumberAlreadyExists = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private billingService: BillingService
  ) {
    this.formBill = this.formBuilder.group({
      billNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[1-9][0-9]*$'),
          Validators.maxLength(10),
        ],
      ],
      date: ['', Validators.required],
    });

    this.formDetail = this.formBuilder.group({
      qty: ['', [Validators.required, Validators.min(1)]],
      articleCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getProductList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
      return;
    }

    const modalInstance =
      window.bootstrap?.Modal.getInstance(modalElement) ||
      new window.bootstrap.Modal(modalElement);

    modalInstance.hide();
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    defaultMessage: string
  ): string {
    const headerError =
      error.headers?.get('errordescription') ||
      error.headers?.get('statustext') ||
      error.statusText;

    const errorBody = error.error as ApiErrorBody | string | null;

    const backendAlert =
      typeof errorBody === 'object' && errorBody ? errorBody.ALERTA : '';

    const backendMessage =
      typeof errorBody === 'object' && errorBody ? errorBody.message : '';

    const rawError = typeof errorBody === 'string' ? errorBody : '';
    const clientMessage = error.message;

    return (
      headerError ||
      backendAlert ||
      backendMessage ||
      rawError ||
      clientMessage ||
      defaultMessage
    );
  }

  public resetBillFormState(): void {
    this.formBill.reset();
    this.formBill.markAsPristine();
    this.formBill.markAsUntouched();

    this.billModalMessage = '';
    this.billModalAlertType = 'danger';
    this.billNumberAlreadyExists = false;
  }

  private resetDetailFormState(): void {
    this.formDetail.reset();
    this.formDetail.markAsPristine();
    this.formDetail.markAsUntouched();
  }

  public clearBillNumberDuplicateError(): void {
    this.billNumberAlreadyExists = false;
    this.billModalMessage = '';
  }

  public save(): void {
    this.billModalMessage = '';
    this.billModalAlertType = 'danger';
    this.billNumberAlreadyExists = false;

    if (this.formBill.invalid) {
      this.formBill.markAllAsTouched();
      return;
    }

    this.sendBill = String(this.formBill.get('billNumber')?.value || '');
    this.sendDate = String(this.formBill.get('date')?.value || '');

    this.billingService
      .createBill(this.sendBill, this.sendDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BillOperationResponse) => {
          this.alertType = 'success';
          this.message = res.ALERTA || 'Factura creada correctamente';

          this.getBillingList();
          this.resetBillFormState();
          this.closeModal('exampleModal');
        },
        error: (error: HttpErrorResponse) => {
          console.error('ERROR COMPLETO:', error);

          const finalMessage = this.getErrorMessage(
            error,
            'Error al crear factura'
          );

          if (finalMessage.toLowerCase().includes('ya existe')) {
            this.billModalAlertType = 'danger';
            this.billModalMessage = `La factura #${this.sendBill} ya existe. Intenta con otro número.`;
            this.billNumberAlreadyExists = true;
            this.formBill.get('billNumber')?.markAsTouched();
            return;
          }

          this.billModalAlertType = 'danger';
          this.billModalMessage = finalMessage;
        },
      });
  }

  public getProductList(): void {
    this.billingService
      .getProductList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ProductList) => {
          this.productList = res;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertType = 'danger';
          this.message = this.getErrorMessage(
            error,
            'Error al traer los productos'
          );
        },
      });
  }

  public sendNewLine(): void {
    if (!this.validateDetailBeforeSave()) {
      return;
    }

    const qty = this.getDetailQty();
    const code = this.getDetailArticleCode();
    const existingLine = this.findExistingLine(code);

    if (existingLine) {
      this.updateExistingLineQuantity(existingLine, qty, code);
      return;
    }

    this.createDetailLine(code, qty);
  }

  private validateDetailBeforeSave(): boolean {
    if (!this.sendBill) {
      this.alertType = 'warning';
      this.message = 'Primero debes crear una factura antes de agregar una línea.';
      return false;
    }

    if (this.formDetail.invalid) {
      this.formDetail.markAllAsTouched();
      return false;
    }

    return true;
  }

  private getDetailQty(): number {
    return Number(this.formDetail.get('qty')?.value);
  }

  private getDetailArticleCode(): string {
    return String(this.formDetail.get('articleCode')?.value || '');
  }

  private findExistingLine(code: string): BillingDetail | undefined {
    return this.billingList?.DETALLES?.find(
      (item: BillingDetail) => item.CODIGO_ARTICULO === code
    );
  }

  private createDetailLine(code: string, qty: number): void {
    this.billingService
      .createNewLine(this.sendBill, code, qty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BillOperationResponse) => {
          this.alertType = 'success';
          this.message = res.ALERTA || 'Línea agregada correctamente';
          this.handleDetailSuccess();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertType = 'danger';
          this.message = this.getErrorMessage(error, 'Error al crear la línea');
        },
      });
  }

  private updateExistingLineQuantity(
    existingLine: BillingDetail,
    qty: number,
    code: string
  ): void {
    const newQty = Number(existingLine.CANTIDAD) + qty;

    this.deleteDetailLine(existingLine.LINEA).subscribe({
      next: () => {
        this.billingService
          .createNewLine(this.sendBill, code, newQty)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (_res: BillOperationResponse) => {
              this.handleDetailSuccess();
            },
            error: (error: HttpErrorResponse) => {
              console.error(error);
              this.alertType = 'danger';
              this.message = this.getErrorMessage(
                error,
                'Error al actualizar la línea'
              );
            },
          });
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertType = 'danger';
        this.message = this.getErrorMessage(
          error,
          'Error al preparar la actualización de la línea'
        );
      },
    });
  }

  private deleteDetailLine(line: number) {
    return this.billingService
      .removeNewLine(line, this.sendBill)
      .pipe(takeUntil(this.destroy$));
  }

  private handleDetailSuccess(): void {
    this.getBillingList();
    this.resetDetailFormState();
    this.closeModal('exampleModal2');
  }

  public getBillingList(): void {
    this.billingService
      .getBillingList(this.sendBill)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BillingResponse) => {
          this.billingList = res;
          this.total = res.FACTURA?.TOTAL || 0;
          this.sendDate = res.FACTURA?.FECHA || this.sendDate;
          this.sendBill =
            res.FACTURA?.NUMERO_FACTURA?.toString() || this.sendBill;

          if (res.ALERTA) {
            this.alertType = 'success';
            this.message = res.ALERTA;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertType = 'danger';
          this.message = this.getErrorMessage(error, 'Error al traer la lista');
        },
      });
  }

  public removeLine(line: number, billNumber: string): void {
    this.billingService
      .removeNewLine(line, billNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (_res: BillOperationResponse) => {
          this.alertType = 'success';
          this.message = 'Línea eliminada correctamente';
          this.getBillingList();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertType = 'danger';
          this.message = this.getErrorMessage(error, 'Error al borrar la línea');
        },
      });
  }

  public updateQuantity(item: BillingDetail, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQty = Number(input.value);

    if (!newQty || newQty < 1) {
      this.alertType = 'warning';
      this.message = 'La cantidad debe ser mayor que 0';
      this.getBillingList();
      return;
    }

    if (newQty === item.CANTIDAD) {
      return;
    }

    this.billingService
      .removeNewLine(item.LINEA, this.sendBill)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (_res: BillOperationResponse) => {
          this.billingService
            .createNewLine(this.sendBill, item.CODIGO_ARTICULO, newQty)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (_response: BillOperationResponse) => {
                this.alertType = 'success';
                this.message = 'Cantidad actualizada correctamente';
                this.getBillingList();
              },
              error: (error: HttpErrorResponse) => {
                console.error(error);
                this.alertType = 'danger';
                this.message = this.getErrorMessage(
                  error,
                  'Error al actualizar la cantidad'
                );
              },
            });
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertType = 'danger';
          this.message = this.getErrorMessage(
            error,
            'Error al modificar la línea'
          );
        },
      });
  }
}