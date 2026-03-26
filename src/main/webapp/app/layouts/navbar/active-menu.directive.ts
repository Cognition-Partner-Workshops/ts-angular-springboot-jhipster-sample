import { Directive, ElementRef, OnInit, Renderer2, inject, input } from '@angular/core';

import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[jhiActiveMenu]',
})
/** Adds an 'active' CSS class to the host element when its language key matches the current locale. */
export default class ActiveMenuDirective implements OnInit {
  jhiActiveMenu = input();

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateActiveFlag(event.lang);
    });

    this.updateActiveFlag(this.translateService.getCurrentLang());
  }

  /** Toggles the 'active' class based on whether this item's language matches the selected one. */
  updateActiveFlag(selectedLanguage: string): void {
    if (this.jhiActiveMenu() === selectedLanguage) {
      this.renderer.addClass(this.el.nativeElement, 'active');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active');
    }
  }
}
