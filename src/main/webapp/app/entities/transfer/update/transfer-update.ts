import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class TransferUpdate implements OnInit {
  isSaving = signal(false);

  accounts = signal<IBankAccount[]>([]);
  filteredDestinationAccounts = signal<IBankAccount[]>([]);

  editForm = new FormGroup({
    sourceAccount: new FormControl<IBankAccount | null>(null, { validators: [Validators.required] }),
    destinationAccount: new FormControl<IBankAccount | null>(null, { validators: [Validators.required] }),
    amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    description: new FormControl<string | null>(null, { validators: [Validators.maxLength(255)] }),
  });

  protected transferService = inject(TransferService);
  protected bankAccountService = inject(BankAccountService);
  protected router = inject(Router);

  ngOnInit(): void {
    this.bankAccountService
      .query()
      .pipe(map((res: HttpResponse<IBankAccount[]>) => res.body ?? []))
      .subscribe((accounts: IBankAccount[]) => {
        this.accounts.set(accounts);
        this.filteredDestinationAccounts.set(accounts);
      });

    this.editForm.get('sourceAccount')?.valueChanges.subscribe(source => {
      if (source) {
        this.filteredDestinationAccounts.set(this.accounts().filter(a => a.id !== source.id));
        const currentDest = this.editForm.get('destinationAccount')?.value;
        if (currentDest?.id === source.id) {
          this.editForm.get('destinationAccount')?.setValue(null);
        }
      } else {
        this.filteredDestinationAccounts.set(this.accounts());
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const sourceAccount = this.editForm.get('sourceAccount')?.value;
    const destinationAccount = this.editForm.get('destinationAccount')?.value;
    const amount = this.editForm.get('amount')?.value;
    const description = this.editForm.get('description')?.value;

    const transfer: NewTransfer = {
      id: null,
      sourceAccount: sourceAccount ? { id: sourceAccount.id } : null,
      destinationAccount: destinationAccount ? { id: destinationAccount.id } : null,
      amount: amount ?? null,
      description: description ?? null,
    };

    this.transferService
      .create(transfer)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          if (sourceAccount) {
            this.router.navigate(['/bank-account', sourceAccount.id, 'view']);
          } else {
            this.router.navigate(['/bank-account']);
          }
        },
        error() {
          // Error is handled by AlertError component
        },
      });
  }

  compareAccount(o1: IBankAccount | null, o2: IBankAccount | null): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  getSelectedSourceBalance(): number | null {
    const source = this.editForm.get('sourceAccount')?.value;
    return source?.balance ?? null;
  }
}
