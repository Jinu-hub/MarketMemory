const authKo = {
  auth: {
    signIn: "로그인",
    signUp: "회원가입",
    forgotPassword: "비밀번호를 잊으셨나요?",
    alreadyHaveAccount: "이미 계정이 있으신가요?",
    dontHaveAccount: "계정이 없으신가요?",
    resendConfirmation: "인증 이메일 다시 보내기",
    emailNotConfirmedTitle: "이메일 미인증",
    emailNotConfirmedDesc: "로그인하기 전에 이메일을 인증해 주세요.",
    continueWith: "{{provider}}(으)로 계속하기",
    or: "또는",
    pleaseTryAgain: "다시 시도해 주세요.",
    appComingSoon: "추후 앱 출시예정",
    providers: {
      otp: "OTP",
      magicLink: "매직 링크",
      google: "Google",
      github: "GitHub",
      apple: "Apple",
    },
    validation: {
      invalidEmail: "유효하지 않은 이메일 주소입니다",
      passwordMinLength: "비밀번호는 12자 이상이어야 합니다",
      passwordUppercase: "비밀번호에 대문자를 1개 이상 포함해야 합니다",
      passwordLowercase: "비밀번호에 소문자를 1개 이상 포함해야 합니다",
      passwordNumber: "비밀번호에 숫자를 1개 이상 포함해야 합니다",
      nameRequired: "이름을 입력해 주세요",
      passwordsMustMatch: "비밀번호가 일치하지 않습니다",
      termsRequired: "이용약관에 동의해야 합니다",
      accountExists: "이미 해당 이메일로 가입된 계정이 있습니다.",
      invalidConfirmationCode: "유효하지 않은 인증 코드입니다",
      verifyCodeFailed: "코드를 확인할 수 없습니다. 다시 시도해 주세요.",
      invalidProvider: "유효하지 않은 제공자입니다",
      invalidCode: "유효하지 않은 코드입니다",
      createAccountBeforeSignIn: "로그인하기 전에 계정을 먼저 만드세요.",
    },
    confirm: {
      failedTitle: "인증에 실패했습니다",
      emailUpdated: "이메일이 업데이트되었습니다",
    },
    social: {
      loginFailedTitle: "로그인에 실패했습니다",
    },
  },
  login: {
    meta: {
      title: "로그인",
    },
    title: "계정에 로그인",
    description: "정보를 입력해 주세요",
    emailPlaceholder: "예: nico@supaplate.com",
    passwordPlaceholder: "비밀번호를 입력하세요",
    loginButton: "로그인",
  },
  join: {
    meta: {
      title: "회원가입",
    },
    title: "계정 만들기",
    description: "계정 생성을 위해 정보를 입력해 주세요",
    namePlaceholder: "Nico",
    emailPlaceholder: "nico@supaplate.com",
    passwordPlaceholder: "비밀번호를 입력하세요",
    passwordHint:
      "12자 이상, 영문 대·소문자·숫자를 각 1개 이상 포함해야 합니다.",
    confirmPasswordPlaceholder: "비밀번호를 다시 입력하세요",
    createAccountButton: "계정 만들기",
    marketing: "마케팅 이메일 수신에 동의합니다",
    termsPrefix: "다음에 동의합니다:",
    accountCreatedTitle: "계정이 생성되었습니다!",
    accountCreatedDesc:
      "로그인하기 전에 이메일을 인증해 주세요. 이 탭은 닫아도 됩니다.",
    comingSoonDescription:
      "현재 최종 테스트를 진행중이기에, 회원가입을 지원하지 않습니다. 곧 회원가입이 가능해지므로 조금만 기다려 주세요.",
  },
  forgotPassword: {
    meta: {
      title: "비밀번호 찾기",
    },
    title: "비밀번호를 잊으셨나요?",
    description: "이메일을 입력하면 재설정 링크를 보내드립니다.",
    emailPlaceholder: "nico@supaplate.com",
    sendResetLink: "재설정 링크 보내기",
    successMessage:
      "이메일에서 재설정 링크를 확인해 주세요. 이 탭은 닫아도 됩니다.",
  },
  newPassword: {
    meta: {
      title: "비밀번호 변경",
    },
    title: "비밀번호 변경",
    description: "새 비밀번호를 입력하고 확인해 주세요.",
    passwordPlaceholder: "새 비밀번호를 입력하세요",
    confirmPasswordPlaceholder: "새 비밀번호를 다시 입력하세요",
    updateButton: "비밀번호 변경",
    successMessage: "비밀번호가 변경되었습니다.",
  },
  magicLink: {
    meta: {
      title: "매직 링크",
    },
    title: "이메일 입력",
    description: "인증 코드를 보내드립니다.",
    emailPlaceholder: "nico@supaplate.com",
    sendButton: "매직 링크 보내기",
    successMessage:
      "이메일에서 매직 링크를 클릭해 계속 진행해 주세요. 이 탭은 닫아도 됩니다.",
  },
  otp: {
    meta: {
      title: "OTP 로그인",
    },
    start: {
      title: "이메일 입력",
      description: "인증 코드를 보내드립니다.",
      emailPlaceholder: "nico@supaplate.com",
      sendButton: "인증 코드 보내기",
    },
    complete: {
      title: "코드 확인",
      description: "보내드린 코드를 입력해 주세요.",
      submitButton: "제출",
    },
  },
  emailVerified: {
    meta: {
      title: "이메일 인증",
    },
    title: "인증 완료",
  },
  confirm: {
    meta: {
      title: "인증",
    },
  },
};

export default authKo;
