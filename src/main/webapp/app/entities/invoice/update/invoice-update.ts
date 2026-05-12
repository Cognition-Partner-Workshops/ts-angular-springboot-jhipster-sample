import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { BankAccountService } from 'app/entities/bank-account/service/bank-account.service';
import { IBankAccount } from 'app/entities/bank-account/bank-account.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IInvoice } from '../invoice.model';
import { InvoiceService } from '../service/invoice.service';

import { InvoiceFormGroup, InvoiceFormService } from './invoice-form.service';

@Component({
  selector: 'jhi-invoice-update',
  templateUrl: './invoice-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class InvoiceUpdate implements OnInit {
  isSaving = signal(false);
  invoice: IInvoice | null = null;

  bankAccountsSharedCollection = signal<IBankAccount[]>([]);

  protected invoiceService = inject(InvoiceService);
  protected invoiceFormService = inject(InvoiceFormService);
  protected bankAccountService = inject(BankAccountService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: InvoiceFormGroup = this.invoiceFormService.createInvoiceFormGroup();

  compareBankAccount = (o1: IBankAccount | null, o2: IBankAccount | null): boolean =>
    this.bankAccountService.compareBankAccount(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ invoice }) => {
      this.invoice = invoice;
      if (invoice) {
        this.updateForm(invoice);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const invoice = this.invoiceFormService.getInvoice(this.editForm);
    if (invoice.id === null) {
      this.subscribeToSaveResponse(this.invoiceService.create(invoice));
    } else {
      this.subscribeToSaveResponse(this.invoiceService.update(invoice));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IInvoice>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(invoice: IInvoice): void {
    this.invoice = invoice;
    this.invoiceFormService.resetForm(this.editForm, invoice);

    this.bankAccountsSharedCollection.set(
      this.bankAccountService.addBankAccountToCollectionIfMissing<IBankAccount>(this.bankAccountsSharedCollection(), invoice.bankAccount),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.bankAccountService
      .query()
      .pipe(map((res: HttpResponse<IBankAccount[]>) => res.body ?? []))
      .pipe(
        map((bankAccounts: IBankAccount[]) =>
          this.bankAccountService.addBankAccountToCollectionIfMissing<IBankAccount>(bankAccounts, this.invoice?.bankAccount),
        ),
      )
      .subscribe((bankAccounts: IBankAccount[]) => this.bankAccountsSharedCollection.set(bankAccounts));
  }
}
