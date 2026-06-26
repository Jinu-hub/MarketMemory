/**
 * FAQ Content (Content Layer data)
 *
 * Long-form FAQ copy is intentionally kept out of the central i18n locale
 * files (mirroring how `features/legal` keeps long documents in per-locale
 * MDX). The reusable *page chrome* strings (hero, search, category labels,
 * CTA) live in the i18n system under the `faq` namespace, while the Q&A
 * bodies live here, grouped by a language-independent category id.
 *
 * Each answer is modelled as an ordered list of blocks so the reading screen
 * can render paragraphs and bullet lists with proper editorial typography
 * instead of cramming everything into a single string.
 */

export type FaqLocale = "ko" | "en" | "ja";

export type FaqCategoryId =
  | "intro"
  | "reports"
  | "account"
  | "support"
  | "roadmap";

/** Display order for category sections across the whole FAQ screen. */
export const FAQ_CATEGORY_ORDER: FaqCategoryId[] = [
  "intro",
  "reports",
  "account",
  "support",
  "roadmap",
];

export type FaqAnswerBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

export interface FaqEntry {
  /** Stable id, used for accordion values and deep links. */
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: FaqAnswerBlock[];
}

const ko: FaqEntry[] = [
  {
    id: "what-is-it",
    category: "intro",
    question: "Market Memory는 어떤 서비스인가요?",
    answer: [
      {
        type: "p",
        text: "Market Memory는 매일 흩어져 있는 시장 뉴스와 주요 흐름을 정리해, 투자자가 시장을 더 쉽게 되돌아보고 이해할 수 있도록 돕는 시장 메모 서비스입니다.",
      },
      {
        type: "p",
        text: "단순히 뉴스를 나열하기보다, 하루 동안 어떤 이슈가 있었고 그 흐름이 시장에 어떤 의미를 가질 수 있는지 정리하는 데 초점을 둡니다.",
      },
    ],
  },
  {
    id: "is-investment-advice",
    category: "intro",
    question: "Market Memory는 투자 추천 서비스인가요?",
    answer: [
      { type: "p", text: "아닙니다." },
      {
        type: "p",
        text: "Market Memory는 특정 종목, 자산, 매수·매도 시점에 대한 투자 조언이나 추천을 제공하지 않습니다.",
      },
      {
        type: "p",
        text: "제공되는 콘텐츠는 시장 흐름을 이해하기 위한 정보와 해석을 목적으로 하며, 최종 투자 판단은 사용자 본인의 책임하에 이루어져야 합니다.",
      },
    ],
  },
  {
    id: "what-content",
    category: "intro",
    question: "어떤 내용을 볼 수 있나요?",
    answer: [
      { type: "p", text: "MVP 단계에서는 주로 다음과 같은 내용을 제공합니다." },
      {
        type: "list",
        items: [
          "오늘의 시장 메모리",
          "주요 시장 이슈 요약",
          "시장 분위기 정리",
          "글로벌 시장 관련 리포트",
          "AI, 반도체, 매크로, 지정학 등 주요 테마 리포트",
        ],
      },
      {
        type: "p",
        text: "제공 범위는 서비스 운영 상황에 따라 점진적으로 확장될 수 있습니다.",
      },
    ],
  },
  {
    id: "languages",
    category: "intro",
    question: "Market Memory는 어떤 언어를 지원하나요?",
    answer: [
      {
        type: "p",
        text: "MVP 단계에서는 한국어, 일본어, 영어를 제공합니다.",
      },
      {
        type: "p",
        text: "일부 콘텐츠는 언어별로 제공 시점이나 표현 품질에 차이가 있을 수 있습니다.",
      },
    ],
  },
  {
    id: "mobile",
    category: "intro",
    question: "모바일에서도 사용할 수 있나요?",
    answer: [
      {
        type: "p",
        text: "Market Memory는 웹 서비스를 중심으로 제공되며, 모바일 브라우저에서도 사용할 수 있도록 준비하고 있습니다.",
      },
      {
        type: "p",
        text: "향후 모바일 앱 또는 앱 형태의 래퍼를 제공할 예정입니다.",
      },
    ],
  },
  {
    id: "update-frequency",
    category: "reports",
    question: "리포트는 얼마나 자주 업데이트되나요?",
    answer: [
      {
        type: "p",
        text: "기본적으로 시장이 열리는 날을 중심으로 리포트가 업데이트됩니다.",
      },
      {
        type: "p",
        text: "다만 MVP 단계에서는 데이터 수집, 분석 파이프라인, 운영 상황에 따라 업데이트 시간이나 빈도가 달라질 수 있습니다.",
      },
    ],
  },
  {
    id: "weekend-holidays",
    category: "reports",
    question: "주말이나 휴장일에도 리포트가 올라오나요?",
    answer: [
      {
        type: "p",
        text: "미국 시장 휴장일이나 주말에는 신규 리포트가 제한적일 수 있습니다.",
      },
      {
        type: "p",
        text: "다만 중요한 글로벌 이슈가 있거나 주간 정리 콘텐츠가 준비되는 경우, 별도의 리포트가 제공될 수 있습니다.",
      },
    ],
  },
  // {
  //   id: "sources",
  //   category: "reports",
  //   question: "리포트의 정보 출처는 무엇인가요?",
  //   answer: [
  //     {
  //       type: "p",
  //       text: "Market Memory는 공개적으로 확인 가능한 시장 뉴스, 경제 지표, 기업 관련 정보, 금융시장 데이터 등을 바탕으로 리포트를 생성합니다.",
  //     },
  //     {
  //       type: "p",
  //       text: "다만 MVP 단계에서는 모든 출처가 개별 리포트마다 완전하게 표시되지 않을 수 있으며, 향후 출처 표시 방식은 개선될 예정입니다.",
  //     },
  //   ],
  // },
  {
    id: "accuracy",
    category: "reports",
    question: "리포트 내용은 항상 정확한가요?",
    answer: [
      {
        type: "p",
        text: "Market Memory는 신뢰할 수 있는 정보를 바탕으로 리포트를 생성하기 위해 노력하지만, 모든 정보의 정확성, 완전성, 최신성을 보장하지는 않습니다.",
      },
      {
        type: "p",
        text: "시장 정보는 빠르게 변할 수 있으며, 일부 내용은 이후 정정되거나 업데이트될 수 있습니다.",
      },
      {
        type: "p",
        text: "리포트는 특정 시점의 정보를 바탕으로 작성된 참고 자료이므로, 투자 판단 시에는 최신 시장 상황을 함께 고려해 주세요.",
      },
    ],
  },
  {
    id: "ai-generated",
    category: "reports",
    question: "AI가 작성한 리포트인가요?",
    answer: [
      {
        type: "p",
        text: "네. Market Memory의 리포트는 AI 기반 분석 및 요약 과정을 통해 생성됩니다.",
      },
      {
        type: "p",
        text: "다만 단순 자동 요약이 아니라, 시장 흐름을 구조화하고 사용자가 읽기 쉽게 정리하는 방향으로 설계되어 있습니다.",
      },
      {
        type: "p",
        text: "MVP 단계에서는 품질 개선을 위해 리포트 구성, 표현, 요약 방식이 계속 조정될 수 있습니다.",
      },
    ],
  },
  {
    id: "save-reports",
    category: "reports",
    question: "리포트를 저장하거나 다시 볼 수 있나요?",
    answer: [
      {
        type: "p",
        text: "과거 리포트를 항상 열람 가능합니다. 다만 MVP 단계에서는 아카이브 기능이 제공되지 않습니다.",
      },
      {
        type: "p",
        text: "저장, 북마크, 관심 리포트 관리 등의 기능은 향후 단계적으로 추가될 수 있습니다.",
      },
    ],
  },
  {
    id: "sharing",
    category: "reports",
    question: "Market Memory의 리포트를 외부에 공유해도 되나요?",
    answer: [
      { type: "p", text: "개인적인 참고나 링크 공유는 가능합니다." },
      {
        type: "p",
        text: "다만 리포트 전체를 무단으로 복제, 재배포하거나 상업적 목적으로 사용하는 것은 제한될 수 있습니다.",
      },
      { type: "p", text: "자세한 내용은 이용약관을 참고해 주세요." },
    ],
  },
  {
    id: "signup-required",
    category: "account",
    question: "회원가입이 필요한가요?",
    answer: [
      {
        type: "p",
        text: "회원가입 및 로그인은 필수적으로 필요합니다.",
      },
      {
        type: "p",
        text: "로그인은 Google 등 외부 인증 제공자를 통해 제공될 수 있으며, 서비스 운영에 필요한 최소한의 정보만 사용합니다.",
      },
    ],
  },
  {
    id: "free",
    category: "account",
    question: "무료로 사용할 수 있나요?",
    answer: [
      { type: "p", text: "MVP 단계에서는 기본 기능을 무료로 제공할 예정입니다." },
      {
        type: "p",
        text: "향후 서비스가 정식 운영 단계로 확장되면, 일부 고급 기능이나 추가 리포트는 유료 플랜으로 제공될 수 있습니다.",
      },
    ],
  },
  {
    id: "future-paid",
    category: "account",
    question: "향후 유료 기능에는 어떤 것이 포함될 수 있나요?",
    answer: [
      { type: "p", text: "향후에는 다음과 같은 기능이 유료 기능으로 제공될 수 있습니다." },
      {
        type: "list",
        items: [
          "더 많은 리포트 열람",
          "고급 검색 및 필터",
          "관심 테마 저장",
          "개인화된 시장 메모",
          "주간·월간 요약 리포트",
          "메모리 리콜 기능 확장",
        ],
      },
      {
        type: "p",
        text: "구체적인 유료 기능과 가격은 정식 출시 시점에 별도로 안내됩니다.",
      },
    ],
  },
  {
    id: "personalization",
    category: "account",
    question: "개인화 기능이 있나요?",
    answer: [
      { type: "p", text: "MVP 단계에서는 개인화 기능이 제공되지 않습니다." },
      {
        type: "p",
        text: "향후에는 사용자가 관심 있는 시장, 테마, 리포트 유형을 기준으로 더 맞춤화된 시장 메모를 제공하는 방향을 검토하고 있습니다.",
      },
    ],
  },
  {
    id: "delete-account",
    category: "account",
    question: "계정을 삭제할 수 있나요?",
    answer: [
      { type: "p", text: "네. 사용자는 언제든지 계정 삭제를 요청할 수 있습니다." },
      {
        type: "p",
        text: "계정 삭제 시 서비스 이용을 위해 저장된 사용자 정보가 관련 법령 및 내부 정책에 따라 삭제 또는 비식별 처리됩니다.",
      },
    ],
  },
  {
    id: "report-error",
    category: "support",
    question: "오류나 이상한 내용을 발견하면 어떻게 하나요?",
    answer: [
      { type: "p", text: "MVP 단계에서는 리포트 품질을 계속 개선하고 있습니다." },
      {
        type: "p",
        text: "내용 오류, 어색한 표현, 잘못된 데이터, 사용 중 불편한 점을 발견하면 피드백을 보내 주세요.",
      },
      {
        type: "p",
        text: "사용자 피드백은 서비스 개선에 중요한 참고 자료로 사용됩니다.",
      },
    ],
  },
  {
    id: "feedback-channel",
    category: "support",
    question: "피드백은 어디로 보내면 되나요?",
    answer: [
      {
        type: "p",
        text: "피드백은 서비스 내 피드백 기능 또는 운영자가 안내하는 연락 수단을 통해 보낼 수 있습니다.",
      },
      {
        type: "p",
        text: "MVP 단계에서는 피드백 채널이 제한적일 수 있으며, 향후 전용 문의 창구를 준비할 수 있습니다.",
      },
    ],
  },
  {
    id: "upcoming",
    category: "roadmap",
    question: "앞으로 어떤 기능이 추가될 예정인가요?",
    answer: [
      {
        type: "p",
        text: "Market Memory는 MVP 이후 다음과 같은 방향으로 확장될 수 있습니다.",
      },
      {
        type: "list",
        items: [
          "과거 시장 흐름 아카이브",
          "테마별 리포트 모음",
          "주간·월간 시장 요약",
          "관심 테마 기반 개인화",
          "이메일 또는 알림 리포트",
          "다국어 리포트 품질 개선",
          "더 정교한 검색 및 필터 기능",
        ],
      },
      {
        type: "p",
        text: "단, 실제 제공 기능과 일정은 서비스 운영 상황에 따라 변경될 수 있습니다.",
      },
    ],
  },
];

const en: FaqEntry[] = [
  {
    id: "what-is-it",
    category: "intro",
    question: "What is Market Memory?",
    answer: [
      {
        type: "p",
        text: "Market Memory is a market-notes service that organizes the day's scattered market news and key movements, helping investors look back on and understand the market more easily.",
      },
      {
        type: "p",
        text: "Rather than simply listing headlines, it focuses on capturing what happened during the day and what those developments might mean for the market.",
      },
    ],
  },
  {
    id: "is-investment-advice",
    category: "intro",
    question: "Is Market Memory an investment recommendation service?",
    answer: [
      { type: "p", text: "No." },
      {
        type: "p",
        text: "Market Memory does not provide investment advice or recommendations on specific securities, assets, or buy/sell timing.",
      },
      {
        type: "p",
        text: "Our content is intended to provide information and interpretation to help you understand market trends. Final investment decisions are your own responsibility.",
      },
    ],
  },
  {
    id: "what-content",
    category: "intro",
    question: "What can I read here?",
    answer: [
      { type: "p", text: "During the MVP stage we mainly offer the following:" },
      {
        type: "list",
        items: [
          "Today's market memory",
          "Summaries of key market issues",
          "An overview of market sentiment",
          "Reports on global markets",
          "Thematic reports on AI, semiconductors, macro, geopolitics, and more",
        ],
      },
      {
        type: "p",
        text: "The scope of coverage may expand gradually as the service evolves.",
      },
    ],
  },
  {
    id: "languages",
    category: "intro",
    question: "Which languages does Market Memory support?",
    answer: [
      {
        type: "p",
        text: "During the MVP stage, Korean, Japanese, and English are available.",
      },
      {
        type: "p",
        text: "Some content may differ by language in terms of availability timing or wording quality.",
      },
    ],
  },
  {
    id: "mobile",
    category: "intro",
    question: "Can I use it on mobile?",
    answer: [
      {
        type: "p",
        text: "Market Memory is primarily a web service, and we are making sure it works well in mobile browsers too.",
      },
      {
        type: "p",
        text: "We plan to provide a mobile app or an app-style wrapper in the future.",
      },
    ],
  },
  {
    id: "update-frequency",
    category: "reports",
    question: "How often are reports updated?",
    answer: [
      {
        type: "p",
        text: "Reports are generally updated around days when the market is open.",
      },
      {
        type: "p",
        text: "During the MVP stage, however, update timing and frequency may vary depending on data collection, the analysis pipeline, and operational conditions.",
      },
    ],
  },
  {
    id: "weekend-holidays",
    category: "reports",
    question: "Are reports published on weekends or market holidays?",
    answer: [
      {
        type: "p",
        text: "New reports may be limited on U.S. market holidays or weekends.",
      },
      {
        type: "p",
        text: "That said, when there is a major global issue or weekly wrap-up content is ready, a separate report may be provided.",
      },
    ],
  },
  // {
  //   id: "sources",
  //   category: "reports",
  //   question: "What are the sources for the reports?",
  //   answer: [
  //     {
  //       type: "p",
  //       text: "Market Memory generates reports based on publicly available market news, economic indicators, company-related information, and financial market data.",
  //     },
  //     {
  //       type: "p",
  //       text: "During the MVP stage, not every source may be fully cited on each individual report, and the way sources are displayed will be improved over time.",
  //     },
  //   ],
  // },
  {
    id: "accuracy",
    category: "reports",
    question: "Are the reports always accurate?",
    answer: [
      {
        type: "p",
        text: "Market Memory strives to generate reports based on reliable information, but does not guarantee the accuracy, completeness, or timeliness of all information.",
      },
      {
        type: "p",
        text: "Market information can change rapidly, and some content may later be corrected or updated.",
      },
      {
        type: "p",
        text: "Reports are reference material based on information at a given point in time. When making investment decisions, please also consider the latest market conditions.",
      },
    ],
  },
  {
    id: "ai-generated",
    category: "reports",
    question: "Are the reports written by AI?",
    answer: [
      {
        type: "p",
        text: "Yes. Market Memory's reports are generated through an AI-based analysis and summarization process.",
      },
      {
        type: "p",
        text: "However, they are not just automatic summaries — they are designed to structure market trends and present them in a way that is easy to read.",
      },
      {
        type: "p",
        text: "During the MVP stage, the report structure, wording, and summarization approach may keep being adjusted to improve quality.",
      },
    ],
  },
  {
    id: "save-reports",
    category: "reports",
    question: "Can I save or revisit reports?",
    answer: [
      {
        type: "p",
        text: "Past reports are always available to read. However, an archive feature is not offered during the MVP stage.",
      },
      {
        type: "p",
        text: "Features such as saving, bookmarking, and managing favorite reports may be added gradually in the future.",
      },
    ],
  },
  {
    id: "sharing",
    category: "reports",
    question: "Can I share Market Memory reports externally?",
    answer: [
      { type: "p", text: "Personal reference and link sharing are allowed." },
      {
        type: "p",
        text: "However, copying, redistributing, or using an entire report for commercial purposes without permission may be restricted.",
      },
      { type: "p", text: "Please see the Terms of Service for details." },
    ],
  },
  {
    id: "signup-required",
    category: "account",
    question: "Do I need to sign up?",
    answer: [
      {
        type: "p",
        text: "Sign-up and login are required.",
      },
      {
        type: "p",
        text: "Login may be offered through external providers such as Google, and we use only the minimum information needed to operate the service.",
      },
    ],
  },
  {
    id: "free",
    category: "account",
    question: "Is it free to use?",
    answer: [
      { type: "p", text: "During the MVP stage, core features will be provided for free." },
      {
        type: "p",
        text: "As the service moves into full operation in the future, some advanced features or additional reports may be offered through paid plans.",
      },
    ],
  },
  {
    id: "future-paid",
    category: "account",
    question: "What might future paid features include?",
    answer: [
      { type: "p", text: "In the future, features like the following may be offered as paid features:" },
      {
        type: "list",
        items: [
          "Access to more reports",
          "Advanced search and filters",
          "Saving favorite themes",
          "Personalized market notes",
          "Weekly and monthly summary reports",
          "Notification or email reports",
        ],
      },
      {
        type: "p",
        text: "Specific paid features and pricing will be announced separately at the time of the official launch.",
      },
    ],
  },
  {
    id: "personalization",
    category: "account",
    question: "Are there personalization features?",
    answer: [
      { type: "p", text: "Personalization features are not available during the MVP stage." },
      {
        type: "p",
        text: "In the future we are exploring ways to deliver more tailored market notes based on the markets, themes, and report types you care about.",
      },
    ],
  },
  {
    id: "delete-account",
    category: "account",
    question: "Can I delete my account?",
    answer: [
      { type: "p", text: "Yes. You can request account deletion at any time." },
      {
        type: "p",
        text: "When an account is deleted, the user information stored to operate the service is deleted or de-identified in accordance with applicable laws and our internal policies.",
      },
    ],
  },
  {
    id: "report-error",
    category: "support",
    question: "What should I do if I find an error or something odd?",
    answer: [
      { type: "p", text: "During the MVP stage we are continuously improving report quality." },
      {
        type: "p",
        text: "If you notice content errors, awkward phrasing, incorrect data, or anything inconvenient, please send us feedback.",
      },
      {
        type: "p",
        text: "User feedback is an important reference for improving the service.",
      },
    ],
  },
  {
    id: "feedback-channel",
    category: "support",
    question: "Where can I send feedback?",
    answer: [
      {
        type: "p",
        text: "You can send feedback through the in-service feedback feature or the contact method the operator provides.",
      },
      {
        type: "p",
        text: "During the MVP stage, feedback channels may be limited, and we may set up a dedicated inquiry channel in the future.",
      },
    ],
  },
  {
    id: "upcoming",
    category: "roadmap",
    question: "What features are planned next?",
    answer: [
      {
        type: "p",
        text: "After the MVP, Market Memory may expand in the following directions:",
      },
      {
        type: "list",
        items: [
          "An archive of past market flows",
          "Collections of reports by theme",
          "Weekly and monthly market summaries",
          "Personalization based on favorite themes",
          "Email or notification reports",
          "Improved multilingual report quality",
          "More refined search and filtering",
        ],
      },
      {
        type: "p",
        text: "Actual features and timing may change depending on how the service operates.",
      },
    ],
  },
];

const ja: FaqEntry[] = [
  {
    id: "what-is-it",
    category: "intro",
    question: "Market Memoryはどんなサービスですか？",
    answer: [
      {
        type: "p",
        text: "Market Memoryは、毎日散らばっている市場ニュースや主要な動きを整理し、投資家が市場をより簡単に振り返り、理解できるよう手助けする市場メモサービスです。",
      },
      {
        type: "p",
        text: "単にニュースを並べるのではなく、その日にどんな出来事があり、その流れが市場にとってどんな意味を持ち得るかを整理することに重点を置いています。",
      },
    ],
  },
  {
    id: "is-investment-advice",
    category: "intro",
    question: "Market Memoryは投資推奨サービスですか？",
    answer: [
      { type: "p", text: "いいえ。" },
      {
        type: "p",
        text: "Market Memoryは、特定の銘柄・資産・売買タイミングに関する投資助言や推奨を提供しません。",
      },
      {
        type: "p",
        text: "提供するコンテンツは市場の流れを理解するための情報と解釈を目的としており、最終的な投資判断はご自身の責任で行っていただく必要があります。",
      },
    ],
  },
  {
    id: "what-content",
    category: "intro",
    question: "どんな内容を見られますか？",
    answer: [
      { type: "p", text: "MVP段階では主に次のような内容を提供します。" },
      {
        type: "list",
        items: [
          "今日のマーケットメモリー",
          "主要な市場イシューの要約",
          "市場ムードの整理",
          "グローバル市場に関するレポート",
          "AI・半導体・マクロ・地政学などの主要テーマレポート",
        ],
      },
      {
        type: "p",
        text: "提供範囲はサービスの運営状況に応じて段階的に拡張される可能性があります。",
      },
    ],
  },
  {
    id: "languages",
    category: "intro",
    question: "Market Memoryはどの言語に対応していますか？",
    answer: [
      {
        type: "p",
        text: "MVP段階では韓国語、日本語、英語を提供しています。",
      },
      {
        type: "p",
        text: "一部のコンテンツは、言語によって提供時期や表現の品質に差が生じる場合があります。",
      },
    ],
  },
  {
    id: "mobile",
    category: "intro",
    question: "モバイルでも利用できますか？",
    answer: [
      {
        type: "p",
        text: "Market Memoryはウェブサービスを中心に提供しており、モバイルブラウザでも利用できるよう準備を進めています。",
      },
      {
        type: "p",
        text: "今後、モバイルアプリまたはアプリ形式のラッパーを提供する予定です。",
      },
    ],
  },
  {
    id: "update-frequency",
    category: "reports",
    question: "レポートはどのくらいの頻度で更新されますか？",
    answer: [
      {
        type: "p",
        text: "基本的には市場が開く日を中心にレポートが更新されます。",
      },
      {
        type: "p",
        text: "ただしMVP段階では、データ収集・分析パイプライン・運営状況に応じて、更新時間や頻度が変わる場合があります。",
      },
    ],
  },
  {
    id: "weekend-holidays",
    category: "reports",
    question: "週末や休場日にもレポートは公開されますか？",
    answer: [
      {
        type: "p",
        text: "米国市場の休場日や週末には、新規レポートが限られる場合があります。",
      },
      {
        type: "p",
        text: "ただし重要なグローバルイシューがある場合や、週次まとめコンテンツが用意できた場合には、別途レポートを提供することがあります。",
      },
    ],
  },
  // {
  //   id: "sources",
  //   category: "reports",
  //   question: "レポートの情報源は何ですか？",
  //   answer: [
  //     {
  //       type: "p",
  //       text: "Market Memoryは、公開されている市場ニュース、経済指標、企業関連情報、金融市場データなどをもとにレポートを生成します。",
  //     },
  //     {
  //       type: "p",
  //       text: "ただしMVP段階では、すべての情報源が個々のレポートごとに完全に表示されるとは限らず、今後、出典の表示方法は改善していく予定です。",
  //     },
  //   ],
  // },
  {
    id: "accuracy",
    category: "reports",
    question: "レポートの内容は常に正確ですか？",
    answer: [
      {
        type: "p",
        text: "Market Memoryは信頼できる情報をもとにレポートを生成するよう努めていますが、すべての情報の正確性・完全性・最新性を保証するものではありません。",
      },
      {
        type: "p",
        text: "市場情報は急速に変化することがあり、一部の内容は後ほど訂正・更新される場合があります。",
      },
      {
        type: "p",
        text: "レポートは特定時点の情報に基づく参考資料です。投資判断の際には、最新の市場状況もあわせてご確認ください。",
      },
    ],
  },
  {
    id: "ai-generated",
    category: "reports",
    question: "AIが作成したレポートですか？",
    answer: [
      {
        type: "p",
        text: "はい。Market MemoryのレポートはAIによる分析・要約のプロセスを通じて生成されます。",
      },
      {
        type: "p",
        text: "ただし単なる自動要約ではなく、市場の流れを構造化し、読みやすく整理する方向で設計されています。",
      },
      {
        type: "p",
        text: "MVP段階では品質改善のため、レポートの構成・表現・要約の方法が継続的に調整される場合があります。",
      },
    ],
  },
  {
    id: "save-reports",
    category: "reports",
    question: "レポートを保存したり、見返したりできますか？",
    answer: [
      {
        type: "p",
        text: "過去のレポートはいつでも閲覧できます。ただしMVP段階ではアーカイブ機能は提供されていません。",
      },
      {
        type: "p",
        text: "保存・ブックマーク・お気に入りレポートの管理などの機能は、今後段階的に追加される可能性があります。",
      },
    ],
  },
  {
    id: "sharing",
    category: "reports",
    question: "Market Memoryのレポートを外部に共有してもよいですか？",
    answer: [
      { type: "p", text: "個人的な参考やリンクの共有は可能です。" },
      {
        type: "p",
        text: "ただし、レポート全体を無断で複製・再配布したり、商業目的で使用したりすることは制限される場合があります。",
      },
      { type: "p", text: "詳しくは利用規約をご確認ください。" },
    ],
  },
  {
    id: "signup-required",
    category: "account",
    question: "会員登録は必要ですか？",
    answer: [
      {
        type: "p",
        text: "会員登録およびログインは必須です。",
      },
      {
        type: "p",
        text: "ログインはGoogleなどの外部認証プロバイダを通じて提供される場合があり、サービス運営に必要な最小限の情報のみを使用します。",
      },
    ],
  },
  {
    id: "free",
    category: "account",
    question: "無料で利用できますか？",
    answer: [
      { type: "p", text: "MVP段階では、基本機能を無料で提供する予定です。" },
      {
        type: "p",
        text: "今後サービスが正式運営の段階に拡張されると、一部の高度な機能や追加レポートは有料プランで提供される場合があります。",
      },
    ],
  },
  {
    id: "future-paid",
    category: "account",
    question: "今後の有料機能にはどのようなものが含まれますか？",
    answer: [
      { type: "p", text: "今後は、次のような機能が有料機能として提供される可能性があります。" },
      {
        type: "list",
        items: [
          "より多くのレポートの閲覧",
          "高度な検索・フィルター",
          "関心テーマの保存",
          "パーソナライズされた市場メモ",
          "週次・月次のまとめレポート",
          "通知またはメールレポート",
        ],
      },
      {
        type: "p",
        text: "具体的な有料機能と価格は、正式リリースの時点で別途ご案内します。",
      },
    ],
  },
  {
    id: "personalization",
    category: "account",
    question: "パーソナライズ機能はありますか？",
    answer: [
      { type: "p", text: "MVP段階では、パーソナライズ機能は提供されていません。" },
      {
        type: "p",
        text: "今後は、関心のある市場・テーマ・レポートの種類に基づいて、よりパーソナライズされた市場メモを提供する方向を検討しています。",
      },
    ],
  },
  {
    id: "delete-account",
    category: "account",
    question: "アカウントを削除できますか？",
    answer: [
      { type: "p", text: "はい。いつでもアカウント削除を申請できます。" },
      {
        type: "p",
        text: "アカウント削除時には、サービス利用のために保存されたユーザー情報が、関連法令および社内ポリシーに従って削除または非識別化されます。",
      },
    ],
  },
  {
    id: "report-error",
    category: "support",
    question: "エラーやおかしな内容を見つけたらどうすればよいですか？",
    answer: [
      { type: "p", text: "MVP段階では、レポートの品質を継続的に改善しています。" },
      {
        type: "p",
        text: "内容の誤り・不自然な表現・誤ったデータ・利用中の不便な点を見つけた場合は、フィードバックをお送りください。",
      },
      {
        type: "p",
        text: "ユーザーのフィードバックは、サービス改善のための重要な参考資料として活用します。",
      },
    ],
  },
  {
    id: "feedback-channel",
    category: "support",
    question: "フィードバックはどこに送ればよいですか？",
    answer: [
      {
        type: "p",
        text: "フィードバックは、サービス内のフィードバック機能、または運営者が案内する連絡手段を通じてお送りいただけます。",
      },
      {
        type: "p",
        text: "MVP段階ではフィードバックチャネルが限られる場合があり、今後、専用の問い合わせ窓口を用意することがあります。",
      },
    ],
  },
  {
    id: "upcoming",
    category: "roadmap",
    question: "今後どのような機能が追加される予定ですか？",
    answer: [
      {
        type: "p",
        text: "Market MemoryはMVP以降、次のような方向で拡張される可能性があります。",
      },
      {
        type: "list",
        items: [
          "過去の市場の流れのアーカイブ",
          "テーマ別レポートのまとめ",
          "週次・月次の市場サマリー",
          "関心テーマに基づくパーソナライズ",
          "メールまたは通知レポート",
          "多言語レポートの品質改善",
          "より精緻な検索・フィルター機能",
        ],
      },
      {
        type: "p",
        text: "ただし、実際の提供機能や時期は、サービスの運営状況に応じて変更される場合があります。",
      },
    ],
  },
];

const FAQ_BY_LOCALE: Record<FaqLocale, FaqEntry[]> = { ko, en, ja };

/** Returns FAQ entries for the given locale, falling back to Korean. */
export function getFaqEntries(locale: string): FaqEntry[] {
  if (locale in FAQ_BY_LOCALE) {
    return FAQ_BY_LOCALE[locale as FaqLocale];
  }
  return FAQ_BY_LOCALE.ko;
}
