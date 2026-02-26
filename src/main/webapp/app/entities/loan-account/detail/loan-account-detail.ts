import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IAmortizationEntry, ILoanAccount } from '../loan-account.model';
import { LoanAccountService } from '../service/loan-account.service';

@Component({
  selector: 'jhi-loan-account-detail',
  templateUrl: './loan-account-detail.html',
  imports: [FontAwesomeModule, NgbModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, DecimalPipe],
})
export class LoanAccountDetail implements OnInit {
  loanAccount = input<ILoanAccount | null>(null);
  amortizationSchedule = signal<IAmortizationEntry[]>([]);
  showAmortization = signal(false);

  protected loanAccountService = inject(LoanAccountService);

  ngOnInit(): void {
    // Amortization will be loaded on demand
  }

  previousState(): void {
    globalThis.history.back();
  }

  toggleAmortization(): void {
    if (!this.showAmortization() && this.amortizationSchedule().length === 0) {
      const account = this.loanAccount();
      if (account) {
        this.loanAccountService.getAmortizationSchedule(account.id).subscribe(schedule => {
          this.amortizationSchedule.set(schedule);
          this.showAmortization.set(true);
        });
      }
    } else {
      this.showAmortization.update(v => !v);
    }
  }
}
