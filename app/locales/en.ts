import type { Translation } from "./types";
import authPages from "./auth/en";
import itemReports from "./item-reports/en";
import weeklyAiIssueDigest from "./weekly-ai-issue-digest/en";
import weeklyMarketIssues from "./weekly-market-issues/en";

const en: Translation = {
  common: {
    actions: {
      back: "Back",
      submit: "Submit",
    },
    labels: {
      email: "Email",
      password: "Password",
      name: "Name",
      confirmPassword: "Confirm password",
    },
    links: {
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      and: "and",
    },
  },
  ...authPages,
  brand: {
    name: "Market Memory",
    tagline: "Scattered market signals,\none coherent lens.",
  },
  home: {
    title: "Market Memory",
    meta: {
      description:
        "A research library where you can read daily global research, explore by topic, and connect insights into broader market narratives.",
    },
    getStarted: "Get started",
    goToLink: "Go to",
    continueReading: "Continue reading",
    reportCount: "{{count}} reports",
    hero: {
      badge: "Markets · Insights · Research Library",
      tagline: "Beyond the headlines — context and connections, organized.",
      description:
        "A research library to read daily global research, explore by topic, and follow the threads that shape the market.",
      features: {
        editedResearch: "Edited research",
        exploreByTopic: "Explore by topic",
        connectFlows: "Connected narratives",
      },
      social: {
        badge: "Private Preview · 2026",
        text: "The early version is available to a limited audience.",
      },
    },
    preview: {
      reportAriaLabel: "Report preview",
      issueLabel: "Issue 042 · Market Memory",
      editorialAngle: "Editorial Angle",
      trend: "Trend",
      headline: "AI infrastructure spending is rewriting the semiconductor value chain.",
      keyTakeaway: "Key Takeaway",
      takeawayBody:
        "Hyperscaler CapEx is on track to reach $320B in 2026, deepening structural bottlenecks in advanced packaging and HBM.",
      hooks: "Hooks",
      hooksList: [
        "CapEx is accelerating, with no clear signal of a slowdown yet.",
        "CoWoS supply remains the tightest binding constraint.",
        "Power and regional dispersion will anchor the next investment cycle.",
      ],
      quote:
        "We are moving into an era where power, not faster chips, becomes the bottleneck.",
      data: {
        capex: {
          label: "CapEx 2026e",
          delta: "+23%",
          caption: "vs 2024",
        },
        hbm: {
          label: "HBM Supply",
          delta: "tight",
          caption: "allocation / demand",
        },
        power: {
          label: "Power load",
          delta: "↑",
          caption: "DC power 2024→26",
        },
      },
      floatingChip: {
        title: "Related insight",
        headline: "Semiconductor CapEx cycle stays in expansion",
        period: "30d · cap-weighted",
        tickers: "MSFT · GOOG · META",
      },
      floatingGraph: {
        title: "Connected topics",
        ariaLabel: "Related topic graph",
        nodes: {
          power: "Power",
          semi: "Semiconductors",
          dc: "Data centers",
        },
      },
      floatingTimeline: {
        title: "Recent chronology",
        rows: [
          "AI infrastructure investment reshapes",
          "HBM pricing cycle peaks",
          "EU Chips Act Phase 2",
        ],
      },
    },
    productFeel: {
      eyebrow: "The reading experience",
      headline: "What it means to read\none report.",
      body: "Every report is structured around a core angle, summary, and shareable pull quote. Research travels with interpretation, and each piece stays available whenever you need to return to it.",
      card: {
        headline: "US 10-year yields and liquidity.",
        body: "A short research note on Treasury cash balance shifts, the direction of long rates, and the non-linear relationship between the two.",
        footerMeta: "Research note · 2026. 02. 12",
      },
    },
    threeWays: {
      eyebrow: "How to use it",
      headline: "Three ways to read.",
      read: {
        title: "Read",
        body: "Move through the day’s market with summaries and insights at a calm, steady pace.",
      },
      explore: {
        title: "Explore",
        body: "Follow categories, regions, and tags to widen the flows you care about.",
      },
      connect: {
        title: "Connect",
        body: "Link context across reports through timelines and related content.",
      },
    },
    timelineManifesto: {
      eyebrow: "Seeing the flow",
      headline: "Not a single headline,",
      headlineEmphasis: "but the grain of the market.",
      body: "Individual reports accumulate into market narrative.\nMonthly timelines and category lines let you unfold that flow again.",
      months: {
        march2026: "March 2026",
        february2026: "February 2026",
      },
      samples: {
        powerBottleneck: "Power infrastructure becomes the next AI supply-chain bottleneck",
        hbmPeak: "HBM pricing cycle — scenarios after the peak",
        euChipsAct: "What EU Chips Act Phase 2 funding approval means",
        treasuryLiquidity: "US 10-year yields and liquidity — research note",
      },
    },
    forReaders: {
      eyebrow: "Built for readers who",
      headline: "This is for you if…",
      lines: [
        "you want a steady rhythm of reading one research piece a day",
        "you want interpretation and context, not just numbers and charts",
        "you want what you read to stay findable instead of slipping away",
      ],
    },
    closing: {
      eyebrow: "Get started",
      headline: "Read today’s market",
      headlineEmphasis: "as one connected flow.",
      body: "A research library quietly opening for early readers.",
      signInLink: "Sign in →",
    },
    categories: {
      market: "Market",
      trend: "Trend",
      issue: "Issue",
      research: "Research",
    },
  },
  navigation: {
    en: "English",
    kr: "Korean",
    ja: "Japanese",
  },
  tooltip: {
    soon: "Coming soon",
  },
  menu: {
    links: {
      product: {
        title: "Product",
        items: {
          howItWorks: "How It Works",
          samples: "Samples",
          pricing: "Pricing",
        },
      },
      info: {
        title: "Info",
        items: {
          about: "About",
          blog: "Blog",
          sitemap: "Sitemap",
        },
      },
      support: {
        title: "Support",
        items: {
          faq: "FAQ",
          contact: "Contact",
          community: "Community",
        },
      },
      legal: {
        title: "Legal",
        items: {
          privacyPolicy: "Privacy Policy",
          termsOfService: "Terms of Service",
          commercialDisclosure: "Commercial Disclosure",
          refundPolicy: "Refund Policy",
        },
      },
    },
  },
  contact: {
    title: "Contact Us",
    description:
      "If you have any questions or suggestions, please feel free to contact us. We will respond quickly.",
  },
  faq: {
    meta: {
      title: "FAQ",
      description:
        "Answers to common questions about Market Memory's service, reports, account, and pricing.",
    },
    hero: {
      badge: "Help · FAQ",
      title: "Frequently Asked Questions",
      subtitle:
        "New to Market Memory? Here's what people ask most about the service, reports, and accounts.",
    },
    search: {
      label: "Search FAQ",
      placeholder: "Search for an answer",
    },
    resultsCount: "{{count}} questions",
    empty: {
      title: "No results found",
      description: "Try a different keyword or browse all questions.",
      clear: "Clear search",
    },
    categories: {
      intro: "About the service",
      reports: "Content & Reports",
      account: "Account & Pricing",
      support: "Feedback & Support",
      roadmap: "Roadmap",
    },
    cta: {
      title: "Didn't find what you were looking for?",
      description:
        "Have a question or feedback? Let us know anytime — your input helps us improve the service.",
      button: "Contact us",
    },
    disclaimer:
      "Market Memory is for informational purposes only and does not provide investment advice or recommendations. All investment decisions remain your own responsibility.",
  },
  dashboard: {
    meta: {
      title: "Dashboard",
      description:
        "View trading-day market briefings, snapshots, and the latest reports in one place.",
    },
    page: {
      eyebrow: "Dashboard",
      title: "Latest market briefing",
      subtitle:
        "Market memory organized by trading day—summary, themes, mood, and snapshot in one place.",
      tradingDay: "Market Date",
      publishedAtLabel: "Published",
      statusLabel: "Status",
      draftNote: "In progress",
      timezoneAbbr: "JST",
      datePicker: {
        triggerLabel: "View market memory for another day",
        title: "Pick a date",
        hint: "Only trading days with a record are selectable.",
        latest: "Latest",
      },
    },
  },
  itemReports,
  weeklyAiIssueDigest,
  weeklyMarketIssues,
  account: {
    meta: {
      title: "Account",
    },
    errors: {
      couldNotLoadProfile: "Could not load profile",
      couldNotLoadPlan: "Could not load plan information",
      couldNotLoadSocialAccounts: "Could not load social accounts",
      errorCode: "Code: {{code}}",
      errorMessage: "Message: {{message}}",
    },
    profile: {
      title: "Edit profile",
      description: "Manage your profile information.",
      avatar: "Avatar",
      avatarAlt: "Avatar",
      uploadAvatarAriaLabel: "Upload avatar",
      maxSize: "Max size: 1MB",
      allowedFormats: "Allowed formats: PNG, JPG, GIF",
      selectFile: "Select file",
      noFileSelected: "No file selected",
      nameLabel: "Name",
      namePlaceholder: "Nico",
      marketingConsent: "Consent to marketing emails",
      saveProfile: "Save profile",
      profileUpdated: "Profile updated",
    },
    email: {
      changeTitle: "Change email",
      addTitle: "Add email",
      changeDescription: "Change your email address.",
      addDescription: "Add an email address to your account.",
      currentEmail: "Current email",
      currentEmailHint: "This field cannot be edited",
      newEmail: "New email",
      emailLabel: "Email",
      emailPlaceholder: "new-email@example.com",
      updateStarted:
        "Email update process started. Please check your old email for a verification link.",
    },
    password: {
      changeTitle: "Change password",
      addTitle: "Add password",
      changeDescription: "Change your password.",
      addDescription: "Add a password to your account.",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      requirementsTitle: "Password requirements",
      requirements: {
        minLength: "At least 8 characters",
        upperLower: "Contains uppercase and lowercase letters",
        numbers: "Contains numbers",
      },
      passwordUpdated: "Password updated",
    },
    delete: {
      title: "Danger zone",
      warning:
        "This action cannot be undone. Deleting your account will permanently delete all your data.",
      confirmDelete: "I confirm that I want to delete my account.",
      confirmIrreversible: "I understand that this action is irreversible.",
      deleteAccount: "Delete account",
    },
  },
  dashboardSidebar: {
    groups: {
      platform: "Platform",
      series: "Series",
    },
    teamSwitcher: {
      modes: "Modes",
      switchMode: "Switch Mode",
      defaultTeamName: "Default",
      basicPlan: "Basic mode",
    },
    userMenu: {
      upgradeToPro: "Upgrade to Pro",
      account: "Account",
      notifications: "Notifications",
      logOut: "Log out",
    },
    soonBadge: "Soon",
    nav: {
      dashboard: {
        title: "Dashboard",
        marketBriefing: "Market Briefing",
        weeklyReport: "Weekly Report",
        monthlyReport: "Monthly Report",
      },
      reports: {
        title: "Reports",
        library: "Report Library",
        explore: "Explore",
        timeline: "Timeline",
      },
      insights: {
        title: "Insights",
        marketMemory: "Market Memory",
        entityExplore: "Entity Explorer",
      },
      admin: {
        title: "Admin",
        home: "Admin Home",
        pipelines: "Pipelines",
        agents: "Agents",
        prompts: "Prompts",
        apiTests: "API Tests",
        similarityMeasurements: "Similarity Measurements",
        i18nManagement: "i18n Management",
      },
    },
    series: {
      weeklyAiIssueDigest: "Weekly AI Issue Digest",
      weeklyMarketIssues: "Weekly Global Market Issues",
    },
  },
};

export default en;
