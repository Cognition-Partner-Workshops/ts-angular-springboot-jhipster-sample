import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { IInvoice, NewInvoice } from '../invoice.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IInvoice for edit and NewInvoiceFormGroupInput for create.
 */
type InvoiceFormGroupInput = IInvoice | PartialWithRequiredKeyOf<NewInvoice>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IInvoice | NewInvoice> = Omit<T, 'date' | 'dueDate'> & {
  date?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
};

type InvoiceFormRawValue = FormValueOf<IInvoice>;

type NewInvoiceFormRawValue = FormValueOf<NewInvoice>;

type InvoiceFormDefaults = Pick<NewInvoice, 'id'>;

type InvoiceFormGroupContent = {
  id: FormControl<InvoiceFormRawValue['id'] | NewInvoice['id']>;
  number: FormControl<InvoiceFormRawValue['number']>;
  date: FormControl<InvoiceFormRawValue['date']>;
  dueDate: FormControl<InvoiceFormRawValue['dueDate']>;
  amount: FormControl<InvoiceFormRawValue['amount']>;
  status: FormControl<InvoiceFormRawValue['status']>;
  bankAccount: FormControl<InvoiceFormRawValue['bankAccount']>;
};

export type InvoiceFormGroup = FormGroup<InvoiceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class InvoiceFormService {
  createInvoiceFormGroup(invoice?: InvoiceFormGroupInput): InvoiceFormGroup {
    const invoiceRawValue = {
      ...this.getFormDefaults(),
      ...(invoice ?? { id: null }),
    };
    return new FormGroup<InvoiceFormGroupContent>({
      id: new FormControl(
        { value: invoiceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      number: new FormControl(invoiceRawValue.number, {
        validators: [Validators.required],
      }),
      date: new FormControl(invoiceRawValue.date, {
        validators: [Validators.required],
      }),
      dueDate: new FormControl(invoiceRawValue.dueDate, {
        validators: [Validators.required],
      }),
      amount: new FormControl(invoiceRawValue.amount, {
        validators: [Validators.required],
      }),
      status: new FormControl(invoiceRawValue.status, {
        validators: [Validators.required],
      }),
      bankAccount: new FormControl(invoiceRawValue.bankAccount),
    });
  }

  getInvoice(form: InvoiceFormGroup): IInvoice | NewInvoice {
    return form.getRawValue() as IInvoice | NewInvoice;
  }

  resetForm(form: InvoiceFormGroup, invoice: InvoiceFormGroupInput): void {
    const invoiceRawValue = { ...this.getFormDefaults(), ...invoice };
    form.reset({
      ...invoiceRawValue,
      id: { value: invoiceRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): InvoiceFormDefaults {
    return {
      id: null,
    };
  }
}
