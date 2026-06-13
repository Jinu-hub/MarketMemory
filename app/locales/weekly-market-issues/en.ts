const weeklyMarketIssues = {
  fallback: {
    title: "Weekly Global Market Issues",
    description:
      "Each week we summarize the key issues moving global markets. Follow episode by episode so you never lose the thread.",
  },
  list: {
    metaDescription:
      "Each week we summarize the key issues moving global markets. Follow episode by episode so you never lose the thread.",
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

export default weeklyMarketIssues;
