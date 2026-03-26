import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IBankAccount } from '../bank-account.model';
import { BankAccountService } from '../service/bank-account.service';

@Component({
  templateUrl: './bank-account-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
/** Modal dialog confirming deletion of a BankAccount entity. */
export class BankAccountDeleteDialog {
  bankAccount?: IBankAccount;

  protected bankAccountService = inject(BankAccountService);
  protected activeModal = inject(NgbActiveModal);

  /** Dismisses the dialog without deleting. */
  cancel(): void {
    this.activeModal.dismiss();
  }

  /** Deletes the entity and closes the dialog with a success event. */
  confirmDelete(id: number): void {
    this.bankAccountService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
