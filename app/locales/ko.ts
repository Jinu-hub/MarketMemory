import type { Translation } from "./types";
import authPages from "./auth/ko";
import itemReports from "./item-reports/ko";
import weeklyAiIssueDigest from "./weekly-ai-issue-digest/ko";
import weeklyMarketIssues from "./weekly-market-issues/ko";

const ko: Translation = {
  common: {
    actions: {
      back: "뒤로",
      submit: "제출",
      scrollToTop: "맨 위로 이동",
    },
    labels: {
      email: "이메일",
      password: "비밀번호",
      name: "이름",
      confirmPassword: "비밀번호 확인",
    },
    links: {
      terms: "이용약관",
      privacy: "개인정보처리방침",
      and: "및",
    },
  },
  ...authPages,
  brand: {
    name: "Market Memory",
    tagline: "흩어진 시장의 흐름을,\n하나의 시선으로.",
  },
  home: {
    title: "Market Memory",
    meta: {
      description:
        "매일의 글로벌 리서치를 읽고, 주제별로 탐색하고, 흐름으로 연결해 볼 수 있는 리서치 라이브러리입니다.",
    },
    getStarted: "시작하기",
    goToLink: "바로 가기",
    continueReading: "계속 읽기",
    reportCount: "{{count}}편",
    hero: {
      badge: "시장 · 인사이트 · 리서치 라이브러리",
      tagline: "뉴스를 넘어서, 시장의 맥락과 연결을 정리합니다.",
      description:
        "매일의 글로벌 리서치를 읽고, 주제별로 탐색하고, 흐름으로 연결해 볼 수 있는 리서치 라이브러리",
      features: {
        editedResearch: "편집된 리서치",
        exploreByTopic: "주제별 탐색",
        connectFlows: "흐름의 연결",
      },
      social: {
        badge: "Private Preview · 2026",
        text: "초기 버전을 제한적으로 공개하고 있습니다.",
      },
    },
    preview: {
      reportAriaLabel: "리포트 미리보기",
      issueLabel: "Issue 042 · Market Memory",
      editorialAngle: "Editorial Angle",
      trend: "트렌드",
      headline: "AI 인프라 투자가 반도체 밸류체인을 다시 쓰고 있다.",
      keyTakeaway: "Key Takeaway",
      takeawayBody:
        "2026년 하이퍼스케일러 CapEx는 320B에 도달하며, 첨단 패키징과 HBM의 구조적 병목을 더 깊게 만들고 있습니다.",
      hooks: "Hooks",
      hooksList: [
        "CapEx는 가속 중이며, 감속의 신호는 아직 보이지 않는다.",
        "CoWoS 공급은 여전히 가장 강한 제약 조건으로 남아 있다.",
        "전력과 권역 분산이 다음 투자 사이클의 축이 될 것이다.",
      ],
      quote:
        "더 빠른 반도체가 아니라, 더 많은 전력이 병목이 되는 시대로 넘어가고 있습니다.",
      data: {
        capex: {
          label: "CapEx 2026e",
          delta: "+23%",
          caption: "vs 2024",
        },
        hbm: {
          label: "HBM Supply",
          delta: "tight",
          caption: "할당 / 수요",
        },
        power: {
          label: "전력 부하",
          delta: "↑",
          caption: "DC 전력 2024→26",
        },
      },
      floatingChip: {
        title: "관련 인사이트",
        headline: "반도체 CapEx 사이클, 확장 국면 지속",
        period: "30일 · 시총 가중",
        tickers: "MSFT · GOOG · META",
      },
      floatingGraph: {
        title: "연결된 주제",
        ariaLabel: "관련 주제 관계도",
        nodes: {
          power: "전력",
          semi: "반도체",
          dc: "데이터센터",
        },
      },
      floatingTimeline: {
        title: "최근 연대기",
        rows: [
          "AI 인프라 투자의 재편",
          "HBM 가격 사이클, 정점",
          "EU Chips Act 2단계",
        ],
      },
    },
    productFeel: {
      eyebrow: "읽는 경험",
      headline: "한 편의 리포트를\n읽는다는 것.",
      body: "모든 리포트는 핵심 앵글, 요약, 그리고 공유용 인용까지 편집 구조로 정돈됩니다. 리서치에는 해석이 함께 붙고, 리포트는 언제든 다시 펼칠 수 있는 자료로 남습니다.",
      card: {
        headline: "미국 10년물 금리와 유동성.",
        body: "재무부 현금 잔고 변동과 장기 금리 방향, 그리고 그 둘 사이의 비선형 관계에 대한 짧은 리서치 노트.",
        footerMeta: "리서치 노트 · 2026. 02. 12",
      },
    },
    threeWays: {
      eyebrow: "쓰는 방법",
      headline: "세 가지 자세로 읽을 수 있습니다.",
      read: {
        title: "읽다",
        body: "하루의 시장을 요약과 인사이트 중심으로 차분히 읽어 내려갑니다.",
      },
      explore: {
        title: "탐색하다",
        body: "카테고리와 지역, 태그를 따라 관심 있는 흐름을 넓혀 갑니다.",
      },
      connect: {
        title: "연결하다",
        body: "리포트 사이의 맥락을 타임라인과 관련 콘텐츠로 이어서 봅니다.",
      },
    },
    timelineManifesto: {
      eyebrow: "흐름을 본다는 것",
      headline: "하나의 뉴스가 아니라,",
      headlineEmphasis: "시장의 결을 읽습니다.",
      body: "개별 리포트는 쌓여서 시장의 서사가 됩니다.\n월별 타임라인과 카테고리 라인으로 그 흐름을 다시 펼쳐 봅니다.",
      months: {
        march2026: "2026년 3월",
        february2026: "2026년 2월",
      },
      samples: {
        powerBottleneck: "전력 인프라가 AI 공급망의 다음 병목이 되다",
        hbmPeak: "HBM 가격 사이클, 정점 이후의 시나리오",
        euChipsAct: "EU Chips Act 2단계 자금 승인이 의미하는 것",
        treasuryLiquidity: "미국 10년물 금리와 유동성, 리서치 노트",
      },
    },
    forReaders: {
      eyebrow: "이런 분들을 위해",
      headline: "이런 분께 어울립니다.",
      lines: [
        "하루 한 편의 리서치를 꾸준히 읽는 리듬을 만들고 싶은 분",
        "숫자와 차트에 머무르지 않고, 해석과 맥락까지 보고 싶은 분",
        "읽은 내용을 그때그때 흘리지 않고, 다시 찾을 수 있는 자리에 두고 싶은 분",
      ],
    },
    closing: {
      eyebrow: "시작하기",
      headline: "오늘의 시장을,",
      headlineEmphasis: "하나의 흐름으로 읽어 보세요.",
      body: "초기 독자를 위해 조용히 공개 중인 리서치 라이브러리입니다.",
      signInLink: "로그인 →",
    },
    categories: {
      market: "시장",
      trend: "트렌드",
      issue: "이슈",
      research: "리서치",
    },
  },
  navigation: {
    kr: "한국어",
    ja: "일본어",
    en: "영어",
  },
  tooltip: {
    soon: "추후공개예정",
  },
  menu: {
    links: {
      product: {
        title: "제품",
        items: {
          howItWorks: "이용방법",
          samples: "샘플",
          pricing: "가격",
        },
      },
      info: {
        title: "정보",
        items: {
          about: "소개",
          blog: "블로그",
          sitemap: "사이트맵",
        },
      },
      support: {
        title: "서포트",
        items: {
          faq: "FAQ",
          contact: "문의하기",
          community: "커뮤니티",
        },
      },
      legal: {
        title: "법적 고지",
        items: {
          privacyPolicy: "개인정보처리방침",
          termsOfService: "이용약관",
          commercialDisclosure: "특정상업고지",
          refundPolicy: "환불정책",
        },
      },
    },
  },
  contact: {
    title: "문의하기",
    description:
      "질문이나 제안이 있으시면 언제든 연락주세요. 빠른 답변을 드리겠습니다.",
  },
  faq: {
    meta: {
      title: "자주 묻는 질문",
      description:
        "Market Memory 서비스, 리포트, 계정, 요금에 대해 자주 묻는 질문을 모았습니다.",
    },
    hero: {
      badge: "도움말 · FAQ",
      title: "자주 묻는 질문",
      subtitle:
        "Market Memory를 처음 사용하시나요? 서비스, 리포트, 계정에 대해 가장 많이 궁금해하는 내용을 정리했습니다.",
    },
    search: {
      label: "FAQ 검색",
      placeholder: "궁금한 내용을 검색해 보세요",
    },
    resultsCount: "질문 {{count}}개",
    empty: {
      title: "검색 결과가 없어요",
      description: "다른 키워드로 검색하거나 전체 질문을 둘러보세요.",
      clear: "검색 초기화",
    },
    categories: {
      intro: "서비스 소개",
      reports: "콘텐츠 · 리포트",
      account: "계정 · 요금",
      support: "피드백 · 지원",
      roadmap: "로드맵",
    },
    cta: {
      title: "원하는 답을 찾지 못하셨나요?",
      description:
        "궁금한 점이나 피드백이 있다면 언제든지 알려주세요. 사용자 의견은 서비스 개선에 큰 도움이 됩니다.",
      button: "문의하기",
    },
    disclaimer:
      "Market Memory는 정보 제공을 목적으로 하며 투자 자문이나 추천을 제공하지 않습니다. 최종 투자 판단의 책임은 사용자 본인에게 있습니다.",
  },
  dashboard: {
    meta: {
      title: "대시보드",
      description:
        "MARKET DATE 기준 시장 브리핑, 스냅샷, 최신 리포트를 한 화면에서 확인합니다.",
    },
    page: {
      eyebrow: "Dashboard",
      title: "마켓 브리핑",
      subtitle:
        "MARKET DATE 기준으로 정리한 마켓 메모리입니다. 핵심 요약, 테마, 분위기와 스냅샷을 한 화면에서 확인할 수 있습니다.",
      tradingDay: "MARKET DATE",
      publishedAtLabel: "발행",
      statusLabel: "상태",
      draftNote: "처리 중",
      timezoneAbbr: "JST",
      datePicker: {
        triggerLabel: "다른 날짜의 시장 메모리 보기",
        title: "날짜 선택",
        hint: "기록이 있는 MARKET DATE만 선택할 수 있어요.",
        latest: "최신으로",
      },
    },
  },
  itemReports,
  weeklyAiIssueDigest,
  weeklyMarketIssues,
  account: {
    meta: {
      title: "계정",
    },
    errors: {
      couldNotLoadProfile: "프로필을 불러올 수 없습니다",
      couldNotLoadPlan: "플랜 정보를 불러올 수 없습니다",
      couldNotLoadSocialAccounts: "소셜 계정을 불러올 수 없습니다",
      errorCode: "코드: {{code}}",
      errorMessage: "메시지: {{message}}",
    },
    profile: {
      title: "프로필 수정",
      description: "프로필 정보를 관리합니다.",
      avatar: "아바타",
      avatarAlt: "아바타",
      uploadAvatarAriaLabel: "아바타 업로드",
      maxSize: "최대 크기: 1MB",
      allowedFormats: "허용 형식: PNG, JPG, GIF",
      selectFile: "파일 선택",
      noFileSelected: "선택된 파일 없음",
      nameLabel: "이름",
      namePlaceholder: "Nico",
      marketingConsent: "마케팅 이메일 수신 동의",
      saveProfile: "프로필 저장",
      profileUpdated: "프로필이 업데이트되었습니다",
    },
    email: {
      changeTitle: "이메일 변경",
      addTitle: "이메일 추가",
      changeDescription: "이메일 주소를 변경합니다.",
      addDescription: "계정에 이메일 주소를 추가합니다.",
      currentEmail: "현재 이메일",
      currentEmailHint: "이 필드는 수정할 수 없습니다",
      newEmail: "새 이메일",
      emailLabel: "이메일",
      emailPlaceholder: "new-email@example.com",
      updateStarted:
        "이메일 변경 절차가 시작되었습니다. 기존 이메일에서 인증 링크를 확인해 주세요.",
    },
    password: {
      changeTitle: "비밀번호 변경",
      addTitle: "비밀번호 추가",
      changeDescription: "비밀번호를 변경합니다.",
      addDescription: "계정에 비밀번호를 추가합니다.",
      newPassword: "새 비밀번호",
      confirmNewPassword: "새 비밀번호 확인",
      requirementsTitle: "비밀번호 요구사항",
      requirements: {
        minLength: "8자 이상",
        upperLower: "대문자와 소문자 포함",
        numbers: "숫자 포함",
      },
      passwordUpdated: "비밀번호가 업데이트되었습니다",
    },
    delete: {
      title: "위험 구역",
      warning:
        "이 작업은 되돌릴 수 없습니다. 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.",
      confirmDelete: "계정을 삭제하겠다는 것을 확인합니다.",
      confirmIrreversible: "이 작업이 되돌릴 수 없음을 이해합니다.",
      deleteAccount: "계정 삭제",
    },
  },
  dashboardSidebar: {
    groups: {
      platform: "플랫폼",
      series: "시리즈",
    },
    teamSwitcher: {
      modes: "모드",
      switchMode: "모드 전환",
      defaultTeamName: "Default",
      basicPlan: "Basic mode",
    },
    userMenu: {
      upgradeToPro: "Pro로 업그레이드",
      account: "계정",
      notifications: "알림",
      logOut: "로그아웃",
    },
    soonBadge: "Soon",
    nav: {
      dashboard: {
        title: "대시보드",
        marketBriefing: "마켓 브리핑",
        weeklyReport: "주간 리포트",
        monthlyReport: "월간 리포트",
      },
      reports: {
        title: "리포트",
        library: "리포트 라이브러리",
        explore: "탐색",
        timeline: "타임라인",
      },
      insights: {
        title: "인사이트",
        marketMemory: "마켓 메모리",
        entityExplore: "엔티티 탐색",
      },
      admin: {
        title: "Admin",
        home: "관리자 홈",
        pipelines: "파이프라인",
        agents: "에이전트",
        prompts: "프롬프트",
        apiTests: "API 테스트",
        similarityMeasurements: "유사도 측정",
        i18nManagement: "다언어 관리",
      },
    },
    series: {
      weeklyAiIssueDigest: "주간 AI 이슈 다이제스트",
      weeklyMarketIssues: "주간 글로벌 시장 주요 이슈",
    },
  },
};

export default ko;
