import { Validators } from '@angular/forms';

export const MOBILE_NUMBER_LENGTH = 10;
export const MOBILE_NUMBER_PATTERN = new RegExp(`^\\d{${MOBILE_NUMBER_LENGTH}}$`);
export const MOBILE_NUMBER_ERROR = `Enter a valid ${MOBILE_NUMBER_LENGTH}-digit mobile number.`;

export function mobileNumberValidators(required = false) {
  const lengthValidators = [
    Validators.maxLength(MOBILE_NUMBER_LENGTH),
    Validators.pattern(MOBILE_NUMBER_PATTERN),
  ];
  return required
    ? [Validators.required, ...lengthValidators]
    : lengthValidators;
}
