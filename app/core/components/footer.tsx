/**
 * Newsletter System Footer Component
 *
 * A comprehensive footer for the NexLetter internal newsletter system.
 * This component provides navigation links, company information, social links,
 * and newsletter subscription functionality.
 *
 * Features:
 * - Modern Nex Design System footer
 * - Newsletter subscription form
 * - Social media links
 * - Comprehensive navigation
 * - Company branding and information
 * - Legal compliance links
 */
import { BrainCog, BrainCogIcon, BrainIcon, Mail, Megaphone, MegaphoneIcon, MemoryStickIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NexFooter } from "~/core/components/nex";
import { GitHubIcon, SlackIcon } from "~/core/components/nex/nex-icons";
import { Actions } from "./navigation-bar";

/**
 * Newsletter System Footer Component
 * 
 * A comprehensive footer using Nex Design System that provides:
 * - Company branding and information
 * - Navigation links for all major sections
 * - Social media and communication links
 * - Newsletter subscription functionality
 * - Legal compliance links
 * 
 * @returns A modern, comprehensive footer component
 */
export default function Footer() {
  const { t, i18n } = useTranslation();

  // Handle newsletter subscription
  const handleNewsletterSubscribe = async (email: string) => {
    // In a real application, this would make an API call
    console.log("Newsletter subscription for:", email);
    // You could integrate with your email service here
  };

  // Company information - language dependent
  const companyInfo = i18n.language === "ko"
    ? [
        "링크버스(LinkVerse) | 사업자번호 844-64-00886 | 통신판매업 제2026-부산수영-0064호 | 대표: 송진우",
        "부산 수영구 남천바다로21번길 69-5 | 문의: jinu30dev@gmail.com (010-6454-8896)"
      ]
    //: undefined;
    : [
        "LinkVerse | Representative: Jinu Song | Contact: jinu30dev@gmail.com (010-3841-8896)",
        "#804, Higashiobase Building, 5-16 Higashiobase 2-chome, Higashinari-ku, Osaka, Japan"
      ]

  // Build legal links - Commercial Disclosure only for non-Korean languages
  const legalItems = [
    { label: t("menu.links.legal.items.privacyPolicy"), href: "/legal/privacy-policy", disabled: false, tooltip: t("tooltip.soon") },
    { label: t("menu.links.legal.items.termsOfService"), href: "/legal/terms-of-service", disabled: false, tooltip: t("tooltip.soon") },
  ];

  // Add Commercial Disclosure link for non-Korean languages
  /*
  if (i18n.language == "ko") {
    legalItems.push({
      label: t("menu.links.legal.items.refundPolicy"),
      href: "/legal/refund-policy",
      disabled: true,
      tooltip: t("tooltip.soon"),
    });
  } else {
    legalItems.push({
      label: t("menu.links.legal.items.commercialDisclosure"),
      href: "/legal/commercial-disclosure",
      disabled: true,
      tooltip: t("tooltip.soon"),
    });
  }
  */

  // Footer navigation links organized by sections
  const footerLinks = [
    {
      title: t("menu.links.product.title"),
      items: [
        //{ label: t("menu.links.product.items.howItWorks"), href: "/how-it-works", disabled: true, tooltip: t("tooltip.soon") },
        { label: t("menu.links.product.items.samples"), href: "/samples", disabled: true, tooltip: t("tooltip.soon") },
        { label: t("menu.links.product.items.pricing"), href: "/pricing", disabled: true, tooltip: t("tooltip.soon") },
      ]
    },
    {
      title: t("menu.links.info.title"),
      items: [
        { label: t("menu.links.info.items.about"), href: "/about" , disabled: true, tooltip: t("tooltip.soon") },
        { label: t("menu.links.info.items.blog"), href: "https://linkverse.app/blog", external: true },
        //{ label: t("menu.links.info.items.sitemap"), href: "/site-map", disabled: true, tooltip: t("tooltip.soon") },
      ]
    },
    {
      title: t("menu.links.support.title"),
      items: [
        { label: t("menu.links.support.items.faq"), href: "/faq", disabled: true, tooltip: t("tooltip.soon") },
        { label: t("menu.links.support.items.contact"), href: "/contact" },
       // { label: t("menu.links.support.items.community"), href: "/forum", disabled: true, tooltip: t("tooltip.soon") },
      ]
    },
    {
      title: t("menu.links.legal.title"),
      items: legalItems
    }
  ];

  // Social and communication links
  const socialLinks = [
    {
      platform: "github" as const,
      href: "https://github.com/Jinu-hub",
      label: "GitHub",
      icon: <GitHubIcon className="h-5 w-5" />
    },
    {
      platform: "custom" as const,
      href: "https://company.slack.com",
      label: "Slack",
      icon: <SlackIcon className="h-5 w-5" />
    },
    {
      platform: "email" as const,
      href: "mailto:jinu30dev@gmail.com",
      label: "Email",
      icon: <Mail className="h-5 w-5" />
    },
    /*
    {
      platform: "custom" as const,
      href: "/feedback",
      label: "피드백",
      icon: <MessageSquare className="h-5 w-5" />
    }
    */
  ];

  return (
    <NexFooter
      variant="default"
      brand={{
        name: "Market Memory",
        description: t("footer.brand.description"),
        logo: <img src="/favicon.ico" alt="Market Memory" width={32} height={32} />
      }}
      links={footerLinks}
      social={socialLinks}
      legal={{
        copyright: "© 2026 LinkVerse. All rights reserved.\nMarket Memory is a service operated by LinkVerse.",
        companyInfo: companyInfo,
      }}
      actions={<Actions />}
      /*
      newsletter={{
        title: "뉴스레터 구독",
        description: "매주 팀의 활동과 성과를 담은 뉴스레터를 받아보세요",
        placeholder: "이메일 주소를 입력하세요",
        buttonText: "구독하기",
        onSubmit: handleNewsletterSubscribe
      }}
        */
    />
  );
}