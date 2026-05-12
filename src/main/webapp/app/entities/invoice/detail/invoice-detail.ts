import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import FormatMediumDatePipe from 'app/shared/date/format-medium-date.pipe';
import { TranslateDirective } from 'app/shared/language';
import { IInvoice } from '../invoice.model';

@Component({
  selector: 'jhi-invoice-detail',
  templateUrl: './invoice-detail.html',
  imports: [FontAwesomeModule, NgbModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, FormatMediumDatePipe],
})
export class InvoiceDetail {
  invoice = input<IInvoice | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
