/**
 * Market Signals visibility gate.
 * Flip to `"authenticated"` or `"public"` when ready to open beyond admins.
 */
export type MarketSignalVisibility = "admin" | "authenticated" | "public";

export const MARKET_SIGNAL_VISIBILITY: MarketSignalVisibility = "admin";

export const MARKET_SIGNAL_DEFAULT_SCOPE_KEY = "global-market-issues";

export function canViewMarketSignals(params: {
  isAdmin: boolean;
  isAuthenticated: boolean;
}): boolean {
  switch (MARKET_SIGNAL_VISIBILITY) {
    case "admin":
      return params.isAdmin;
    case "authenticated":
      return params.isAuthenticated;
    case "public":
      return true;
  }
}
