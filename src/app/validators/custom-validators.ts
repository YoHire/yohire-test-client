import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noSpaceAllowedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (value.indexOf(' ') >= 0) {
      return { noSpaceAllowed: true };
    }
    return null;
  };
}

export function whitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value && value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  };
}

export function mobileNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && value.length !== 10) {
      return { invalidLength: true };
    }
    return null;
  };
}

export function validateNumber(event: KeyboardEvent): void {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
  }
}

export const passwordMatchValidator: ValidatorFn = (
  formGroup: AbstractControl
): ValidationErrors | null => {
  const password = formGroup.get('password');
  const cPassword = formGroup.get('cPassword');
  if (password && cPassword && password.value !== cPassword.value) {
    return { passwordMismatch: true };
  } else {
    return null;
  }
};

export function mobileCountryCodeValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const countryCode = formGroup.get('countryCode')?.value;
    const mobile = formGroup.get('mobile')?.value;

    if ((countryCode && !mobile) || (!countryCode && mobile)) {
      return { mobileCountryCodeRequired: true };
    }

    return null;
  };
}
