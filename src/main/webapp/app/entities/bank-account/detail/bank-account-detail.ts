import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IBankAccount } from '../bank-account.model';

@Component({
  selector: 'jhi-bank-account-detail',
  templateUrl: './bank-account-detail.html',
  imports: [FontAwesomeModule, NgbModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
/** Read-only detail view for a single BankAccount entity. */
export class BankAccountDetail {
  /** The bank account to display, resolved by the route resolver. */
  bankAccount = input<IBankAccount | null>(null);

  /** Navigates back to the previous page via browser history. */
  previousState(): void {
    globalThis.history.back();
  }
}
