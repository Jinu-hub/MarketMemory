const authJa = {
  auth: {
    signIn: "ログイン",
    signUp: "新規登録",
    forgotPassword: "パスワードをお忘れですか？",
    alreadyHaveAccount: "すでにアカウントをお持ちですか？",
    dontHaveAccount: "アカウントをお持ちでないですか？",
    resendConfirmation: "確認メールを再送信",
    emailNotConfirmedTitle: "メール未確認",
    emailNotConfirmedDesc: "ログインする前にメールアドレスを確認してください。",
    continueWith: "{{provider}}で続ける",
    or: "または",
    pleaseTryAgain: "もう一度お試しください。",
    providers: {
      otp: "OTP",
      magicLink: "マジックリンク",
      google: "Google",
      github: "GitHub",
    },
    validation: {
      invalidEmail: "有効なメールアドレスを入力してください",
      passwordMinLength: "パスワードは8文字以上である必要があります",
      nameRequired: "名前を入力してください",
      passwordsMustMatch: "パスワードが一致しません",
      termsRequired: "利用規約に同意する必要があります",
      accountExists: "このメールアドレスのアカウントはすでに存在します。",
      invalidConfirmationCode: "無効な確認コードです",
      verifyCodeFailed: "コードを確認できませんでした。もう一度お試しください。",
      invalidProvider: "無効なプロバイダーです",
      invalidCode: "無効なコードです",
      createAccountBeforeSignIn: "ログインする前にアカウントを作成してください。",
    },
    confirm: {
      failedTitle: "確認に失敗しました",
      emailUpdated: "メールアドレスが更新されました",
    },
    social: {
      loginFailedTitle: "ログインに失敗しました",
    },
  },
  login: {
    meta: {
      title: "ログイン",
    },
    title: "アカウントにログイン",
    description: "情報を入力してください",
    emailPlaceholder: "例: nico@supaplate.com",
    passwordPlaceholder: "パスワードを入力",
    loginButton: "ログイン",
  },
  join: {
    meta: {
      title: "アカウント作成",
    },
    title: "アカウント作成",
    description: "アカウント作成のため情報を入力してください",
    namePlaceholder: "Nico",
    emailPlaceholder: "nico@supaplate.com",
    passwordPlaceholder: "パスワードを入力",
    passwordHint: "8文字以上である必要があります。",
    confirmPasswordPlaceholder: "パスワードを再入力",
    createAccountButton: "アカウント作成",
    marketing: "マーケティングメールの受信に同意する",
    termsPrefix: "以下に同意します:",
    accountCreatedTitle: "アカウントが作成されました！",
    accountCreatedDesc:
      "ログインする前にメールアドレスを確認してください。このタブは閉じて構いません。",
  },
  forgotPassword: {
    meta: {
      title: "パスワードを忘れた場合",
    },
    title: "パスワードをお忘れですか？",
    description: "メールアドレスを入力すると、リセットリンクをお送りします。",
    emailPlaceholder: "nico@supaplate.com",
    sendResetLink: "リセットリンクを送信",
    successMessage:
      "メールでリセットリンクをご確認ください。このタブは閉じて構いません。",
  },
  newPassword: {
    meta: {
      title: "パスワード更新",
    },
    title: "パスワードを更新",
    description: "新しいパスワードを入力して確認してください。",
    passwordPlaceholder: "新しいパスワードを入力",
    confirmPasswordPlaceholder: "新しいパスワードを再入力",
    updateButton: "パスワードを更新",
    successMessage: "パスワードが更新されました。",
  },
  magicLink: {
    meta: {
      title: "マジックリンク",
    },
    title: "メールアドレスを入力",
    description: "確認コードをお送りします。",
    emailPlaceholder: "nico@supaplate.com",
    sendButton: "マジックリンクを送信",
    successMessage:
      "メールのマジックリンクをクリックして続行してください。このタブは閉じて構いません。",
  },
  otp: {
    meta: {
      title: "OTPログイン",
    },
    start: {
      title: "メールアドレスを入力",
      description: "確認コードをお送りします。",
      emailPlaceholder: "nico@supaplate.com",
      sendButton: "確認コードを送信",
    },
    complete: {
      title: "コードを確認",
      description: "お送りしたコードを入力してください。",
      submitButton: "送信",
    },
  },
  emailVerified: {
    meta: {
      title: "メール確認",
    },
    title: "確認完了",
  },
  confirm: {
    meta: {
      title: "確認",
    },
  },
};

export default authJa;
