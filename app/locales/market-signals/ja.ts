import type { MarketSignalsTranslation } from "./types";

const marketSignalsJa: MarketSignalsTranslation = {
  meta: {
    title: "マーケットシグナル",
  },
  title: "マーケットシグナル",
  subtitle: "グローバル市場イシューから集計した期間別シグナルランキング",
  experimentalBadge: "実験",
  adminOnlyHint: "管理者専用プレビューです。後から全体公開に切り替えられます。",
  scopeLabel: "範囲",
  scopeValue: "グローバル市場イシュー",
  periodTypes: {
    weekly: "週次",
    monthly: "月次",
    yearly: "年次",
  },
  status: {
    draft: "集計中",
    final: "確定",
  },
  empty: {
    noSnapshots: "この期間タイプのスナップショットはまだありません。",
    noItems: "表示するシグナルがありません（minCount未満の可能性）。",
  },
  metaSidebar: {
    period: "期間",
    range: "区間",
    sources: "ソース",
    signals: "シグナル",
    updated: "更新",
    layer: "集計レイヤー",
    partial: "部分集計",
    partialYes: "進行中の下位期間を含む",
    partialNo: "完了",
  },
  trends: {
    rising: "上昇",
    falling: "下落",
    new: "新規",
    stable: "横ばい",
  },
  takeaway: {
    title: "ひと目で",
    topSignal: "1位シグナルは{{name}}（{{count}}回）です。",
    risingCount: "上昇 {{count}}",
    newCount: "新規 {{count}}",
  },
};

export default marketSignalsJa;
