import { ProductList } from './../../models/product';
import { BillingService } from './../../services/billing.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingResponse } from './../../models/billing';

declare var window: any;

@Component({
  selector: 'app-billing-page',
  templateUrl: './billing-page.component.html',
  styleUrls: ['./billing-page.component.css'],
})
export class BillingPageComponent implements OnInit {
  formBill!: FormGroup;
  formDetail!: FormGroup;
  sendBill: string = '';
  sendDate: string = '';
  productList!: ProductList;
  billingList!: BillingResponse;
  message: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  total: number = 0;
  maxDate: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private billingService: BillingService
  ) {
    this.formBill = this.formBuilder.group({
      billNumber: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]],
      date: ['', Validators.required],
    });

    this.formDetail = this.formBuilder.group({
      qty: ['', [Validators.required, Validators.min(1)]],
      articleCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.getProductList();
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;

    const modalInstance =
      window.bootstrap?.Modal.getInstance(modalElement) ||
      new window.bootstrap.Modal(modalElement);

    modalInstance.hide();
  }

  private resetBillFormState(): void {
    this.formBill.reset();
    this.formBill.markAsPristine();
    this.formBill.markAsUntouched();
  }

  private resetDetailFormState(): void {
    this.formDetail.reset();
    this.formDetail.markAsPristine();
    this.formDetail.markAsUntouched();
  }

  public save(): void {
    if (this.formBill.invalid) {
      this.formBill.markAllAsTouched();
      return;
    }

    this.sendBill = String(this.formBill.get('billNumber')?.value || '');
    this.sendDate = this.formBill.get('date')?.value || '';

    if (this.sendDate > this.maxDate) {
      this.formBill.get('date')?.markAsTouched();
      this.alertType = 'warning';
      this.message = 'No se pueden crear facturas con una fecha futura.';
      return;
    }

    this.billingService.createBill(this.sendBill, this.sendDate).subscribe({
      next: (res: any) => {
        this.alertType = 'success';
        this.message = res.ALERTA || 'Factura creada correctamente';
        this.getBillingList();
        this.resetBillFormState();
        this.closeModal('exampleModal');
      },
      error: (error) => {
        console.error('ERROR COMPLETO:', error);

        this.alertType = 'danger';

        const headerMessage =
          error?.headers?.get('errordescription') ||
          error?.headers?.get('statustext') ||
          error?.statusText;

        const backendMessage =
          headerMessage ||
          error?.error?.ALERTA ||
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : '') ||
          error?.message ||
          'Error al crear factura';

        const normalizedMessage = String(backendMessage).toLowerCase();

        if (normalizedMessage.includes('ya existe')) {
          this.message = `La factura #${this.sendBill} ya existe. Intenta con otro número.`;
          return;
        }

        this.message = backendMessage;
      },
    });
  }

  public getProductList(): void {
    this.billingService.getProductList().subscribe({
      next: (res: ProductList) => {
        this.productList = res;
      },
      error: (error) => {
        console.error(error);
        this.alertType = 'danger';

        const headerMessage =
          error?.headers?.get('errordescription') ||
          error?.headers?.get('statustext') ||
          error?.statusText;

        this.message =
          headerMessage ||
          error?.error?.ALERTA ||
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : '') ||
          error?.message ||
          'Error al traer los productos';
      },
    });
  }

  public sendNewLine(): void {
  if (!this.sendBill) {
    this.alertType = 'warning';
    this.message = 'Primero debes crear una factura antes de agregar una línea.';
    return;
  }

  if (this.formDetail.invalid) {
    this.formDetail.markAllAsTouched();
    return;
  }

  const qty = Number(this.formDetail.get('qty')?.value);
  const code = this.formDetail.get('articleCode')?.value;

  const existingLine = this.billingList?.DETALLES?.find(
    (item) => item.CODIGO_ARTICULO === code
  );

  if (existingLine) {
    const newQty = Number(existingLine.CANTIDAD) + qty;

    this.billingService.removeNewLine(existingLine.LINEA, this.sendBill).subscribe({
      next: () => {
        this.billingService.createNewLine(this.sendBill, code, newQty).subscribe({
          next: (res: any) => {
            this.getBillingList();
            this.resetDetailFormState();
            this.closeModal('exampleModal2');
          },
          error: (error) => {
            console.error(error);
            this.alertType = 'danger';

            const headerMessage =
              error?.headers?.get('errordescription') ||
              error?.headers?.get('statustext') ||
              error?.statusText;

            this.message =
              headerMessage ||
              error?.error?.ALERTA ||
              error?.error?.message ||
              (typeof error?.error === 'string' ? error.error : '') ||
              error?.message ||
              'Error al actualizar la línea';
          },
        });
      },
      error: (error) => {
        console.error(error);
        this.alertType = 'danger';

        const headerMessage =
          error?.headers?.get('errordescription') ||
          error?.headers?.get('statustext') ||
          error?.statusText;

        this.message =
          headerMessage ||
          error?.error?.ALERTA ||
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : '') ||
          error?.message ||
          'Error al preparar la actualización de la línea';
      },
    });

    return;
  }

  this.billingService.createNewLine(this.sendBill, code, qty).subscribe({
    next: (res: any) => {
      this.alertType = 'success';
      this.message = res.ALERTA || 'Línea agregada correctamente';
      this.getBillingList();
      this.resetDetailFormState();
      this.closeModal('exampleModal2');
    },
    error: (error) => {
      console.error(error);
      this.alertType = 'danger';

      const headerMessage =
        error?.headers?.get('errordescription') ||
        error?.headers?.get('statustext') ||
        error?.statusText;

      this.message =
        headerMessage ||
        error?.error?.ALERTA ||
        error?.error?.message ||
        (typeof error?.error === 'string' ? error.error : '') ||
        error?.message ||
        'Error al crear la línea';
    },
  });
}

  public getBillingList(): void {
    this.billingService.getBillingList(this.sendBill).subscribe({
      next: (res: BillingResponse) => {
        this.billingList = res;
        this.total = res.FACTURA?.TOTAL || 0;
        this.sendDate = res.FACTURA?.FECHA || this.sendDate;
        this.sendBill = res.FACTURA?.NUMERO_FACTURA?.toString() || this.sendBill;

        if (res.ALERTA) {
          this.alertType = 'success';
          this.message = res.ALERTA;
        }
      },
      error: (error) => {
        console.error(error);
        this.alertType = 'danger';

        const headerMessage =
          error?.headers?.get('errordescription') ||
          error?.headers?.get('statustext') ||
          error?.statusText;

        this.message =
          headerMessage ||
          error?.error?.ALERTA ||
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : '') ||
          error?.message ||
          'Error al traer la lista';
      },
    });
  }

  public removeLine(line: number, billNumber: string): void {
    this.billingService.removeNewLine(line, billNumber).subscribe({
      next: (res: any) => {
        this.alertType = 'success';
        this.message = 'Línea eliminada correctamente';
        this.getBillingList();
      },
      error: (error) => {
        console.error(error);
        this.alertType = 'danger';

        const headerMessage =
          error?.headers?.get('errordescription') ||
          error?.headers?.get('statustext') ||
          error?.statusText;

        this.message =
          headerMessage ||
          error?.error?.ALERTA ||
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : '') ||
          error?.message ||
          'Error al borrar la línea';
      },
    });
  }

  updateQuantity(item: any, event: any): void {

  const newQty = Number(event.target.value);

  if (!newQty || newQty < 1) {
    this.alertType = 'warning';
    this.message = 'La cantidad debe ser mayor que 0';
    this.getBillingList();
    return;
  }

  if (newQty === item.CANTIDAD) {
    return;
  }

  this.billingService.removeNewLine(item.LINEA, this.sendBill).subscribe({

    next: () => {
      this.billingService.createNewLine(
        this.sendBill,
        item.CODIGO_ARTICULO,
        newQty
      ).subscribe({

        next: () => {

          this.alertType = 'success';
          this.message = 'Cantidad actualizada correctamente';
          this.getBillingList();

        },

        error: (error) => {

          console.error(error);
          this.alertType = 'danger';
          this.message = 'Error al actualizar la cantidad';

        }

      });

    },

    error: (error) => {

      console.error(error);
      this.alertType = 'danger';
      this.message = 'Error al modificar la línea';

    }

  });

}
}