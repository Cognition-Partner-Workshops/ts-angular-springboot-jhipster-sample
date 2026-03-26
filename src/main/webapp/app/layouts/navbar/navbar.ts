import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';

import { LANGUAGES } from 'app/config/language.constants';
import { AccountService } from 'app/core/auth/account.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { LoginService } from 'app/login/login.service';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { TranslateDirective } from 'app/shared/language';
import FindLanguageFromKeyPipe from 'app/shared/language/find-language-from-key.pipe';

import ActiveMenuDirective from './active-menu.directive';

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule,
    NgbModule,
    HasAnyAuthorityDirective,
    ActiveMenuDirective,
    FindLanguageFromKeyPipe,
    TranslateDirective,
    TranslateModule,
  ],
})
/**
 * Application navigation bar.
 *
 * Displays entity links, admin menu (role-gated), account menu,
 * language switcher, and the application version. Collapses on
 * small screens via Bootstrap's responsive navbar.
 */
export default class Navbar implements OnInit {
  /** Whether the app is running in production mode (hides dev-only features). */
  inProduction = signal(true);
  /** Controls the Bootstrap navbar collapse state on small screens. */
  isNavbarCollapsed = signal(true);
  /** Available languages for the language switcher dropdown. */
  readonly languages = LANGUAGES;
  /** Whether the OpenAPI/Swagger docs link should be shown. */
  openAPIEnabled = signal(false);
  /** Application version string displayed in the navbar. */
  readonly version: string;
  /** Reactive signal of the current account for conditional rendering. */
  account = inject(AccountService).trackCurrentAccount();

  private readonly loginService = inject(LoginService);
  private readonly translateService = inject(TranslateService);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  constructor() {
    const { VERSION } = environment;
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    } else {
      this.version = '';
    }
  }

  ngOnInit(): void {
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction.set(profileInfo.inProduction ?? true);
      this.openAPIEnabled.set(profileInfo.openAPIEnabled ?? false);
    });
  }

  /** Switches the application language and persists the choice in session storage. */
  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  /** Collapses the mobile navbar menu. */
  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  /** Logs out the user, collapses the navbar, and navigates to the home page. */
  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  /** Toggles the navbar collapse state on small screens. */
  toggleNavbar(): void {
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }
}
