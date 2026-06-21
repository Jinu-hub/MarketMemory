const weeklyMarketIssues = {
  fallback: {
    title: "週間グローバル市場イシュー",
    description:
      "毎週、グローバル市場で注目すべき主要イシューを整理します。回ごとに読み進め、市場の流れを見逃さないでください。",
  },
  list: {
    metaDescription:
      "毎週、グローバル市場で注目すべき主要イシューを整理します。回ごとに読み進め、市場の流れを見逃さないでください。",
    seriesBadge: "Series",
    episodeCount: "{count}回",
    pastEpisodes: "過去の回",
    allEpisodes: "全回",
    featuredFootnote: "このシリーズの最新回です。",
  },
  view: {
    timeline: "タイムライン",
    card: "カード",
    toggleAria: "表示切替",
  },
  detail: {
    otherEpisodesTitle: "他の回",
    otherEpisodesAria: "他の回",
  },
  empty: {
    title: "まだ回がありません",
    description: "最初の回が公開されると、ここに表示されます。",
  },
} as const;

export default weeklyMarketIssues;
