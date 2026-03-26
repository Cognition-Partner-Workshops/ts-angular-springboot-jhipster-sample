import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { TranslateDirective } from 'app/shared/language';
import { User } from '../user-management.model';

@Component({
  selector: 'jhi-user-mgmt-detail',
  templateUrl: './user-management-detail.html',
  imports: [RouterLink, FontAwesomeModule, DatePipe, TranslateDirective, TranslateModule],
})
/** Read-only detail view for an admin user account. */
export default class UserManagementDetail {
  /** The user to display, resolved by the route resolver. */
  user = input<User | null>(null);
}
