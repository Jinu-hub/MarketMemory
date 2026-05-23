/**
 * Dashboard static copy — semantic labels (DB-key-driven) and UI chrome.
 *
 * Not wired to `app/locales/*` yet. When migrating, map these keys to
 * `dashboard.semantic.*` / `dashboard.ui.*` in the locale files.
 */
import type { DashboardLocale } from "./resolve";

/* ── Semantic (enum / pipeline key → label) ───────────────────────── */

const trendStatus = {
  ko: {
    up: "상승",
    stable: "유지",
    down: "약화",
    unknown: "관찰",
  },
  en: {
    up: "Rising",
    stable: "Stable",
    down: "Weakening",
    unknown: "Watch",
  },
  ja: {
    up: "上昇",
    stable: "維持",
    down: "弱化",
    unknown: "観察",
  },
} as const satisfies Record<DashboardLocale, Record<string, string>>;

const riskSeverity = {
  ko: {
    low: "낮음",
    medium: "중간",
    high: "높음",
    critical: "심각",
    unknown: "주의",
  },
  en: {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    unknown: "Watch",
  },
  ja: {
    low: "低",
    medium: "中",
    high: "高",
    critical: "重大",
    unknown: "注意",
  },
} as const satisfies Record<DashboardLocale, Record<string, string>>;

const marketMoodLabels = {
  ko: {
    risk_on: "위험선호",
    risk_off: "위험회피",
    mixed: "혼재",
    cautious: "신중",
    unknown: "알 수 없음",
  },
  en: {
    risk_on: "Risk-On",
    risk_off: "Risk-Off",
    mixed: "Mixed",
    cautious: "Cautious",
    unknown: "Unknown",
  },
  ja: {
    risk_on: "リスクオン",
    risk_off: "リスクオフ",
    mixed: "まちまち",
    cautious: "慎重",
    unknown: "不明",
  },
} as const satisfies Record<DashboardLocale, Record<string, string>>;

const marketMoodDescriptions = {
  ko: {
    risk_on: "위험자산 선호",
    risk_off: "방어적 시장",
    mixed: "혼합 국면",
    cautious: "신중한 관망",
    unknown: "분위기 정보 없음",
  },
  en: {
    risk_on: "Risk asset preference",
    risk_off: "Defensive market",
    mixed: "Mixed regime",
    cautious: "Cautious stance",
    unknown: "Mood unavailable",
  },
  ja: {
    risk_on: "リスク資産選好",
    risk_off: "防御的な市場",
    mixed: "混在した局面",
    cautious: "慎重な様子見",
    unknown: "ムード不明",
  },
} as const satisfies Record<DashboardLocale, Record<string, string>>;

const marketMoodSubdescriptions = {
  ko: {
    risk_on:
      "시장 전반에 위험선호가 강합니다. 주식·성장주·크립토 등 고위험 자산이 폭넓게 강하고, 매크로·유동성 환경이 위험자산에 우호적으로 읽힙니다.",
    risk_off:
      "위험회피가 두드러집니다. 주식 약세, 안전자산 선호, 변동성 상승 등 투자자들이 리스크를 줄이는 흐름이 관찰됩니다.",
    mixed:
      "신호가 엇갈립니다. 지수와 내부 강도·섹터·매크로가 상충해 Risk-On/Off로 단정하기 어렵습니다.",
    cautious:
      "완전한 Risk-Off는 아니지만 조심스러운 국면입니다. 일부 테마는 강하나 인플레·금리·지정학 등이 광범위한 위험선호를 제한합니다.",
    unknown: "분위기 유형 정보가 아직 준비되지 않았습니다.",
  },
  en: {
    risk_on:
      "Broad risk appetite: equities, growth, and crypto lead; macro and liquidity read as supportive for risk assets.",
    risk_off:
      "Defensive tone: equities weaken, safe havens and volatility rise—investors are trimming risk.",
    mixed:
      "Cross-currents: index, internals, sectors, or macro conflict—hard to call a clean Risk-On or Risk-Off.",
    cautious:
      "Selective risk-on: some themes work, but inflation, rates, geopolitics, or liquidity cap broad risk appetite.",
    unknown: "Mood type details are not available yet.",
  },
  ja: {
    risk_on:
      "市場全体でリスクオン。株式・グロース・暗号資産が広く強く、マクロ・流動性はリスク資産に追い風と読まれます。",
    risk_off:
      "リスクオフが目立つ日。株式弱含み、安全資産選好、ボラ上昇など、リスク縮小の動きが観察されます。",
    mixed:
      "シグナルが交錯。指数・内部・セクター・マクロが噛み合わず、リスクオン/オフと断定しにくい局面です。",
    cautious:
      "完全なリスクオフではないが慎重な日。一部テーマは強いが、インフレ・金利・地政学などが広いリスク選好を抑えます。",
    unknown: "ムード区分の説明はまだありません。",
  },
} as const satisfies Record<DashboardLocale, Record<string, string>>;

/* ── UI chrome (sections, empty states, badges) ───────────────────── */

const ui = {
  ko: {
    page: {
      eyebrow: "Dashboard",
      title: "최신 시장 브리핑",
      subtitle:
        "거래일 기준으로 정리한 시장 메모리입니다. 핵심 요약, 테마, 분위기와 스냅샷을 한 화면에서 확인할 수 있습니다.",
      publishedAtLabel: "발행",
      statusLabel: "상태",
      draftNote: "처리 중",
      timezoneAbbr: "JST",
    },
    snapshot: {
      ariaLabel: "시장 스냅샷",
      noData: "데이터 없음",
      caption: "발행시점 기준 주요 시세·지표",
    },
    todayMemory: {
      eyebrow: "Daily Market Memory",
      defaultTitle: "시장 메모리",
      emptyTitle: "아직 발행된 시장 메모리가 없습니다",
      emptyDescription:
        "다음 발행분이 준비되면 핵심 요약, 주요 테마, 시장 분위기가 여기에 표시됩니다.",
      reportCount: "개 리포트",
      draft: "Draft",
      sections: {
        summary: {
          title: "핵심 요약",
          hint: "해당 거래일 시장을 어떻게 봐야 하는지",
        },
        themes: {
          title: "주요 테마",
          hint: "거래일 기준 의미 있는 흐름 3가지",
        },
        mood: {
          title: "시장 분위기",
          hint: "지수·자산·테마·리스크를 종합한 AI 해석",
        },
      },
      empty: {
        coreSummary: "핵심 요약이 아직 준비되지 않았습니다.",
        themes: "추출된 주요 테마가 없습니다.",
        mood: "분위기 해석이 아직 준비되지 않았습니다.",
      },
      relatedReports: "관련",
      relatedReportsSuffix: "건",
    },
    latestReports: {
      title: "최신 리포트",
      viewAll: "전체보기",
      countSuffix: "건",
      empty: "아직 공개된 리포트가 없습니다.",
    },
    memoryRecall: {
      eyebrow: "Memory Recall",
      title: "이번 브리핑과 닮은 과거의 기억",
      description:
        "이번 브리핑과 유사한 과거 리포트, 그리고 반복되는 시장 패턴을 보여줍니다.",
      preview: "Preview",
      similar: {
        title: "유사한 과거 메모리",
        hint: "태그·테마·분위기가 함께 겹쳤던 날들",
        similarity: "유사도",
        similaritySuffix: "%",
      },
      patterns: {
        title: "반복되는 시장 패턴",
        hint: "비슷한 흐름이 반복되었던 패턴 신호",
        occurrencesSuffix: "회",
      },
    },
    riskRadar: {
      eyebrow: "Risk Radar",
      title: "리스크 신호",
      description: "이번 메모리에서 눈에 띈 리스크 신호입니다.",
      preview: "Preview",
      countSuffix: "건",
      riskIndex: "Risk",
    },
  },
  en: {
    page: {
      eyebrow: "Dashboard",
      title: "Latest market briefing",
      subtitle:
        "Market memory organized by trading day—summary, themes, mood, and snapshot in one place.",
      publishedAtLabel: "Published",
      statusLabel: "Status",
      draftNote: "In progress",
      timezoneAbbr: "JST",
    },
    snapshot: {
      ariaLabel: "Market snapshot",
      noData: "No data",
      caption: "Key prices and indicators at publish time",
    },
    todayMemory: {
      eyebrow: "Daily Market Memory",
      defaultTitle: "Market memory",
      emptyTitle: "No market memory has been published yet",
      emptyDescription:
        "The next edition will show the summary, themes, and mood here.",
      reportCount: " reports",
      draft: "Draft",
      sections: {
        summary: {
          title: "Core summary",
          hint: "How to read the market for this trading day",
        },
        themes: {
          title: "Key themes",
          hint: "Three meaningful flows for the trading day",
        },
        mood: {
          title: "Market mood",
          hint: "AI read across indices, assets, themes, and risk",
        },
      },
      empty: {
        coreSummary: "Core summary is not ready yet.",
        themes: "No key themes were extracted.",
        mood: "Mood interpretation is not ready yet.",
      },
      relatedReports: "Related",
      relatedReportsSuffix: "",
    },
    latestReports: {
      title: "Latest reports",
      viewAll: "View all",
      countSuffix: "",
      empty: "No published reports yet.",
    },
    memoryRecall: {
      eyebrow: "Memory Recall",
      title: "Past memories like this briefing",
      description:
        "Similar past reports and repeating patterns aligned with this briefing.",
      preview: "Preview",
      similar: {
        title: "Similar past memories",
        hint: "Days when tags, themes, and mood overlapped",
        similarity: "Similarity",
        similaritySuffix: "%",
      },
      patterns: {
        title: "Repeating patterns",
        hint: "Signals of flows that have repeated before",
        occurrencesSuffix: "×",
      },
    },
    riskRadar: {
      eyebrow: "Risk Radar",
      title: "Risk signals",
      description: "Risk signals noted in this edition.",
      preview: "Preview",
      countSuffix: "",
      riskIndex: "Risk",
    },
  },
  ja: {
    page: {
      eyebrow: "Dashboard",
      title: "最新の市場ブリーフィング",
      subtitle:
        "取引日ごとに整理した市場メモリ。要約・テーマ・ムードとスナップショットを一画面で見られます。",
      publishedAtLabel: "配信",
      statusLabel: "状態",
      draftNote: "処理中",
      timezoneAbbr: "JST",
    },
    snapshot: {
      ariaLabel: "市場スナップショット",
      noData: "データなし",
      caption: "配信時点基準の主要な価格・指標",
    },
    todayMemory: {
      eyebrow: "Daily Market Memory",
      defaultTitle: "市場メモリ",
      emptyTitle: "まだ配信された市場メモリがありません",
      emptyDescription:
        "次の配信分が整うと、要約・テーマ・ムードがここに表示されます。",
      reportCount: "件のレポート",
      draft: "Draft",
      sections: {
        summary: {
          title: "核心要約",
          hint: "この取引日の市場の見方",
        },
        themes: {
          title: "主要テーマ",
          hint: "取引日基準で意味のある3つの流れ",
        },
        mood: {
          title: "市場ムード",
          hint: "指数・資産・テーマ・リスクを総合したAI解釈",
        },
      },
      empty: {
        coreSummary: "核心要約はまだ準備されていません。",
        themes: "抽出された主要テーマはありません。",
        mood: "ムード解釈はまだ準備されていません。",
      },
      relatedReports: "関連",
      relatedReportsSuffix: "件",
    },
    latestReports: {
      title: "最新レポート",
      viewAll: "すべて見る",
      countSuffix: "件",
      empty: "公開されたレポートはまだありません。",
    },
    memoryRecall: {
      eyebrow: "Memory Recall",
      title: "今回の論点に似た過去の記憶",
      description:
        "今回のブリーフィングに似た過去レポートと、繰り返す市場パターンを表示します。",
      preview: "Preview",
      similar: {
        title: "類似した過去メモリ",
        hint: "タグ・テーマ・ムードが重なった日",
        similarity: "類似度",
        similaritySuffix: "%",
      },
      patterns: {
        title: "繰り返す市場パターン",
        hint: "似た流れが繰り返されたシグナル",
        occurrencesSuffix: "回",
      },
    },
    riskRadar: {
      eyebrow: "Risk Radar",
      title: "リスクシグナル",
      description: "今回のメモリで拾ったリスクシグナルです。",
      preview: "Preview",
      countSuffix: "件",
      riskIndex: "Risk",
    },
  },
} as const;

export const DASHBOARD_MESSAGES = {
  semantic: {
    trendStatus,
    riskSeverity,
    marketMood: {
      labels: marketMoodLabels,
      descriptions: marketMoodDescriptions,
      subdescriptions: marketMoodSubdescriptions,
    },
  },
  ui,
} as const;

export type DashboardUiMessages = (typeof ui)[DashboardLocale];

export type TrendStatusLabelKey = keyof (typeof trendStatus)["ko"];
export type RiskSeverityLabelKey = keyof (typeof riskSeverity)["ko"];
export type MarketMoodLabelKey = keyof (typeof marketMoodLabels)["ko"];
