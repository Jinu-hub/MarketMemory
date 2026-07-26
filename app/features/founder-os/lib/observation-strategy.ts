/**
 * Founder OS 관찰 전략 — 주제 키워드가 아니라
 * 「관찰 대상 × 문제 신호」로 검색 후보를 만든다.
 *
 * 프로토타입에서는 코드 상수로 관리한다. DB 이관은 후보를 자주 바꾸게 된 뒤에.
 */

export type KeywordPresetGroup = {
  id: string;
  label: string;
  keywords: string[];
};

export type ObservationDomain = {
  id: string;
  label: string;
  description: string;
  /**
   * everyday: 일상·업무 문제 표현과 조합
   * founder_dev: 창업·개발·제품 운영 Observer (기존 주제 키워드 포함)
   */
  kind: "everyday" | "founder_dev";
  /** 도메인 맥락 단어 — 문제 신호와 조합해 검색 후보를 만든다 */
  contextTerms: string[];
  /** founder_dev 전용: 이미 이름을 아는 주제 키워드 */
  topicGroups?: KeywordPresetGroup[];
};

export type ProblemSignal = {
  id: string;
  label: string;
  /** 사람들이 불편함을 말할 때 쓰는 문장 패턴 */
  phrases: string[];
};

/** 기존 Founder / Developer Observer 주제 키워드 */
export const FOUNDER_DEV_TOPIC_GROUPS: KeywordPresetGroup[] = [
  {
    id: "customer-acquisition",
    label: "사용자 확보",
    keywords: [
      "first users",
      "early users",
      "find customers",
      "customer acquisition",
      "user activation",
      "low conversion",
    ],
  },
  {
    id: "feedback-validation",
    label: "피드백과 검증",
    keywords: [
      "customer feedback",
      "user interviews",
      "validate idea",
      "product validation",
      "feature request",
      "customer discovery",
    ],
  },
  {
    id: "product-ops",
    label: "제품 운영",
    keywords: [
      "user onboarding",
      "customer support",
      "churn",
      "pricing",
      "analytics",
      "data export",
      "integration",
    ],
  },
  {
    id: "dev-workarounds",
    label: "도구·우회",
    keywords: [
      "current workaround",
      "using spreadsheets",
      "manual process",
      "built an internal tool",
      "looking for a tool",
      "alternative to",
    ],
  },
];

export const OBSERVATION_DOMAINS: ObservationDomain[] = [
  {
    id: "everyday-life",
    label: "일반 생활",
    description: "일상에서 반복되는 귀찮음·시간 낭비",
    kind: "everyday",
    contextTerms: [
      "everyday",
      "daily life",
      "at home",
      "personal life",
      "routine",
    ],
  },
  {
    id: "work",
    label: "업무",
    description: "직장·협업·업무 프로세스의 불편함",
    kind: "everyday",
    contextTerms: ["work", "at work", "my job", "office", "coworkers", "team"],
  },
  {
    id: "small-business",
    label: "자영업",
    description: "가게·프리랜서·소규모 운영의 수작업",
    kind: "everyday",
    contextTerms: [
      "small business",
      "my shop",
      "freelance",
      "clients",
      "invoices",
    ],
  },
  {
    id: "parenting",
    label: "육아",
    description: "돌봄·일정·가족 조율에서 생기는 부담",
    kind: "everyday",
    contextTerms: ["kids", "parenting", "childcare", "school", "family"],
  },
  {
    id: "personal-finance",
    label: "개인 재무",
    description: "지출·구독·영수증·예산 관리",
    kind: "everyday",
    contextTerms: [
      "expenses",
      "budget",
      "receipts",
      "subscriptions",
      "bills",
      "money",
    ],
  },
  {
    id: "health",
    label: "건강 관리",
    description: "병원·약·기록·건강 습관 관리",
    kind: "everyday",
    contextTerms: [
      "health",
      "doctor",
      "appointments",
      "medication",
      "medical records",
    ],
  },
  {
    id: "travel",
    label: "여행",
    description: "예약·일정·이동·짐 챙기기의 번거로움",
    kind: "everyday",
    contextTerms: ["travel", "trip", "flight", "hotel", "itinerary", "booking"],
  },
  {
    id: "founder-dev",
    label: "개발자·시스템관리",
    description: "창업·개발·SaaS 운영 문제 (Founder / Developer Observer)",
    kind: "founder_dev",
    contextTerms: [
      "startup",
      "saas",
      "product",
      "engineering",
      "deploy",
      "devops",
    ],
    topicGroups: FOUNDER_DEV_TOPIC_GROUPS,
  },
];

export const PROBLEM_SIGNALS: ProblemSignal[] = [
  {
    id: "time-waste",
    label: "시간이 오래 걸림",
    phrases: [
      "takes too long",
      "takes forever",
      "spend hours",
      "waste so much time",
      "time consuming",
      "every single time",
    ],
  },
  {
    id: "repetitive",
    label: "반복 작업",
    phrases: [
      "do this manually",
      "manually every time",
      "repetitive task",
      "keep entering the same",
      "copy and paste",
      "have to repeat",
    ],
  },
  {
    id: "complexity",
    label: "너무 복잡함",
    phrases: [
      "too complicated",
      "hard to understand",
      "confusing",
      "can't keep track",
      "too many steps",
      "difficult to manage",
    ],
  },
  {
    id: "forgetting",
    label: "자주 잊음",
    phrases: [
      "I keep forgetting",
      "forgot to",
      "missed the deadline",
      "need to remember",
      "remind myself",
      "things fall through the cracks",
    ],
  },
  {
    id: "scattered-info",
    label: "정보가 흩어짐",
    phrases: [
      "information is scattered",
      "switching between apps",
      "too many tools",
      "can't find the file",
      "which version is latest",
      "keep track of everything",
    ],
  },
  {
    id: "cost",
    label: "비용이 너무 큼",
    phrases: [
      "too expensive",
      "costs too much",
      "not worth the money",
      "cheaper alternative",
      "paying for",
    ],
  },
  {
    id: "tool-friction",
    label: "기존 도구가 불편함",
    phrases: [
      "current workaround",
      "using spreadsheets",
      "manual process",
      "built an internal tool",
      "I'm tired of",
      "I hate having to",
    ],
  },
  {
    id: "seeking-easier",
    label: "더 쉬운 방법을 찾음",
    phrases: [
      "is there an easier way",
      "there must be a better way",
      "looking for a tool",
      "how do you manage",
      "does anyone know",
      "I wish there was",
    ],
  },
];

const DEFAULT_MAX_CANDIDATES = 30;
const MAX_CONTEXT_PER_DOMAIN = 3;
const MAX_PHRASES_PER_SIGNAL = 4;

function keywordKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * 관찰 대상 × 문제 신호로 검색 후보를 만든다.
 *
 * - 문제 신호 문구는 단독 후보로 포함 (일상 문제 표현 자체 검색)
 * - 도메인 맥락어 + 문제 문구 조합으로 범위를 좁힌 후보 추가
 * - founder_dev 도메인의 주제 키워드는 별도 UI에서 다루므로 여기엔 넣지 않음
 */
export function buildSearchCandidates(
  domainIds: string[],
  signalIds: string[],
  maxCandidates: number = DEFAULT_MAX_CANDIDATES,
): string[] {
  const domains = OBSERVATION_DOMAINS.filter((domain) =>
    domainIds.includes(domain.id),
  );
  const signals = PROBLEM_SIGNALS.filter((signal) =>
    signalIds.includes(signal.id),
  );

  if (signals.length === 0) {
    return [];
  }

  const result: string[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    const keyword = raw.trim().replace(/\s+/g, " ");
    if (keyword.length === 0 || result.length >= maxCandidates) {
      return;
    }
    const key = keywordKey(keyword);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(keyword);
  };

  // 1) 문제 표현 패턴 단독 — “무엇을 귀찮아하는가”의 직접 신호
  for (const signal of signals) {
    for (const phrase of signal.phrases) {
      push(phrase);
    }
  }

  // 2) 관찰 대상 × 문제 신호 조합
  for (const domain of domains) {
    const terms = domain.contextTerms.slice(0, MAX_CONTEXT_PER_DOMAIN);
    for (const signal of signals) {
      const phrases = signal.phrases.slice(0, MAX_PHRASES_PER_SIGNAL);
      for (const term of terms) {
        for (const phrase of phrases) {
          push(`${term} ${phrase}`);
        }
      }
    }
  }

  return result;
}

export function findObservationDomain(id: string) {
  return OBSERVATION_DOMAINS.find((domain) => domain.id === id);
}

export function findProblemSignal(id: string) {
  return PROBLEM_SIGNALS.find((signal) => signal.id === id);
}

/** collection_runs.observation_strategy 에 저장하는 스냅샷 */
export type ObservationStrategySnapshot = {
  domains: Array<{ id: string; label: string }>;
  signals: Array<{ id: string; label: string }>;
};

/**
 * 선택된 관찰 대상·문제 신호 ID로 DB 저장용 스냅샷을 만든다.
 * 라벨을 함께 남겨 상수 문구가 바뀌어도 실행 이력을 읽을 수 있게 한다.
 */
export function buildObservationStrategySnapshot(
  domainIds: string[],
  signalIds: string[],
): ObservationStrategySnapshot | null {
  const domains = domainIds.flatMap((id) => {
    const domain = findObservationDomain(id);
    return domain ? [{ id: domain.id, label: domain.label }] : [];
  });
  const signals = signalIds.flatMap((id) => {
    const signal = findProblemSignal(id);
    return signal ? [{ id: signal.id, label: signal.label }] : [];
  });

  if (domains.length === 0 && signals.length === 0) {
    return null;
  }

  return { domains, signals };
}
