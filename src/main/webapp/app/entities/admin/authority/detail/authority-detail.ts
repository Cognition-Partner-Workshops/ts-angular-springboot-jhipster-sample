import { Component, input } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IAuthority } from '../authority.model';

@Component({
  selector: 'jhi-authority-detail',
  templateUrl: './authority-detail.html',
  imports: [FontAwesomeModule, NgbModule, Alert, AlertError, TranslateDirective, TranslateModule],
})
/** Read-only detail view for a single Authority (role) entity. */
export class AuthorityDetail {
  /** The authority to display, resolved by the route resolver. */
  authority = input<IAuthority | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
