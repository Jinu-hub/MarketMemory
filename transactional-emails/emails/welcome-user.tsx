import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
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
  eyebrow: string;
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
    eyebrow: "환영합니다",
    heading: (username) => `${username}님, Market Memory에 오신 것을 환영합니다.`,
    greeting: (username) =>
      `안녕하세요 ${username}님. Market Memory에 함께하게 되어 정말 반갑습니다.`,
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
    button: "Market Memory 둘러보기",
    footer: "함께해 주셔서 감사합니다.<br />– Market Memory 드림",
  },

  en: {
    preview: (username) => `Welcome to Market Memory, ${username}.`,
    eyebrow: "WELCOME",
    heading: (username) => `Welcome to Market Memory, ${username}.`,
    greeting: (username) =>
      `Hello ${username}. We’re so glad to welcome you to Market Memory.`,
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
    button: "Explore Market Memory",
    footer: "Thank you for being with us.<br />– Market Memory",
  },

  ja: {
    preview: (username) => `${username}さん、Market Memoryへようこそ。`,
    eyebrow: "ようこそ",
    heading: (username) => `${username}さん、Market Memoryへようこそ。`,
    greeting: (username) =>
      `こんにちは、${username}さん。Market Memoryにお迎えできてとてもうれしいです。`,
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
    button: "Market Memoryを見る",
    footer: "ご利用いただきありがとうございます。<br />– Market Memory",
  },
};

export default function WelcomeUser({
  username = "user",
  locale = "ko",
}: WelcomeUserProps) {
  const t = welcomeMessages[locale];

  return (
    <Html style={{ colorScheme: "light" }}>
      <Head />
      <Preview>{t.preview(username)}</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Brand wordmark */}
          <Section style={styles.brandSection}>
            <Text style={styles.brandMark}>MARKET MEMORY</Text>
          </Section>

          <Section style={styles.contentSection}>
            <Text style={styles.eyebrow}>{t.eyebrow}</Text>

            <Text style={styles.heading}>{t.heading(username)}</Text>

            <Text
              style={styles.lead}
              dangerouslySetInnerHTML={{ __html: t.greeting(username) }}
            />

            <Hr style={styles.divider} />

            <Text style={styles.text}>{t.experience}</Text>

            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              width="100%"
              style={styles.quoteTable}
            >
              <tbody>
                <tr>
                  <td style={styles.quoteAccent} />
                  <td style={styles.quoteBody}>
                    <Text
                      style={styles.quoteText}
                      dangerouslySetInnerHTML={{ __html: t.quote }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <Text
              style={styles.text}
              dangerouslySetInnerHTML={{ __html: t.introduction }}
            />

            <Text
              style={styles.text}
              dangerouslySetInnerHTML={{ __html: t.description }}
            />

            <Section style={styles.buttonWrapper}>
              <Button href="https://marketmemory.app/" style={styles.button}>
                {t.button}
              </Button>
            </Section>
          </Section>

          <Hr style={styles.footerDivider} />

          <Section style={styles.footerSection}>
            <Text
              style={styles.footer}
              dangerouslySetInnerHTML={{ __html: t.footer }}
            />
            <Text style={styles.footerMeta}>
              © {new Date().getFullYear()} Market Memory
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const FONT_STACK =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF_STACK = "Georgia, 'Times New Roman', serif";
const ACCENT = "#4f46e5";
const INK = "#1c1917";
const MUTED = "#78716c";

const styles = {
  body: {
    backgroundColor: "#f5f5f4",
    margin: 0,
    padding: "40px 16px",
    fontFamily: FONT_STACK,
  },
  container: {
    maxWidth: "520px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #ececea",
    overflow: "hidden" as const,
    boxShadow: "0 1px 2px rgba(28, 25, 23, 0.04)",
  },
  brandSection: {
    padding: "28px 40px 0",
  },
  brandMark: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700 as const,
    letterSpacing: "2.5px",
    color: ACCENT,
    textTransform: "uppercase" as const,
  },
  contentSection: {
    padding: "20px 40px 8px",
  },
  eyebrow: {
    margin: "0 0 10px",
    fontSize: "11px",
    fontWeight: 600 as const,
    letterSpacing: "1.5px",
    color: MUTED,
    textTransform: "uppercase" as const,
  },
  heading: {
    margin: "0 0 20px",
    fontSize: "24px",
    lineHeight: "1.35",
    fontWeight: 700 as const,
    letterSpacing: "-0.5px",
    color: INK,
  },
  lead: {
    margin: "0 0 8px",
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#44403c",
  },
  divider: {
    borderColor: "#ececea",
    borderWidth: "1px 0 0",
    margin: "24px 0",
  },
  text: {
    margin: "0 0 18px",
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#44403c",
  },
  quoteTable: {
    margin: "0 0 22px",
    borderRadius: "10px",
    overflow: "hidden" as const,
    backgroundColor: "#fafaf9",
    border: "1px solid #f0efed",
  },
  quoteAccent: {
    width: "3px",
    backgroundColor: ACCENT,
    padding: 0,
  },
  quoteBody: {
    padding: "16px 20px",
  },
  quoteText: {
    margin: 0,
    fontFamily: SERIF_STACK,
    fontSize: "15px",
    lineHeight: "1.9",
    fontStyle: "italic" as const,
    color: "#3f3f46",
  },
  buttonWrapper: {
    margin: "8px 0 4px",
  },
  button: {
    display: "inline-block",
    padding: "13px 28px",
    backgroundColor: ACCENT,
    color: "#ffffff",
    borderRadius: "10px",
    fontWeight: 600 as const,
    fontSize: "15px",
    letterSpacing: "-0.2px",
    textDecoration: "none",
  },
  footerDivider: {
    borderColor: "#ececea",
    borderWidth: "1px 0 0",
    margin: "8px 0 0",
  },
  footerSection: {
    padding: "24px 40px 30px",
  },
  footer: {
    margin: "0 0 8px",
    fontSize: "13px",
    lineHeight: "1.7",
    color: MUTED,
  },
  footerMeta: {
    margin: 0,
    fontSize: "12px",
    color: "#a8a29e",
    letterSpacing: "0.2px",
  },
};

WelcomeUser.PreviewProps = {
  username: "user",
  locale: "ko",
} satisfies WelcomeUserProps;
