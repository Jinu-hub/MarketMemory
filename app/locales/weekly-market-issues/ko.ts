const weeklyMarketIssues = {
  fallback: {
    title: "주간 글로벌 시장 주요 이슈",
    description:
      "매주 글로벌 시장에서 주목할 주요 이슈를 정리합니다. 회차별로 따라 읽으며 시장 흐름을 놓치지 마세요.",
  },
  list: {
    metaDescription:
      "매주 글로벌 시장에서 주목할 주요 이슈를 정리합니다. 회차별로 따라 읽으며 시장 흐름을 놓치지 마세요.",
    seriesBadge: "Series",
    episodeCount: "{count}개 회차",
    pastEpisodes: "지난 회차",
    allEpisodes: "전체 회차",
    featuredFootnote: "이 시리즈의 가장 최근 회차입니다.",
  },
  view: {
    timeline: "타임라인",
    card: "카드",
    toggleAria: "보기 전환",
  },
  detail: {
    otherEpisodesTitle: "다른 회차",
    otherEpisodesAria: "다른 회차",
  },
  empty: {
    title: "아직 회차가 없습니다",
    description: "첫 번째 회차가 발행되면 여기에 표시됩니다.",
  },
} as const;

export default weeklyMarketIssues;
