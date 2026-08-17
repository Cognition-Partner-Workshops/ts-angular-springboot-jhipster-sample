import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';

import { TranslateModule } from '@ngx-translate/core';

import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { IAccountSummary } from './dashboard.model';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [CurrencyPipe, FormatMediumDatetimePipe, TranslateDirective, TranslateModule],
})
export default class Dashboard implements OnInit {
  accountSummary = signal<IAccountSummary | null>(null);
  isLoading = signal(true);

  private readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getAccountSummary().subscribe({
      next: summary => this.accountSummary.set(summary),
      complete: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  operationDate(date: string): dayjs.Dayjs {
    return dayjs(date);
  }
}
