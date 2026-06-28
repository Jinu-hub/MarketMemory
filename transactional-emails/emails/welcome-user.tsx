import {
    Button,
    Column,
    Head,
    Html,
    Preview,
    Row,
    Section,
    Text,
  } from "@react-email/components";
  
  type Locale = "en" | "ja" | "ko";
  
  interface WelcomeUserProps {
    username?: string;
    locale?: Locale;
  }
  
  // 言語ごとのテキストを定義
  export type WelcomeMessage = {
    preview: (username: string) => string;
    heading: (username: string) => string;
    greeting: (username: string) => string;
    experience: string;
    quote: string;
    introduction: string;
    description: string;
    button: string;
    footer: string;
  };
  
  // welcome email messages
    export const welcomeMessages: Record<Locale, WelcomeMessage> = {
    ko: {
        preview: (username) =>
        `${username}님, Market Memory에 오신 것을 환영합니다.`,
        heading: (username) =>
        `🎉 ${username}님, Market Memory에 오신 것을 환영합니다.`,
        greeting: (username) =>
        `안녕하세요 ${username}님 😊 Market Memory에 함께하게 되어 정말 반갑습니다.`,
        experience:
        "시장을 따라가다 보면, 이런 생각이 자연스럽게 떠오를 때가 있습니다.",
        quote:
        "“오늘 많은 뉴스가 있었는데, 결국 무엇이 중요했지?”<br />" +
        "“이 이슈가 시장 전체 흐름에서는 어떤 의미였더라?”<br />" +
        "“단편적인 기사보다, 맥락까지 함께 보고 싶다.”",
        introduction:
        "Market Memory는 그런 순간을 위해 만들어졌습니다.<br />" +
        "매일의 글로벌 리서치를 읽고, 중요한 흐름을 정리하고,<br />" +
        "다시 펼쳐볼 수 있는 형태로 차곡차곡 쌓아 두는 공간입니다.",
        description:
        "하나의 뉴스로 끝나지 않고, 시장의 흐름과 맥락까지 함께 볼 수 있도록.<br />" +
        "읽고, 탐색하고, 연결하는 방식으로 시장을 더 차분하게 바라볼 수 있게 돕습니다.<br />" +
        "Market Memory에서 오늘의 시장을 천천히 만나보세요.",
        button:
        "👉 Market Memory 둘러보기",
        footer:
        "함께해 주셔서 감사합니다.<br />– Market Memory 드림",
    },

    en: {
        preview: (username) =>
        `Welcome to Market Memory, ${username}.`,
        heading: (username) =>
        `🎉 Welcome to Market Memory, ${username}.`,
        greeting: (username) =>
        `Hello ${username} 😊 We’re so glad to welcome you to Market Memory.`,
        experience:
        "When following the markets, thoughts like these often come up naturally.",
        quote:
        "“There was a lot of news today, but what really mattered?”<br />" +
        "“What does this story mean in the broader market context?”<br />" +
        "“I want more than scattered headlines. I want the context behind them.”",
        introduction:
        "Market Memory was created for moments like these.<br />" +
        "It reads daily global market research, organizes the important flow,<br />" +
        "and keeps it in a form you can return to anytime.",
        description:
        "So that the market does not end as a single headline, but opens into context and continuity.<br />" +
        "Read, explore, and connect the signals that shape the bigger picture.<br />" +
        "We hope Market Memory becomes a calm place to revisit today’s market.",
        button:
        "👉 Explore Market Memory",
        footer:
        "Thank you for being with us.<br />– Market Memory",
    },

    ja: {
        preview: (username) =>
        `${username}さん、Market Memoryへようこそ。`,
        heading: (username) =>
        `🎉 ${username}さん、Market Memoryへようこそ。`,
        greeting: (username) =>
        `こんにちは、${username}さん 😊 Market Memoryにお迎えできてとてもうれしいです。`,
        experience:
        "市場を追っていると、こんなことを自然と感じる瞬間があります。",
        quote:
        "「今日はたくさんニュースがあったけれど、結局何が重要だったのか」<br />" +
        "「この出来事は、市場全体の流れの中でどんな意味を持つのか」<br />" +
        "「単発の見出しだけでなく、文脈まで一緒に見たい」",
        introduction:
        "Market Memoryは、そんな瞬間のために生まれました。<br />" +
        "日々のグローバル市場リサーチを読み、大切な流れを整理し、<br />" +
        "あとから何度でも開ける形で積み重ねていく場所です。",
        description:
        "ひとつのニュースで終わるのではなく、市場の流れや文脈まで一緒に見られるように。<br />" +
        "読む、探す、つなげるという体験を通じて、市場をもう少し落ち着いて見渡せるようにします。<br />" +
        "Market Memoryで、今日の市場をゆっくり確かめてみてください。",
        button:
        "👉 Market Memoryを見る",
        footer:
        "ご利用いただきありがとうございます。<br />– Market Memory",
    },
    };

  
  export default function WelcomeUser({ 
    username = "user", 
    locale = "ko" 
  }: WelcomeUserProps) {
    const t = welcomeMessages[locale];
    
    return (
      <Html style={{ colorScheme: "light" }}>
        <Head />
        <Preview>{t.preview(username)}</Preview>
    
        <Section style={styles.wrapper}>
          <Row>
            <Column>
              <Text style={styles.heading}>
                {t.heading(username)}
              </Text>
    
              <Text style={styles.text} dangerouslySetInnerHTML={{ __html: t.greeting(username) }} />
    
              <Text style={styles.text}>
                {t.experience}
              </Text>
    
              <Text style={styles.quote} dangerouslySetInnerHTML={{ __html: t.quote }} />
    
              <Text style={styles.text} dangerouslySetInnerHTML={{ __html: t.introduction }} />
    
              <Text style={styles.text} dangerouslySetInnerHTML={{ __html: t.description }} />
    
              <Button
                href="https://nexletter.app/"
                style={styles.button}
              >
                {t.button}
              </Button>
    
              <Text style={styles.footer} dangerouslySetInnerHTML={{ __html: t.footer }} />
            </Column>
          </Row>
        </Section>
      </Html>
    );
  }
    
    const styles = {
      wrapper: {
        backgroundColor: "#f8fafc", // 더 밝은 배경
        padding: "40px 24px",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(60, 80, 180, 0.08)",
        maxWidth: "480px",
        margin: "40px auto",
        border: "1px solid #e5e7eb",
      },
      heading: {
        fontSize: "22px",
        fontWeight: "bold" as const,
        marginBottom: "24px",
        color: "#2563eb", // 포인트 컬러
        letterSpacing: "-0.5px",
        textAlign: "center" as const,
      },
      text: {
        fontSize: "15px",
        lineHeight: "1.7",
        color: "#22223b",
        marginBottom: "18px",
        textAlign: "left" as const,
      },
      quote: {
          fontSize: "15px",
          lineHeight: "1.7",
          color: "#1e293b", // text-slate-800
          fontStyle: "italic",
          backgroundColor: "#f1f5f9", // slate-100
          padding: "16px 18px",
          borderLeft: "4px solid #3b82f6",
          borderRadius: "8px",
          marginBottom: "18px",
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.06)",
        },
      button: {
        display: "inline-block",
        padding: "14px 32px",
        background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)",
        color: "#fff",
        borderRadius: "8px",
        fontWeight: "bold" as const,
        fontSize: "15px",
        textDecoration: "none",
        marginTop: "28px",
        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.10)",
        border: "none",
        transition: "background 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      },
      footer: {
        fontSize: "13px",
        color: "#64748b",
        marginTop: "44px",
        textAlign: "center" as const,
        letterSpacing: "0.1px",
      },
    };
    