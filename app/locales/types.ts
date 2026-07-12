import type { AuthTranslation } from "./auth/types";
import type { ItemReportsTranslation } from "./item-reports/types";
import type { WeeklyAiIssueDigestTranslation } from "./weekly-ai-issue-digest/types";
import type { WeeklyMarketIssuesTranslation } from "./weekly-market-issues/types";

export type Translation = {
  common: {
    actions: {
      back: string;
      submit: string;
      scrollToTop: string;
    };
    labels: {
      email: string;
      password: string;
      name: string;
      confirmPassword: string;
    };
    links: {
      terms: string;
      privacy: string;
      and: string;
    };
  };
} & AuthTranslation & {
  brand: {
    name: string;
    tagline: string;
  };
  home: {
    title: string;
    meta: {
      description: string;
    };
    getStarted: string;
    goToLink: string;
    continueReading: string;
    reportCount: string;
    hero: {
      badge: string;
      tagline: string;
      description: string;
      viewSamples: string;
      features: {
        editedResearch: string;
        exploreByTopic: string;
        connectFlows: string;
      };
      social: {
        badge: string;
        text: string;
      };
    };
    preview: {
      reportAriaLabel: string;
      issueLabel: string;
      editorialAngle: string;
      trend: string;
      headline: string;
      keyTakeaway: string;
      takeawayBody: string;
      hooks: string;
      hooksList: [string, string, string];
      quote: string;
      data: {
        capex: {
          label: string;
          delta: string;
          caption: string;
        };
        hbm: {
          label: string;
          delta: string;
          caption: string;
        };
        power: {
          label: string;
          delta: string;
          caption: string;
        };
      };
      floatingChip: {
        title: string;
        headline: string;
        period: string;
        tickers: string;
      };
      floatingGraph: {
        title: string;
        ariaLabel: string;
        nodes: {
          power: string;
          semi: string;
          dc: string;
        };
      };
      floatingTimeline: {
        title: string;
        rows: [string, string, string];
      };
    };
    productFeel: {
      eyebrow: string;
      headline: string;
      body: string;
      card: {
        headline: string;
        body: string;
        footerMeta: string;
      };
    };
    threeWays: {
      eyebrow: string;
      headline: string;
      read: {
        title: string;
        body: string;
      };
      explore: {
        title: string;
        body: string;
      };
      connect: {
        title: string;
        body: string;
      };
    };
    timelineManifesto: {
      eyebrow: string;
      headline: string;
      headlineEmphasis: string;
      body: string;
      months: {
        march2026: string;
        february2026: string;
      };
      samples: {
        powerBottleneck: string;
        hbmPeak: string;
        euChipsAct: string;
        treasuryLiquidity: string;
      };
    };
    forReaders: {
      eyebrow: string;
      headline: string;
      lines: [string, string, string];
    };
    closing: {
      eyebrow: string;
      headline: string;
      headlineEmphasis: string;
      body: string;
      signInLink: string;
    };
    categories: {
      market: string;
      trend: string;
      issue: string;
      research: string;
    };
  };
  navigation: {
    en: string;
    kr: string;
    ja: string;
  };
  tooltip: {
    soon: string;
  };
  menu: {
    links: {
      product: {
        title: string;
        items: {
          howItWorks: string;
          samples: string;
          pricing: string;
        };
      };
      info: {
        title: string;
        items: {
          about: string;
          blog: string;
          sitemap: string;
        };
      };
      support: {
        title: string;
        items: {
          faq: string;
          contact: string;
          community: string;
        };
      };
      legal: {
        title: string;
        items: {
          privacyPolicy: string;
          termsOfService: string;
          commercialDisclosure: string;
          refundPolicy: string;
        };
      };
    };
  };
  contact: {
    title: string;
    description: string;
  };
  faq: {
    meta: {
      title: string;
      description: string;
    };
    hero: {
      badge: string;
      title: string;
      subtitle: string;
    };
    search: {
      label: string;
      placeholder: string;
    };
    resultsCount: string;
    empty: {
      title: string;
      description: string;
      clear: string;
    };
    categories: {
      intro: string;
      reports: string;
      account: string;
      support: string;
      roadmap: string;
    };
    cta: {
      title: string;
      description: string;
      button: string;
    };
    disclaimer: string;
  };
  dashboard: {
    meta: {
      title: string;
      description: string;
    };
    page: {
      eyebrow: string;
      title: string;
      subtitle: string;
      tradingDay: string;
      publishedAtLabel: string;
      statusLabel: string;
      draftNote: string;
      timezoneAbbr: string;
      datePicker: {
        triggerLabel: string;
        title: string;
        hint: string;
        latest: string;
      };
    };
  };
  itemReports: ItemReportsTranslation;
  weeklyAiIssueDigest: WeeklyAiIssueDigestTranslation;
  weeklyMarketIssues: WeeklyMarketIssuesTranslation;
  account: {
    meta: {
      title: string;
    };
    errors: {
      couldNotLoadProfile: string;
      couldNotLoadPlan: string;
      couldNotLoadSocialAccounts: string;
      errorCode: string;
      errorMessage: string;
    };
    profile: {
      title: string;
      description: string;
      avatar: string;
      avatarAlt: string;
      uploadAvatarAriaLabel: string;
      maxSize: string;
      allowedFormats: string;
      selectFile: string;
      noFileSelected: string;
      nameLabel: string;
      namePlaceholder: string;
      marketingConsent: string;
      defaultLocaleLabel: string;
      defaultLocaleDescription: string;
      saveProfile: string;
      profileUpdated: string;
    };
    email: {
      changeTitle: string;
      addTitle: string;
      changeDescription: string;
      addDescription: string;
      currentEmail: string;
      currentEmailHint: string;
      newEmail: string;
      emailLabel: string;
      emailPlaceholder: string;
      updateStarted: string;
    };
    password: {
      changeTitle: string;
      addTitle: string;
      changeDescription: string;
      addDescription: string;
      newPassword: string;
      confirmNewPassword: string;
      requirementsTitle: string;
      requirements: {
        minLength: string;
        upperLower: string;
        numbers: string;
      };
      passwordUpdated: string;
    };
    delete: {
      title: string;
      warning: string;
      confirmDelete: string;
      confirmIrreversible: string;
      deleteAccount: string;
    };
  };
  dashboardSidebar: {
    groups: {
      platform: string;
      series: string;
    };
    teamSwitcher: {
      modes: string;
      switchMode: string;
      defaultTeamName: string;
      basicPlan: string;
    };
    userMenu: {
      upgradeToPro: string;
      account: string;
      notifications: string;
      logOut: string;
    };
    soonBadge: string;
    nav: {
      dashboard: {
        title: string;
        marketBriefing: string;
        weeklyReport: string;
        monthlyReport: string;
      };
      reports: {
        title: string;
        library: string;
        explore: string;
        timeline: string;
      };
      insights: {
        title: string;
        marketMemory: string;
        entityExplore: string;
      };
      admin: {
        title: string;
        home: string;
        pipelines: string;
        agents: string;
        prompts: string;
        apiTests: string;
        similarityMeasurements: string;
        i18nManagement: string;
        userManagement: string;
      };
    };
    series: {
      weeklyAiIssueDigest: string;
      weeklyMarketIssues: string;
    };
  };
};
