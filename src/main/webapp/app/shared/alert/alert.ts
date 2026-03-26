import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AlertModel, AlertService } from 'app/core/util/alert.service';

@Component({
  selector: 'jhi-alert',
  templateUrl: './alert.html',
  imports: [NgbModule],
})
/**
 * Renders success/info/warning alerts from the {@link AlertService}.
 * Alerts are loaded on init and cleared on destroy to avoid stale toasts.
 */
export class Alert implements OnInit, OnDestroy {
  alerts = signal<AlertModel[]>([]);

  private readonly alertService = inject(AlertService);

  ngOnInit(): void {
    this.alerts.set(this.alertService.get());
  }

  /** Builds CSS class map for toast positioning. */
  setClasses(alert: AlertModel): Record<string, boolean> {
    const classes = { 'jhi-toast': Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }

  /** Dismisses an alert by invoking its close callback. */
  close(alert: AlertModel): void {
    alert.close?.(this.alerts());
  }
}
