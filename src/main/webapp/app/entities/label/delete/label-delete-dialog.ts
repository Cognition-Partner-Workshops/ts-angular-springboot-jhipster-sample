import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ILabel } from '../label.model';
import { LabelService } from '../service/label.service';

@Component({
  templateUrl: './label-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
/** Modal dialog confirming deletion of a Label entity. */
export class LabelDeleteDialog {
  label?: ILabel;

  protected labelService = inject(LabelService);
  protected activeModal = inject(NgbActiveModal);

  /** Dismisses the dialog without deleting. */
  cancel(): void {
    this.activeModal.dismiss();
  }

  /** Deletes the entity and closes the dialog with a success event. */
  confirmDelete(id: number): void {
    this.labelService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
