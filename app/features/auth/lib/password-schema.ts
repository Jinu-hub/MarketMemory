import type { TFunction } from "i18next";
import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;

const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;

type PasswordValidationMessages = {
  minLength: string;
  uppercase: string;
  lowercase: string;
  number: string;
  mustMatch: string;
};

export function getPasswordValidationMessages(
  t: TFunction,
): PasswordValidationMessages {
  return {
    minLength: t("auth.validation.passwordMinLength"),
    uppercase: t("auth.validation.passwordUppercase"),
    lowercase: t("auth.validation.passwordLowercase"),
    number: t("auth.validation.passwordNumber"),
    mustMatch: t("auth.validation.passwordsMustMatch"),
  };
}

export function createPasswordFieldSchema(messages: PasswordValidationMessages) {
  return z
    .string()
    .min(PASSWORD_MIN_LENGTH, { message: messages.minLength })
    .regex(PASSWORD_UPPERCASE_REGEX, { message: messages.uppercase })
    .regex(PASSWORD_LOWERCASE_REGEX, { message: messages.lowercase })
    .regex(PASSWORD_NUMBER_REGEX, { message: messages.number });
}

export function createPasswordWithConfirmSchema(
  messages: PasswordValidationMessages,
) {
  const passwordField = createPasswordFieldSchema(messages);

  return z
    .object({
      password: passwordField,
      confirmPassword: passwordField,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.mustMatch,
      path: ["confirmPassword"],
    });
}
