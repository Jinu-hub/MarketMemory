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
      title: "오늘의 시장",
      subtitle:
        "오늘 시장에서 무엇이 중요한지, 어떤 테마가 부각되는지, 전체 분위기가 어떤지 한 화면에서 빠르게 살펴보세요.",
    },
    snapshot: {
      ariaLabel: "시장 스냅샷",
      noData: "데이터 없음",
    },
    todayMemory: {
      eyebrow: "Today's Market Memory",
      defaultTitle: "오늘의 시장 메모리",
      emptyTitle: "오늘의 시장 메모리가 아직 준비되지 않았습니다",
      emptyDescription:
        "AI 파이프라인이 오늘 데이터를 생성하면 핵심 요약, 주요 테마, 시장 분위기가 이 영역에 표시됩니다.",
      reportCount: "개 리포트",
      draft: "Draft",
      sections: {
        summary: {
          title: "핵심 요약",
          hint: "오늘 시장을 어떻게 봐야 하는지에 대한 해석",
        },
        themes: {
          title: "오늘의 주요 테마",
          hint: "현재 시장에서 의미 있는 흐름 3가지",
        },
        mood: {
          title: "시장 분위기",
          hint: "지수·자산·테마·리스크를 종합한 AI 해석",
        },
      },
      empty: {
        coreSummary: "핵심 요약이 아직 준비되지 않았습니다.",
        themes: "오늘 추출된 주요 테마가 없습니다.",
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
      title: "현재 이슈와 닮은 과거의 기억",
      description:
        "오늘 시장 메모리와 유사한 과거 리포트, 그리고 반복되는 시장 패턴을 보여줍니다.",
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
      title: "오늘의 리스크 신호",
      description: "시장 메모리 파이프라인이 식별한 주의해야 할 리스크입니다.",
      preview: "Preview",
      countSuffix: "건",
      riskIndex: "Risk",
    },
  },
  en: {
    page: {
      eyebrow: "Dashboard",
      title: "Today's market",
      subtitle:
        "See what matters today, which themes stand out, and the overall mood—all on one screen.",
    },
    snapshot: {
      ariaLabel: "Market snapshot",
      noData: "No data",
    },
    todayMemory: {
      eyebrow: "Today's Market Memory",
      defaultTitle: "Today's market memory",
      emptyTitle: "Today's market memory is not ready yet",
      emptyDescription:
        "When the AI pipeline generates today's data, the summary, themes, and mood will appear here.",
      reportCount: " reports",
      draft: "Draft",
      sections: {
        summary: {
          title: "Core summary",
          hint: "How to read today's market",
        },
        themes: {
          title: "Key themes today",
          hint: "Three meaningful flows in the market now",
        },
        mood: {
          title: "Market mood",
          hint: "AI read across indices, assets, themes, and risk",
        },
      },
      empty: {
        coreSummary: "Core summary is not ready yet.",
        themes: "No key themes were extracted today.",
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
      title: "Past memories like today's issues",
      description:
        "Similar past reports and repeating market patterns aligned with today's memory.",
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
      title: "Today's risk signals",
      description: "Risks flagged by the market memory pipeline.",
      preview: "Preview",
      countSuffix: "",
      riskIndex: "Risk",
    },
  },
  ja: {
    page: {
      eyebrow: "Dashboard",
      title: "今日の市場",
      subtitle:
        "今日の市場で何が重要か、どのテーマが目立つか、全体のムードを一画面で素早く確認できます。",
    },
    snapshot: {
      ariaLabel: "市場スナップショット",
      noData: "データなし",
    },
    todayMemory: {
      eyebrow: "Today's Market Memory",
      defaultTitle: "今日の市場メモリ",
      emptyTitle: "今日の市場メモリはまだ準備されていません",
      emptyDescription:
        "AIパイプラインが今日のデータを生成すると、要約・テーマ・ムードがここに表示されます。",
      reportCount: "件のレポート",
      draft: "Draft",
      sections: {
        summary: {
          title: "核心要約",
          hint: "今日の市場の見方",
        },
        themes: {
          title: "今日の主要テーマ",
          hint: "現在の市場で意味のある3つの流れ",
        },
        mood: {
          title: "市場ムード",
          hint: "指数・資産・テーマ・リスクを総合したAI解釈",
        },
      },
      empty: {
        coreSummary: "核心要約はまだ準備されていません。",
        themes: "今日抽出された主要テーマはありません。",
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
      title: "今日の論点に似た過去の記憶",
      description:
        "今日の市場メモリに似た過去レポートと、繰り返す市場パターンを表示します。",
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
      title: "今日のリスクシグナル",
      description: "市場メモリパイプラインが特定した注意リスクです。",
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
