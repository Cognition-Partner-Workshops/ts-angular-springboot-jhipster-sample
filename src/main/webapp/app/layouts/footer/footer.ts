import { Component } from '@angular/core';

import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-footer',
  templateUrl: './footer.html',
  imports: [TranslateDirective],
})
/** Simple footer component displaying a translated copyright notice. */
export default class Footer {}
