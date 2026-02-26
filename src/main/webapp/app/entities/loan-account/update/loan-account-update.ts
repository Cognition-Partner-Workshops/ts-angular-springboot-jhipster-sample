import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { UserService } from 'app/entities/user/service/user.service';
import { IUser } from 'app/entities/user/user.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ILoanAccount } from '../loan-account.model';
import { LoanAccountService } from '../service/loan-account.service';

import { LoanAccountFormGroup, LoanAccountFormService } from './loan-account-form.service';

@Component({
  selector: 'jhi-loan-account-update',
  templateUrl: './loan-account-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class LoanAccountUpdate implements OnInit {
  isSaving = signal(false);
  loanAccount: ILoanAccount | null = null;

  usersSharedCollection = signal<IUser[]>([]);

  protected loanAccountService = inject(LoanAccountService);
  protected loanAccountFormService = inject(LoanAccountFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LoanAccountFormGroup = this.loanAccountFormService.createLoanAccountFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ loanAccount }) => {
      this.loanAccount = loanAccount;
      if (loanAccount) {
        this.updateForm(loanAccount);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const loanAccount = this.loanAccountFormService.getLoanAccount(this.editForm);
    if (loanAccount.id === null) {
      this.subscribeToSaveResponse(this.loanAccountService.create(loanAccount));
    } else {
      this.subscribeToSaveResponse(this.loanAccountService.update(loanAccount));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILoanAccount>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(loanAccount: ILoanAccount): void {
    this.loanAccount = loanAccount;
    this.loanAccountFormService.resetForm(this.editForm, loanAccount);

    this.usersSharedCollection.set(this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection(), loanAccount.user));
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.loanAccount?.user)))
      .subscribe((users: IUser[]) => this.usersSharedCollection.set(users));
  }
}
