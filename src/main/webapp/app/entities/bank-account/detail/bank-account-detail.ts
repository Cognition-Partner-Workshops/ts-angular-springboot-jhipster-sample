import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';

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
export class BankAccountDetail implements OnInit {
  bankAccount = input<IBankAccount | null>(null);
  recentTransfers = signal<ITransfer[]>([]);

  protected transferService = inject(TransferService);

  ngOnInit(): void {
    const account = this.bankAccount();
    if (account?.id) {
      this.transferService.queryByAccount(account.id, { page: 0, size: 10, sort: ['date,desc'] }).subscribe(res => {
        this.recentTransfers.set(res.body ?? []);
      });
    }
  }

  previousState(): void {
    globalThis.history.back();
  }

  getTransferDisplay(transfer: ITransfer): { counterparty: string; amount: number; direction: string } {
    const accountId = this.bankAccount()?.id;
    if (transfer.sourceAccount?.id === accountId) {
      return {
        counterparty: transfer.destinationAccount?.name ?? 'Unknown',
        amount: -(transfer.amount ?? 0),
        direction: 'outgoing',
      };
    }
    return {
      counterparty: transfer.sourceAccount?.name ?? 'Unknown',
      amount: transfer.amount ?? 0,
      direction: 'incoming',
    };
  }
}
