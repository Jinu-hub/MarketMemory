const weeklyAiIssueDigest = {
  fallback: {
    title: "Weekly AI Issue Digest",
    description:
      "Each week we curate the most important AI stories into one report. Follow episode by episode so you never lose the thread.",
  },
  list: {
    metaDescription:
      "Each week we curate the most important AI stories into one report. Follow episode by episode so you never lose the thread.",
    seriesBadge: "Series",
    episodeCount: "{count} episodes",
    pastEpisodes: "Past episodes",
    allEpisodes: "All episodes",
    featuredFootnote: "The latest episode in this series.",
  },
  view: {
    timeline: "Timeline",
    card: "Card",
    toggleAria: "Switch view",
  },
  detail: {
    otherEpisodesTitle: "Other episodes",
    otherEpisodesAria: "Other episodes",
  },
  empty: {
    title: "No episodes yet",
    description: "Episodes will appear here once the first one is published.",
  },
} as const;

export default weeklyAiIssueDigest;
