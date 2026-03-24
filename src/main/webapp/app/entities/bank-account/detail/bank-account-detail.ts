import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpResponse } from '@angular/common/http';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IBankAccount } from '../bank-account.model';
import { ITransfer } from 'app/entities/transfer/transfer.model';
import { TransferService } from 'app/entities/transfer/service/transfer.service';

@Component({
  selector: 'jhi-bank-account-detail',
  templateUrl: './bank-account-detail.html',
  imports: [FontAwesomeModule, NgbModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, DatePipe, DecimalPipe],
})
export class BankAccountDetail {
  bankAccount = input<IBankAccount | null>(null);
  recentTransfers = signal<ITransfer[]>([]);

  protected transferService = inject(TransferService);

  constructor() {
    effect(() => {
      const account = this.bankAccount();
      if (account?.id) {
        this.loadTransfers(account.id);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  getTransferAmount(transfer: ITransfer, accountId: number): number {
    if (transfer.sourceAccount?.id === accountId) {
      return -(transfer.amount ?? 0);
    }
    return transfer.amount ?? 0;
  }

  getCounterpartyName(transfer: ITransfer, accountId: number): string {
    if (transfer.sourceAccount?.id === accountId) {
      return transfer.destinationAccount?.name ?? 'Unknown';
    }
    return transfer.sourceAccount?.name ?? 'Unknown';
  }

  protected loadTransfers(accountId: number): void {
    this.transferService.findByAccount(accountId, { size: 10, sort: ['date,desc'] }).subscribe({
      next: (res: HttpResponse<ITransfer[]>) => {
        this.recentTransfers.set(res.body ?? []);
      },
    });
  }
}
