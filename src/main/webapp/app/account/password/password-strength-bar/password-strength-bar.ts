import { Component, ElementRef, Renderer2, effect, inject, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-password-strength-bar',
  imports: [TranslateDirective, TranslateModule],
  templateUrl: './password-strength-bar.html',
  styleUrl: './password-strength-bar.scss',
})
/** Visual indicator that scores password strength and renders colored bars from red (weak) to green (strong). */
export default class PasswordStrengthBar {
  passwordToCheck = input<string>('');

  colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      const password = this.passwordToCheck();
      if (password) {
        const c = this.getColor(this.measureStrength(password));
        const element = this.elementRef.nativeElement;
        if (element.className) {
          this.renderer.removeClass(element, element.className);
        }
        const lis = element.getElementsByTagName('li');
        for (let i = 0; i < lis.length; i++) {
          if (i < c.idx) {
            this.renderer.setStyle(lis[i], 'backgroundColor', c.color);
          } else {
            this.renderer.setStyle(lis[i], 'backgroundColor', '#DDD');
          }
        }
      }
    });
  }

  /** Calculates a numeric strength score based on length, character variety, and complexity. */
  measureStrength(p: string): number {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`[\]]/g; // "
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /\d+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const passedMatches = flags.filter(Boolean).length;

    force += 2 * p.length + (p.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // penalty (short password)
    force = p.length <= 6 ? Math.min(force, 10) : force;

    // penalty (poor variety of characters)
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 40) : force;

    return force;
  }

  /** Maps a numeric strength score to a color index and hex color for the progress bars. */
  getColor(s: number): { idx: number; color: string } {
    let idx = 0;
    if (s > 10) {
      if (s <= 20) {
        idx = 1;
      } else if (s <= 30) {
        idx = 2;
      } else if (s <= 40) {
        idx = 3;
      } else {
        idx = 4;
      }
    }
    return { idx: idx + 1, color: this.colors[idx] };
  }
}
