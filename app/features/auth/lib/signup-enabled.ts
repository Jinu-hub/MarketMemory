/**
 * Sign-up availability toggle.
 *
 * Set `VITE_SIGNUP_ENABLED=true` in `.env` to re-enable registration.
 * When unset or any other value, sign-up stays disabled.
 */
export function isSignupEnabled(): boolean {
  return import.meta.env.VITE_SIGNUP_ENABLED === "true";
}
