import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  imports: [TranslateDirective, RouterLink, HasAnyAuthorityDirective],
})
export default class Footer {}
