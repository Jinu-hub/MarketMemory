const marketSignalsKo = {
  meta: {
    title: "마켓 시그널",
  },
  title: "마켓 시그널",
  subtitle: "글로벌 시장 이슈에서 집계한 기간별 시그널 랭킹",
  experimentalBadge: "실험",
  adminOnlyHint: "관리자 전용 미리보기입니다. 이후 전체 공개로 전환할 수 있습니다.",
  scopeLabel: "범위",
  scopeValue: "글로벌 시장 이슈",
  periodTypes: {
    weekly: "주간",
    monthly: "월간",
    yearly: "연간",
  },
  status: {
    draft: "집계중",
    final: "확정",
  },
  empty: {
    noSnapshots: "이 기간 유형의 스냅샷이 아직 없습니다.",
    noItems: "표시할 시그널이 없습니다. (minCount 미달일 수 있습니다)",
  },
  metaSidebar: {
    period: "기간",
    range: "구간",
    sources: "소스",
    signals: "시그널",
    updated: "갱신",
    layer: "집계 계층",
    partial: "부분 집계",
    partialYes: "진행 중 하위 period 포함",
    partialNo: "완료",
  },
  trends: {
    rising: "상승",
    falling: "하락",
    new: "신규",
    stable: "유지",
  },
  takeaway: {
    title: "한눈에",
    topSignal: "1위 시그널은 {{name}} ({{count}}회)입니다.",
    risingCount: "상승 추세 {{count}}개",
    newCount: "신규 {{count}}개",
  },
  view: {
    list: "리스트",
    bubble: "버블",
    toggleAria: "시그널 보기 방식",
  },
  bubble: {
    insightTitle: "버블 맵",
    insightBody:
      "원 크기 = 출현 횟수, 색 = 추세(상승·하락·신규·유지). 원을 선택하면 상세가 표시됩니다.",
  },
} as const;

export default marketSignalsKo;
