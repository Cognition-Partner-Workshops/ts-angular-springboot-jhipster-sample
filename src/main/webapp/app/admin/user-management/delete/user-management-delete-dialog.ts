import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';

@Component({
  selector: 'jhi-user-mgmt-delete-dialog',
  templateUrl: './user-management-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, FormsModule],
})
/** Modal dialog confirming deletion of an admin user account. */
export default class UserManagementDeleteDialog {
  user?: User;

  private readonly userService = inject(UserManagementService);
  private readonly activeModal = inject(NgbActiveModal);

  /** Dismisses the dialog without deleting. */
  cancel(): void {
    this.activeModal.dismiss();
  }

  /** Deletes the user by login and closes the dialog. */
  confirmDelete(login: string): void {
    this.userService.delete(login).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
