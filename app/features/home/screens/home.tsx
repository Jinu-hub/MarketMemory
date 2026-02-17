/**
 * Newsletter System Home Page Component
 * 
 * This file implements the main landing page for an internal newsletter system
 * designed for software development companies. The system integrates with Slack, 
 * GitHub, and other development tools to automatically generate weekly newsletters.
 * 
 * Key features:
 * - Modern newsletter system showcase
 * - Integration highlights (Slack, GitHub, etc.)
 * - Newsletter preview and samples
 * - Company-focused design for internal tools
 */

import type { Route } from "./+types/home";

import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { 
  MessageCircle, 
  GitBranch, 
  Mail, 
  Calendar,
  TrendingUp,
  Users,
  Bot,
  FileText,
  Clock,
  CheckCircle,
  Zap,
  Globe
} from "lucide-react";

import i18next from "~/core/lib/i18next.server";
import { 
  NexButton, 
  NexCard,
  NexCardHeader,
  NexCardTitle,
  NexCardDescription,
  NexCardContent,
  NexHero,
  NexBadge,
  NexImageCard,
  NexProgress,
  NexCarousel,
  NexCarouselItem
} from "~/core/components/nex";

/**
 * Meta function for setting page metadata
 * 
 * This function generates SEO-friendly metadata for the home page using data from the loader.
 * It sets:
 * - Page title from translated "home.title" key
 * - Meta description from translated "home.subtitle" key
 * 
 * The metadata is language-specific based on the user's locale preference.
 * 
 * @param data - Data returned from the loader function containing translated title and subtitle
 * @returns Array of metadata objects for the page
 */
export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
  ];
};

/**
 * Loader function for server-side data fetching
 * 
 * This function loads data for the newsletter system homepage including
 * sample statistics, recent activity, and integration status.
 * 
 * @param request - The incoming HTTP request
 * @returns Object with page data and translations
 */
export async function loader({ request }: Route.LoaderArgs) {
  // Get a translation function for the user's locale from the request
  const t = await i18next.getFixedT(request);
  
  // Mock data for newsletter system - in real app this would come from your API
  const stats = {
    totalNewsletters: 52,
    slackMessages: 1247,
    githubCommits: 156,
    teamMembers: 24
  };
  
  // Return translated strings and stats for use in both the component and meta function
  return {
    title: "Nexletter - 사내 뉴스레터 시스템",
    subtitle: "Slack과 GitHub을 통합한 자동화된 주간 뉴스레터",
    stats
  };
}

/**
 * Newsletter System Home Page Component
 * 
 * Main landing page for the internal newsletter system showcasing:
 * - Hero section with key features
 * - Integration highlights (Slack, GitHub, etc.)
 * - Statistics and metrics
 * - Sample newsletter preview
 * - Team collaboration features
 * 
 * @returns JSX element representing the newsletter system homepage
 */
export default function Home({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { stats } = loaderData;

  const sendMessageToApp = () => {
    if (window.Toaster) {
      window.Toaster.postMessage("안녕 플러터! 나 리믹스야.");
    } else {
      alert("지금은 웹 브라우저에서 보고 계시네요!");
    }
  };

  // Sample integrations data
  const integrations = [
    {
      name: "Slack",
      icon: MessageCircle,
      description: "팀 대화와 중요한 논의사항을 자동으로 수집합니다",
      status: "active",
      color: "success"
    },
    {
      name: "GitHub",
      icon: GitBranch,
      description: "커밋, PR, 이슈를 주간 활동으로 정리합니다",
      status: "active", 
      color: "primary"
    },
    {
      name: "Jira",
      icon: CheckCircle,
      description: "프로젝트 진행상황과 완료된 작업을 추적합니다",
      status: "coming-soon",
      color: "warning"
    },
    {
      name: "Figma",
      icon: FileText,
      description: "디자인 업데이트와 새로운 프로토타입을 포함합니다",
      status: "coming-soon",
      color: "secondary"
    }
  ];

  // Sample recent activities
  const recentActivities = [
    { type: "slack", content: "💡 #engineering에서 새로운 아키텍처 논의", time: "2시간 전" },
    { type: "github", content: "🚀 user-auth 브랜치에 15개 커밋 추가", time: "3시간 전" },
    { type: "slack", content: "🎉 #general에서 제품 출시 축하", time: "5시간 전" },
    { type: "github", content: "🐛 결제 시스템 버그 수정 완료", time: "1일 전" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <NexHero
        variant="split"
        title="Nexletter"
        subtitle="개발팀을 위한 스마트한 주간 뉴스레터"
        description="Slack 대화, GitHub 활동, 프로젝트 진행상황을 자동으로 분석하여 팀의 한 주를 정리한 뉴스레터를 생성합니다. 더 이상 수동으로 주간 보고서를 작성할 필요가 없습니다."
        actions={{
          primary: { 
            label: "뉴스레터 구독하기", 
            variant: "primary",
            href: "/subscribe"
          },
          secondary: { 
            label: "샘플 뉴스레터 보기", 
            variant: "secondary",
            href: "/samples"
          }
        }}
        media={{ 
          type: "image", 
          src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&crop=center"
        }}
      />

      {/* Flutter 앱 연동 테스트 (WebView 내에서만 Toaster 채널 사용 가능) */}
      <div className="flex justify-center">
        <NexButton variant="ghost" size="sm" onClick={sendMessageToApp}>
          앱으로 메시지 보내기
        </NexButton>
      </div>

      {/* Statistics Section */}
      {/*
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NexCard variant="elevated" className="text-center">
          <NexCardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{stats.totalNewsletters}</div>
            <p className="text-sm text-muted-foreground">발송된 뉴스레터</p>
          </NexCardContent>
        </NexCard>
        
        <NexCard variant="elevated" className="text-center">
          <NexCardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{stats.slackMessages.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">분석된 Slack 메시지</p>
          </NexCardContent>
        </NexCard>
        
        <NexCard variant="elevated" className="text-center">
          <NexCardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{stats.githubCommits}</div>
            <p className="text-sm text-muted-foreground">이번 주 커밋</p>
          </NexCardContent>
        </NexCard>
        
        <NexCard variant="elevated" className="text-center">
          <NexCardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{stats.teamMembers}</div>
            <p className="text-sm text-muted-foreground">팀 멤버</p>
          </NexCardContent>
        </NexCard>
      </section>
      */}

      {/* Integrations Section */}
      {/*
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">강력한 통합 기능</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            이미 사용하고 있는 도구들과 seamless하게 연결되어 팀의 활동을 자동으로 수집하고 정리합니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <NexCard key={index} variant="outlined" hoverable>
                <NexCardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                        <NexBadge 
                          variant={integration.status === "active" ? "success" : "warning"}
                          size="sm"
                        >
                          {integration.status === "active" ? "연결됨" : "곧 출시"}
                        </NexBadge>
                      </div>
                      <p className="text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                </NexCardContent>
              </NexCard>
            );
          })}
        </div>
      </section>
      */}
      

      {/* CTA Section */}
      <section className="text-center py-16">
        <NexCard variant="gradient" className="p-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                팀의 생산성을 한 단계 높여보세요
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                매주 자동으로 생성되는 뉴스레터로 팀의 성과를 투명하게 공유하고, 
                놓친 중요한 정보들을 손쉽게 파악할 수 있습니다.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NexButton variant="secondary" size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                데모 예약하기
              </NexButton>
              <NexButton variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
                <Mail className="h-5 w-5 mr-2" />
                무료로 시작하기
              </NexButton>
            </div>
          </div>
        </NexCard>
      </section>
    </div>
  );
}
