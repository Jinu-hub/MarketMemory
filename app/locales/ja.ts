import type { Translation } from "./types";
import authPages from "./auth/ja";
import itemReports from "./item-reports/ja";
import weeklyAiIssueDigest from "./weekly-ai-issue-digest/ja";
import weeklyMarketIssues from "./weekly-market-issues/ja";

const ja: Translation = {
  common: {
    actions: {
      back: "戻る",
      submit: "送信",
      scrollToTop: "トップへ戻る",
    },
    labels: {
      email: "メールアドレス",
      password: "パスワード",
      name: "名前",
      confirmPassword: "パスワード（確認）",
    },
    links: {
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      and: "および",
    },
  },
  ...authPages,
  brand: {
    name: "Market Memory",
    tagline: "散らばった市場の流れを、\n一つの視点から。",
  },
  home: {
    title: "Market Memory",
    meta: {
      description:
        "毎日のグローバルリサーチを読み、テーマ別に探索し、流れとしてつなげて見られるリサーチライブラリです。",
    },
    getStarted: "はじめる",
    goToLink: "見に行く",
    continueReading: "続きを読む",
    reportCount: "{{count}}本",
    hero: {
      badge: "市場 · インサイト · リサーチライブラリ",
      tagline: "ニュースを超えて、市場の文脈とつながりを整理します。",
      description:
        "毎日のグローバルリサーチを読み、テーマ別に探索し、流れとしてつなげて見られるリサーチライブラリ",
      viewSamples: "サンプルを見る",
      features: {
        editedResearch: "編集されたリサーチ",
        exploreByTopic: "テーマ別探索",
        connectFlows: "つながる物語",
      },
      social: {
        badge: "Private Preview · 2026",
        text: "初期バージョンを限定公開しています。",
      },
    },
    preview: {
      reportAriaLabel: "レポートプレビュー",
      issueLabel: "Issue 042 · Market Memory",
      editorialAngle: "Editorial Angle",
      trend: "トレンド",
      headline: "AIインフラ投資が半導体バリューチェーンを書き換えている。",
      keyTakeaway: "Key Takeaway",
      takeawayBody:
        "2026年のハイパースケーラーCapExは320Bに達し、先端パッケージングとHBMの構造的ボトルネックをさらに深めています。",
      hooks: "Hooks",
      hooksList: [
        "CapExは加速中で、減速の兆候はまだ見えない。",
        "CoWoS供給は依然として最も強い制約条件のままだ。",
        "電力と地域分散が次の投資サイクルの軸になる。",
      ],
      quote:
        "より速い半導体ではなく、より多くの電力がボトルネックになる時代へ移行している。",
      data: {
        capex: {
          label: "CapEx 2026e",
          delta: "+23%",
          caption: "vs 2024",
        },
        hbm: {
          label: "HBM Supply",
          delta: "tight",
          caption: "配分 / 需要",
        },
        power: {
          label: "電力負荷",
          delta: "↑",
          caption: "DC電力 2024→26",
        },
      },
      floatingChip: {
        title: "関連インサイト",
        headline: "半導体CapExサイクル、拡大局面が継続",
        period: "30日 · 時価総額加重",
        tickers: "MSFT · GOOG · META",
      },
      floatingGraph: {
        title: "接続されたテーマ",
        ariaLabel: "関連テーマの関係図",
        nodes: {
          power: "電力",
          semi: "半導体",
          dc: "データセンター",
        },
      },
      floatingTimeline: {
        title: "最近の年代記",
        rows: [
          "AIインフラ投資の再編",
          "HBM価格サイクル、ピーク",
          "EU Chips Act 第2段階",
        ],
      },
    },
    productFeel: {
      eyebrow: "読む体験",
      headline: "一つのレポートを\n読むということ。",
      body: "すべてのレポートは、核心アングル、要約、共有用の引用まで編集構造で整えられます。リサーチには解釈が添えられ、レポートはいつでも再び開ける資料として残ります。",
      card: {
        headline: "米国10年債利回りと流動性。",
        body: "財務省の現金残高の変動と長期金利の方向、そしてその両者の非線形関係についての短いリサーチノート。",
        footerMeta: "リサーチノート · 2026. 02. 12",
      },
    },
    threeWays: {
      eyebrow: "使い方",
      headline: "三つの姿勢で読めます。",
      read: {
        title: "読む",
        body: "一日の市場を要約とインサイト中心に、落ち着いて読み進めます。",
      },
      explore: {
        title: "探索する",
        body: "カテゴリと地域、タグに沿って関心のある流れを広げていきます。",
      },
      connect: {
        title: "つなぐ",
        body: "レポート間の文脈をタイムラインと関連コンテンツでつないで見ます。",
      },
    },
    timelineManifesto: {
      eyebrow: "流れを見るということ",
      headline: "一つのニュースではなく、",
      headlineEmphasis: "市場の筋を読みます。",
      body: "個別のレポートは積み重なり、市場の物語になります。\n月別タイムラインとカテゴリラインで、その流れを再び広げて見ます。",
      months: {
        march2026: "2026年3月",
        february2026: "2026年2月",
      },
      samples: {
        powerBottleneck: "電力インフラがAIサプライチェーンの次のボトルネックに",
        hbmPeak: "HBM価格サイクル、ピーク後のシナリオ",
        euChipsAct: "EU Chips Act 第2段階の資金承認が意味すること",
        treasuryLiquidity: "米国10年債と流動性、リサーチノート",
      },
    },
    forReaders: {
      eyebrow: "こんな方のために",
      headline: "こんな方に向いています。",
      lines: [
        "一日一篇のリサーチを着実に読むリズムを作りたい方",
        "数字とチャートにとどまらず、解釈と文脈まで見たい方",
        "読んだ内容を流し去らず、再び見つけられる場所に置きたい方",
      ],
    },
    closing: {
      eyebrow: "はじめる",
      headline: "今日の市場を、",
      headlineEmphasis: "一つの流れとして読んでみてください。",
      body: "先行する読者の方へ、静かに開いているリサーチライブラリです。",
      signInLink: "ログイン →",
    },
    categories: {
      market: "市場",
      trend: "トレンド",
      issue: "イシュー",
      research: "リサーチ",
    },
  },
  navigation: {
    en: "英語",
    kr: "韓国語",
    ja: "日本語",
  },
  tooltip: {
    soon: "近日公開",
  },
  menu: {
    links: {
      product: {
        title: "製品",
        items: {
          howItWorks: "使い方",
          samples: "サンプル",
          pricing: "価格",
        },
      },
      info: {
        title: "情報",
        items: {
          about: "紹介",
          blog: "ブログ",
          sitemap: "サイトマップ",
        },
      },
      support: {
        title: "サポート",
        items: {
          faq: "FAQ",
          contact: "お問い合わせ",
          community: "コミュニティ",
        },
      },
      legal: {
        title: "法的通知",
        items: {
          privacyPolicy: "プライバシーポリシー",
          termsOfService: "利用規約",
          commercialDisclosure: "特定商取引法に基づく表記",
          refundPolicy: "返金ポリシー",
        },
      },
    },
  },
  contact: {
    title: "お問い合わせ",
    description:
      "ご不明な点やご提案がございましたら、お気軽にお問い合わせください。迅速にご返答いたします。",
  },
  faq: {
    meta: {
      title: "よくある質問",
      description:
        "Market Memoryのサービス、レポート、アカウント、料金に関するよくある質問をまとめました。",
    },
    hero: {
      badge: "ヘルプ · FAQ",
      title: "よくある質問",
      subtitle:
        "Market Memoryを初めてご利用ですか？サービス・レポート・アカウントについて特に多い質問をまとめました。",
    },
    search: {
      label: "FAQを検索",
      placeholder: "知りたい内容を検索",
    },
    resultsCount: "質問 {{count}}件",
    empty: {
      title: "検索結果がありません",
      description: "別のキーワードで検索するか、すべての質問をご覧ください。",
      clear: "検索をクリア",
    },
    categories: {
      intro: "サービス紹介",
      reports: "コンテンツ · レポート",
      account: "アカウント · 料金",
      support: "フィードバック · サポート",
      roadmap: "ロードマップ",
    },
    cta: {
      title: "お探しの答えが見つかりませんでしたか？",
      description:
        "ご質問やフィードバックがあればいつでもお知らせください。ご意見はサービス改善の大きな助けになります。",
      button: "お問い合わせ",
    },
    disclaimer:
      "Market Memoryは情報提供を目的としており、投資助言や推奨を行うものではありません。最終的な投資判断はご自身の責任で行ってください。",
  },
  dashboard: {
    meta: {
      title: "ダッシュボード",
      description:
        "MARKET DATE基準の市場ブリーフィング、スナップショット、最新レポートを一画面で確認できます。",
    },
    page: {
      eyebrow: "Dashboard",
      title: "最新の市場ブリーフィング",
      subtitle:
        "MARKET DATEごとに整理した市場メモリ。要約・テーマ・ムードとスナップショットを一画面で見られます。",
      tradingDay: "MARKET DATE",
      publishedAtLabel: "配信",
      statusLabel: "状態",
      draftNote: "処理中",
      timezoneAbbr: "JST",
      datePicker: {
        triggerLabel: "別の日付の市場メモリを見る",
        title: "日付を選択",
        hint: "記録があるMARKET DATEのみ選択できます。",
        latest: "最新へ",
      },
    },
  },
  publicDashboard: {
    loginNotice: "レポート詳細ページの閲覧はログイン後にご利用いただけます。",
    headerLoginNotice:
      "本日の公開ダッシュボードです。\n毎取引日、最新の市場メモリが自動更新されます。\n全機能はログイン後に利用できます。",
    previewNotice:
      "これはプレビューです。レポートライブラリ全体はログイン後にご利用いただけます。",
    previewReportsNote:
      "ゲストは最新レポート2件のみ詳細を閲覧できます。ライブラリ全体はログイン後にご利用いただけます。",
    backToDashboard: "ダッシュボードに戻る",
    floatingJoinCta: "Market Memoryを始める",
    roadmap: {
      eyebrow: "Roadmap",
      title: "広がり続けるマーケットメモリ",
      description:
        "機能拡張は続きます。過去の流れ、テーマ、パーソナライズまで、準備が整い次第、順次公開する予定です。",
      badge: "Building",
      footer:
        "Market Memoryは、毎取引日のデータだけでなく、機能もともに成長します。",
      items: {
        archive: "過去の市場フローのアーカイブ",
        themes: "テーマ別レポート集",
        digests: "週次・月次の市場サマリー",
        personalization: "関心テーマに基づくパーソナライズ",
        alerts: "メールまたは通知レポート",
        i18nQuality: "多言語レポート品質の向上",
        searchFilters: "より精緻な検索・フィルタ機能",
        memoryRecall: "類似する市場局面の回想",
      },
    },
  },
  itemReports,
  weeklyAiIssueDigest,
  weeklyMarketIssues,
  account: {
    meta: {
      title: "アカウント",
    },
    errors: {
      couldNotLoadProfile: "プロフィールを読み込めませんでした",
      couldNotLoadPlan: "プラン情報を読み込めませんでした",
      couldNotLoadSocialAccounts: "ソーシャルアカウントを読み込めませんでした",
      errorCode: "コード: {{code}}",
      errorMessage: "メッセージ: {{message}}",
    },
    profile: {
      title: "プロフィール編集",
      description: "プロフィール情報を管理します。",
      avatar: "アバター",
      avatarAlt: "アバター",
      uploadAvatarAriaLabel: "アバターをアップロード",
      maxSize: "最大サイズ: 1MB",
      allowedFormats: "対応形式: PNG, JPG, GIF",
      selectFile: "ファイルを選択",
      noFileSelected: "ファイルが選択されていません",
      nameLabel: "名前",
      namePlaceholder: "Nico",
      marketingConsent: "マーケティングメールの受信に同意する",
      defaultLocaleLabel: "デフォルト言語",
      defaultLocaleDescription:
        "ログイン時に適用されます。メール通知の言語にも使用されます。",
      saveProfile: "プロフィールを保存",
      profileUpdated: "プロフィールを更新しました",
    },
    email: {
      changeTitle: "メールアドレスを変更",
      addTitle: "メールアドレスを追加",
      changeDescription: "メールアドレスを変更します。",
      addDescription: "アカウントにメールアドレスを追加します。",
      currentEmail: "現在のメールアドレス",
      currentEmailHint: "この項目は編集できません",
      newEmail: "新しいメールアドレス",
      emailLabel: "メールアドレス",
      emailPlaceholder: "new-email@example.com",
      updateStarted:
        "メールアドレス変更の手続きを開始しました。以前のメールアドレスで認証リンクをご確認ください。",
    },
    password: {
      changeTitle: "パスワードを変更",
      addTitle: "パスワードを追加",
      changeDescription: "パスワードを変更します。",
      addDescription: "アカウントにパスワードを追加します。",
      newPassword: "新しいパスワード",
      confirmNewPassword: "新しいパスワード（確認）",
      requirementsTitle: "パスワードの要件",
      requirements: {
        minLength: "12文字以上",
        upperLower: "大文字と小文字を含む",
        numbers: "数字を含む",
      },
      passwordUpdated: "パスワードを更新しました",
    },
    delete: {
      title: "危険ゾーン",
      warning:
        "この操作は取り消せません。アカウントを削除すると、すべてのデータが永久に削除されます。",
      confirmDelete: "アカウントを削除することを確認します。",
      confirmIrreversible: "この操作が取り消せないことを理解しています。",
      deleteAccount: "アカウントを削除",
    },
  },
  dashboardSidebar: {
    groups: {
      platform: "プラットフォーム",
      series: "シリーズ",
    },
    teamSwitcher: {
      modes: "モード",
      switchMode: "モード切替",
      defaultTeamName: "Default",
      basicPlan: "Basic mode",
    },
    userMenu: {
      upgradeToPro: "Proにアップグレード",
      account: "アカウント",
      notifications: "通知",
      logOut: "ログアウト",
    },
    soonBadge: "Soon",
    nav: {
      dashboard: {
        title: "ダッシュボード",
        marketBriefing: "市場ブリーフィング",
        weeklyReport: "週間レポート",
        monthlyReport: "月間レポート",
      },
      reports: {
        title: "レポート",
        library: "レポートライブラリ",
        explore: "探索",
        timeline: "タイムライン",
      },
      insights: {
        title: "インサイト",
        marketMemory: "市場メモリ",
        entityExplore: "エンティティ探索",
      },
      admin: {
        title: "Admin",
        home: "管理者ホーム",
        pipelines: "パイプライン",
        agents: "エージェント",
        prompts: "プロンプト",
        apiTests: "APIテスト",
        similarityMeasurements: "類似度測定",
        i18nManagement: "多言語管理",
        userManagement: "ユーザー管理",
      },
    },
    series: {
      weeklyAiIssueDigest: "週間AIイシューダイジェスト",
      weeklyMarketIssues: "週間グローバル市場イシュー",
    },
  },
};

export default ja;
