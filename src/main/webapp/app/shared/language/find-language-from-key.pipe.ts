import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findLanguageFromKey',
})
/** Pipe that converts a language key (e.g. 'en') to its display name (e.g. 'English'). */
export default class FindLanguageFromKeyPipe implements PipeTransform {
  private readonly languages: Record<string, { name: string; rtl?: boolean }> = {
    en: { name: 'English' },
    // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object
  };

  /** Returns the human-readable language name for the given ISO key. */
  transform(lang: string): string {
    return this.languages[lang].name;
  }
}
