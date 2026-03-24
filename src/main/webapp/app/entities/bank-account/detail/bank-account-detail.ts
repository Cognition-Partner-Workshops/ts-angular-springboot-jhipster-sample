import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { DatePipe, DecimalPipe } from '@angular/common';
import { IBankAccount } from '../bank-account.model';
import { ITransfer } from 'app/entities/transfer/transfer.model';
import { TransferService } from 'app/entities/transfer/service/transfer.service';

@Component({
  selector: 'jhi-bank-account-detail',
  templateUrl: './bank-account-detail.html',
  imports: [FontAwesomeModule, NgbModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, DatePipe, DecimalPipe],
})
export class BankAccountDetail implements OnInit {
  bankAccount = input<IBankAccount | null>(null);
  recentTransfers = signal<ITransfer[]>([]);

  protected transferService = inject(TransferService);

  ngOnInit(): void {
    const account = this.bankAccount();
    if (account?.id) {
      this.transferService.findByAccount(account.id, { page: 0, size: 10, sort: ['date,desc'] }).subscribe(res => {
        this.recentTransfers.set(res.body ?? []);
      });
    }
  }

  previousState(): void {
    globalThis.history.back();
  }

  getTransferDirection(transfer: ITransfer): 'outgoing' | 'incoming' {
    const account = this.bankAccount();
    if (account && transfer.sourceAccount?.id === account.id) {
      return 'outgoing';
    }
    return 'incoming';
  }

  getCounterpartyName(transfer: ITransfer): string {
    const account = this.bankAccount();
    if (account && transfer.sourceAccount?.id === account.id) {
      return transfer.destinationAccount?.name ?? 'Unknown';
    }
    return transfer.sourceAccount?.name ?? 'Unknown';
  }

  getDisplayAmount(transfer: ITransfer): number {
    const amount = transfer.amount ?? 0;
    return this.getTransferDirection(transfer) === 'outgoing' ? -amount : amount;
  }
}
