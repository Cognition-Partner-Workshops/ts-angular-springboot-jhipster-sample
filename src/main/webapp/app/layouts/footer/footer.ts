import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  imports: [TranslateDirective, RouterLink],
})
export default class Footer {}
