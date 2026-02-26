import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ILoanAccount, NewLoanAccount } from '../loan-account.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILoanAccount for edit and NewLoanAccountFormGroupInput for create.
 */
type LoanAccountFormGroupInput = ILoanAccount | PartialWithRequiredKeyOf<NewLoanAccount>;

type LoanAccountFormDefaults = Pick<NewLoanAccount, 'id'>;

type LoanAccountFormGroupContent = {
  id: FormControl<ILoanAccount['id'] | NewLoanAccount['id']>;
  accountName: FormControl<ILoanAccount['accountName']>;
  loanAmount: FormControl<ILoanAccount['loanAmount']>;
  interestRate: FormControl<ILoanAccount['interestRate']>;
  termMonths: FormControl<ILoanAccount['termMonths']>;
  monthlyPayment: FormControl<ILoanAccount['monthlyPayment']>;
  remainingBalance: FormControl<ILoanAccount['remainingBalance']>;
  user: FormControl<ILoanAccount['user']>;
};

export type LoanAccountFormGroup = FormGroup<LoanAccountFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LoanAccountFormService {
  createLoanAccountFormGroup(loanAccount?: LoanAccountFormGroupInput): LoanAccountFormGroup {
    const loanAccountRawValue = {
      ...this.getFormDefaults(),
      ...(loanAccount ?? { id: null }),
    };
    return new FormGroup<LoanAccountFormGroupContent>({
      id: new FormControl(
        { value: loanAccountRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      accountName: new FormControl(loanAccountRawValue.accountName, {
        validators: [Validators.required],
      }),
      loanAmount: new FormControl(loanAccountRawValue.loanAmount, {
        validators: [Validators.required, Validators.min(0)],
      }),
      interestRate: new FormControl(loanAccountRawValue.interestRate, {
        validators: [Validators.required, Validators.min(0)],
      }),
      termMonths: new FormControl(loanAccountRawValue.termMonths, {
        validators: [Validators.required, Validators.min(1)],
      }),
      monthlyPayment: new FormControl({ value: loanAccountRawValue.monthlyPayment, disabled: true }),
      remainingBalance: new FormControl(loanAccountRawValue.remainingBalance),
      user: new FormControl(loanAccountRawValue.user),
    });
  }

  getLoanAccount(form: LoanAccountFormGroup): ILoanAccount | NewLoanAccount {
    return form.getRawValue() as ILoanAccount | NewLoanAccount;
  }

  resetForm(form: LoanAccountFormGroup, loanAccount: LoanAccountFormGroupInput): void {
    const loanAccountRawValue = { ...this.getFormDefaults(), ...loanAccount };
    form.reset({
      ...loanAccountRawValue,
      id: { value: loanAccountRawValue.id, disabled: true },
      monthlyPayment: { value: loanAccountRawValue.monthlyPayment, disabled: true },
    });
  }

  private getFormDefaults(): LoanAccountFormDefaults {
    return {
      id: null,
    };
  }
}
