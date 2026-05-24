export type Translation = {
  home: {
    title: string;
    subtitle: string;
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
  footer: {
    brand: {
      name: string;
      description: string;
    };
  };
};
