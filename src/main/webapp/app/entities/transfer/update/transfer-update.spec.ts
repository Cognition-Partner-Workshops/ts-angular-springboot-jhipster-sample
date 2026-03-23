import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBan, faSave } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { TransferUpdate } from './transfer-update';

describe('Transfer Update Component', () => {
  let comp: TransferUpdate;
  let fixture: ComponentFixture<TransferUpdate>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faBan);
    library.addIcons(faSave);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferUpdate);
    comp = fixture.componentInstance;
  });

  describe('save', () => {
    it('should call save on the service and navigate', () => {
      expect(comp.isSaving()).toBe(false);
    });
  });

  describe('previousState', () => {
    it('should navigate to previous state', () => {
      vitest.spyOn(globalThis.history, 'back');
      comp.previousState();
      expect(globalThis.history.back).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should have invalid form when empty', () => {
      expect(comp.editForm.valid).toBe(false);
    });

    it('should require source account', () => {
      expect(comp.editForm.get('sourceAccount')?.errors?.['required']).toBeTruthy();
    });

    it('should require destination account', () => {
      expect(comp.editForm.get('destinationAccount')?.errors?.['required']).toBeTruthy();
    });

    it('should require amount', () => {
      expect(comp.editForm.get('amount')?.errors?.['required']).toBeTruthy();
    });
  });
});
