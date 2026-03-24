import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, map } from 'rxjs/operators';

import { IBankAccount } from 'app/entities/bank-account/bank-account.model';
import { BankAccountService } from 'app/entities/bank-account/service/bank-account.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ITransfer, NewTransfer } from '../transfer.model';
import { TransferService } from '../service/transfer.service';

@Component({
  selector: 'jhi-transfer-update',
  templateUrl: './transfer-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule, FormsModule, RouterLink],
})
export class TransferUpdate implements OnInit {
  isSaving = signal(false);
  accounts = signal<IBankAccount[]>([]);

  sourceAccount = signal<IBankAccount | null>(null);

  editForm = new FormGroup({
    sourceAccount: new FormControl<IBankAccount | null>(null, { validators: [Validators.required] }),
    destinationAccount: new FormControl<IBankAccount | null>(null, { validators: [Validators.required] }),
    amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    description: new FormControl<string | null>(null, { validators: [Validators.maxLength(255)] }),
  });

  protected transferService = inject(TransferService);
  protected bankAccountService = inject(BankAccountService);
  protected router = inject(Router);

  compareBankAccount(o1: IBankAccount | null, o2: IBankAccount | null): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  get filteredDestinationAccounts(): IBankAccount[] {
    const source = this.editForm.get('sourceAccount')?.value;
    if (source) {
      return this.accounts().filter(a => a.id !== source.id);
    }
    return this.accounts();
  }

  get availableBalance(): number | null {
    const source = this.editForm.get('sourceAccount')?.value;
    return source?.balance ?? null;
  }

  get transferButtonAmount(): string {
    const amount = this.editForm.get('amount')?.value;
    if (amount && amount > 0) {
      return `Transfer $${amount.toFixed(2)}`;
    }
    return 'Transfer';
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.editForm.get('sourceAccount')?.valueChanges.subscribe(source => {
      this.sourceAccount.set(source);
      const dest = this.editForm.get('destinationAccount')?.value;
      if (dest?.id === source?.id) {
        this.editForm.get('destinationAccount')?.setValue(null);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const formValue = this.editForm.getRawValue();

    const transfer: NewTransfer = {
      id: null,
      sourceAccount: formValue.sourceAccount ? { id: formValue.sourceAccount.id } : null,
      destinationAccount: formValue.destinationAccount ? { id: formValue.destinationAccount.id } : null,
      amount: formValue.amount,
      description: formValue.description,
    };

    this.transferService
      .create(transfer)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          const sourceId = formValue.sourceAccount?.id;
          if (sourceId) {
            this.router.navigate(['/bank-account', sourceId, 'view']);
          } else {
            this.router.navigate(['/bank-account']);
          }
        },
        error() {
          // Error handled by AlertError component
        },
      });
  }

  protected loadAccounts(): void {
    this.bankAccountService
      .query()
      .pipe(map((res: HttpResponse<IBankAccount[]>) => res.body ?? []))
      .subscribe((accounts: IBankAccount[]) => this.accounts.set(accounts));
  }
}
