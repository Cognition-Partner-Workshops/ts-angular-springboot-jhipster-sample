import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { AccountSummary } from './dashboard.model';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [CurrencyPipe, FormatMediumDatetimePipe, RouterLink, TranslateDirective, TranslateModule],
})
export default class Dashboard implements OnInit {
  summary = signal<AccountSummary | null>(null);

  protected readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe(summary => this.summary.set(summary));
  }
}
