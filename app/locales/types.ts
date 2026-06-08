export type Translation = {
  auth: {
    signIn: string;
  };
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
};
