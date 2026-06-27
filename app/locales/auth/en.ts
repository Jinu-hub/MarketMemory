const authEn = {
  auth: {
    signIn: "Sign in",
    signUp: "Sign up",
    forgotPassword: "Forgot your password?",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    resendConfirmation: "Resend confirmation email",
    emailNotConfirmedTitle: "Email not confirmed",
    emailNotConfirmedDesc: "Before signing in, please verify your email.",
    continueWith: "Continue with {{provider}}",
    or: "OR",
    pleaseTryAgain: "Please try again.",
    providers: {
      otp: "OTP",
      magicLink: "Magic Link",
      google: "Google",
      github: "GitHub",
    },
    validation: {
      invalidEmail: "Invalid email address",
      passwordMinLength: "Password must be at least 8 characters long",
      nameRequired: "Name is required",
      passwordsMustMatch: "Passwords must match",
      termsRequired: "You must agree to the terms of service",
      accountExists: "There is an account with this email already.",
      invalidConfirmationCode: "Invalid confirmation code",
      verifyCodeFailed: "Could not verify code. Please try again.",
      invalidProvider: "Invalid provider",
      invalidCode: "Invalid code",
      createAccountBeforeSignIn: "Create an account before signing in.",
    },
    confirm: {
      failedTitle: "Confirmation failed",
      emailUpdated: "Your email has been updated",
    },
    social: {
      loginFailedTitle: "Login failed",
    },
  },
  login: {
    meta: {
      title: "Log in",
    },
    title: "Sign into your account",
    description: "Please enter your details",
    emailPlaceholder: "i.e nico@supaplate.com",
    passwordPlaceholder: "Enter your password",
    loginButton: "Log in",
  },
  join: {
    meta: {
      title: "Create an account",
    },
    title: "Create an account",
    description: "Enter your details to create an account",
    namePlaceholder: "Nico",
    emailPlaceholder: "nico@supaplate.com",
    passwordPlaceholder: "Enter your password",
    passwordHint: "Must be at least 8 characters.",
    confirmPasswordPlaceholder: "Confirm your password",
    createAccountButton: "Create account",
    marketing: "Sign up for marketing emails",
    termsPrefix: "I have read and agree to the",
    accountCreatedTitle: "Account created!",
    accountCreatedDesc:
      "Before you can sign in, please verify your email. You can close this tab.",
  },
  forgotPassword: {
    meta: {
      title: "Forgot Password",
    },
    title: "Forgot your password?",
    description: "Enter your email and we'll send you a reset link.",
    emailPlaceholder: "nico@supaplate.com",
    sendResetLink: "Send reset link",
    successMessage:
      "Check your email for a reset link, you can close this tab.",
  },
  newPassword: {
    meta: {
      title: "Update password",
    },
    title: "Update your password",
    description: "Enter your new password and confirm it.",
    passwordPlaceholder: "Enter your new password",
    confirmPasswordPlaceholder: "Confirm your new password",
    updateButton: "Update password",
    successMessage: "Password updated successfully.",
  },
  magicLink: {
    meta: {
      title: "Magic Link",
    },
    title: "Enter your email",
    description: "We'll send you a verification code.",
    emailPlaceholder: "nico@supaplate.com",
    sendButton: "Send magic link",
    successMessage:
      "Check your email and click the magic link to continue. You can close this tab.",
  },
  otp: {
    meta: {
      title: "OTP Login",
    },
    start: {
      title: "Enter your email",
      description: "We'll send you a verification code.",
      emailPlaceholder: "nico@supaplate.com",
      sendButton: "Send verification code",
    },
    complete: {
      title: "Confirm code",
      description: "Enter the code we sent you.",
      submitButton: "Submit",
    },
  },
  emailVerified: {
    meta: {
      title: "Email Verification",
    },
    title: "Confirmation Complete",
  },
  confirm: {
    meta: {
      title: "Confirm",
    },
  },
};

export default authEn;
