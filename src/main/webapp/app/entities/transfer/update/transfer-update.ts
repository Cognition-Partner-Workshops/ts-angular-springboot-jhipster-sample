import { HttpResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, finalize, map } from 'rxjs';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IBankAccount } from 'app/entities/bank-account/bank-account.model';
import { BankAccountService } from 'app/entities/bank-account/service/bank-account.service';
import { ITransfer, NewTransfer } from '../transfer.model';
import { TransferService, EntityResponseType } from '../service/transfer.service';

@Component({
  selector: 'jhi-transfer-update',
  templateUrl: './transfer-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule, FormsModule, DecimalPipe],
})
export class TransferUpdate implements OnInit {
  isSaving = signal(false);

  bankAccounts = signal<IBankAccount[]>([]);
  filteredDestinationAccounts = signal<IBankAccount[]>([]);

  editForm = new FormGroup({
    sourceAccount: new FormControl<IBankAccount | null>(null, {
      validators: [Validators.required],
    }),
    destinationAccount: new FormControl<IBankAccount | null>(null, {
      validators: [Validators.required],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    description: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(255)],
    }),
  });

  protected transferService = inject(TransferService);
  protected bankAccountService = inject(BankAccountService);
  protected router = inject(Router);

  ngOnInit(): void {
    this.loadBankAccounts();

    this.editForm.get('sourceAccount')?.valueChanges.subscribe(source => {
      this.updateDestinationAccounts(source);
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

    this.subscribeToSaveResponse(this.transferService.create(transfer));
  }

  compareBankAccount(o1: IBankAccount | null, o2: IBankAccount | null): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  protected subscribeToSaveResponse(result: Observable<EntityResponseType>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: response => this.onSaveSuccess(response),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(response: HttpResponse<ITransfer>): void {
    const transfer = response.body;
    if (transfer?.sourceAccount?.id) {
      this.router.navigate(['/bank-account', transfer.sourceAccount.id, 'view']);
    } else {
      this.previousState();
    }
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  private loadBankAccounts(): void {
    this.bankAccountService
      .query()
      .pipe(map((res: HttpResponse<IBankAccount[]>) => res.body ?? []))
      .subscribe((accounts: IBankAccount[]) => {
        this.bankAccounts.set(accounts);
        this.filteredDestinationAccounts.set(accounts);
      });
  }

  private updateDestinationAccounts(source: IBankAccount | null): void {
    if (source) {
      this.filteredDestinationAccounts.set(this.bankAccounts().filter(a => a.id !== source.id));
    } else {
      this.filteredDestinationAccounts.set(this.bankAccounts());
    }

    const currentDest = this.editForm.get('destinationAccount')?.value;
    if (currentDest && currentDest.id === source?.id) {
      this.editForm.get('destinationAccount')?.setValue(null);
    }
  }
}
