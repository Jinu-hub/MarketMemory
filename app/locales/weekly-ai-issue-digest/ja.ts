const weeklyAiIssueDigest = {
  fallback: {
    title: "週間AIイシューダイジェスト",
    description:
      "毎週、最も重要なAIイシューを厳選し、1本のレポートにまとめます。流れを見逃さないよう、回ごとに読み進めてください。",
  },
  list: {
    metaDescription:
      "毎週、最も重要なAIイシューを厳選し、1本のレポートにまとめます。流れを見逃さないよう、回ごとに読み進めてください。",
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

export default weeklyAiIssueDigest;
