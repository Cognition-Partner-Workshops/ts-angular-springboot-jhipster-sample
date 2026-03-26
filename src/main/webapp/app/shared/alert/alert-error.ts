import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AlertModel, AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { getMessageFromHeaders } from 'app/shared/jhipster/headers';

import { AlertErrorModel } from './alert-error.model';

@Component({
  selector: 'jhi-alert-error',
  templateUrl: './alert-error.html',
  imports: [NgbModule],
})
/**
 * Renders danger/error alerts by listening for application and HTTP error events.
 *
 * Subscribes to two {@link EventManager} channels:
 * - `jhipsterSampleApplicationApp.error` for custom application errors
 * - `jhipsterSampleApplicationApp.httpError` for HTTP errors (broadcast by {@link errorHandlerInterceptor})
 *
 * Translates HTTP status codes and field validation errors into user-friendly messages.
 */
export class AlertError implements OnDestroy {
  alerts = signal<AlertModel[]>([]);
  /** Subscription for custom application error events. */
  errorListener: Subscription;
  /** Subscription for HTTP error events from the error handler interceptor. */
  httpErrorListener: Subscription;

  private readonly alertService = inject(AlertService);
  private readonly eventManager = inject(EventManager);

  private readonly translateService = inject(TranslateService);

  constructor() {
    this.errorListener = this.eventManager.subscribe(
      'jhipsterSampleApplicationApp.error',
      (response: EventWithContent<unknown> | string) => {
        const errorResponse = (response as EventWithContent<AlertErrorModel>).content;
        this.addErrorAlert(errorResponse.message, errorResponse.key, errorResponse.params);
      },
    );

    this.httpErrorListener = this.eventManager.subscribe(
      'jhipsterSampleApplicationApp.httpError',
      (response: EventWithContent<unknown> | string) => {
        this.handleHttpError(response);
      },
    );
  }

  setClasses(alert: AlertModel): Record<string, boolean> {
    const classes = { 'jhi-toast': Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.eventManager.destroy(this.errorListener);
    this.eventManager.destroy(this.httpErrorListener);
  }

  close(alert: AlertModel): void {
    alert.close?.(this.alerts());
  }

  /** Creates a danger alert with optional i18n translation support. */
  private addErrorAlert(message?: string, translationKey?: string, translationParams?: Record<string, unknown>): void {
    this.alertService.addAlert({ type: 'danger', message, translationKey, translationParams }, this.alerts());
  }

  /** Routes HTTP errors to specialized handlers based on status code. */
  private handleHttpError(response: EventWithContent<unknown> | string): void {
    const httpErrorResponse = (response as EventWithContent<HttpErrorResponse>).content;
    switch (httpErrorResponse.status) {
      // connection refused, server not reachable
      case 0:
        this.addErrorAlert('Server not reachable', 'error.server.not.reachable');
        break;

      case 400: {
        this.handleBadRequest(httpErrorResponse);
        break;
      }

      case 404:
        this.addErrorAlert('Not found', 'error.url.not.found');
        break;

      default:
        this.handleDefaultError(httpErrorResponse);
    }
  }

  /** Handles 400 errors: checks for alert headers, field errors, or generic messages. */
  private handleBadRequest(httpErrorResponse: HttpErrorResponse): void {
    const headers = Object.fromEntries(httpErrorResponse.headers.keys().map(key => [key, httpErrorResponse.headers.getAll(key)]));
    const message = getMessageFromHeaders(headers);
    if (message.errorKey) {
      const alertData = message.param ? { entityName: this.translateService.instant(`global.menu.entities.${message.param}`) } : undefined;
      this.addErrorAlert(message.errorKey, message.errorKey, alertData);
    } else if (message.errorMessage) {
      this.addErrorAlert(message.errorMessage);
    } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.fieldErrors) {
      this.handleFieldsError(httpErrorResponse);
    } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.message) {
      this.addErrorAlert(
        httpErrorResponse.error.detail ?? httpErrorResponse.error.message,
        httpErrorResponse.error.message,
        httpErrorResponse.error.params,
      );
    } else {
      this.addErrorAlert(httpErrorResponse.error, httpErrorResponse.error);
    }
  }

  /** Handles non-400/404 errors by displaying the server-provided message. */
  private handleDefaultError(httpErrorResponse: HttpErrorResponse): void {
    if (httpErrorResponse.error !== '' && httpErrorResponse.error.message) {
      this.addErrorAlert(
        httpErrorResponse.error.detail ?? httpErrorResponse.error.message,
        httpErrorResponse.error.message,
        httpErrorResponse.error.params,
      );
    } else {
      this.addErrorAlert(httpErrorResponse.error, httpErrorResponse.error);
    }
  }

  /** Converts Spring Boot field validation errors into translated alert messages. */
  private handleFieldsError(httpErrorResponse: HttpErrorResponse): void {
    const { fieldErrors } = httpErrorResponse.error;
    for (const fieldError of fieldErrors) {
      if (['Min', 'Max', 'DecimalMin', 'DecimalMax'].includes(fieldError.message)) {
        fieldError.message = 'Size';
      }
      // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
      const convertedField: string = fieldError.field.replaceAll(/\[\d*\]/g, '[]');
      const fieldName: string = this.translateService.instant(
        `jhipsterSampleApplicationApp.${fieldError.objectName as string}.${convertedField}`,
      );
      this.addErrorAlert(`Error on field "${fieldName}"`, `error.${fieldError.message as string}`, { fieldName });
    }
  }
}
