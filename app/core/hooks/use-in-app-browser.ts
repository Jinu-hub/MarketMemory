import * as React from "react";

export type InAppBrowserPlatform = "ios" | "android" | "other";

export type InAppBrowserApp =
  | "threads"
  | "instagram"
  | "facebook"
  | "kakaotalk"
  | "line"
  | "other";

export type InAppBrowserInfo = {
  isInApp: boolean;
  platform: InAppBrowserPlatform;
  appName: InAppBrowserApp | null;
};

const DEFAULT_INFO: InAppBrowserInfo = {
  isInApp: false,
  platform: "other",
  appName: null,
};

/** Identify the specific in-app browser (WebView) from the user agent string. */
function detectAppName(ua: string): InAppBrowserApp | null {
  // Threads exposes itself as "Barcelona" (its internal codename).
  if (/Barcelona/i.test(ua)) return "threads";
  if (/Instagram/i.test(ua)) return "instagram";
  // Facebook in-app browser markers.
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return "facebook";
  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  // Match "Line/" to avoid false positives on the word "line" elsewhere.
  if (/\bLine\//i.test(ua)) return "line";
  return null;
}

function detectPlatform(ua: string): InAppBrowserPlatform {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  // iPadOS reports a desktop-like UA; disambiguate via touch points.
  if (
    /Macintosh/i.test(ua) &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints > 1
  ) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/**
 * SSR-safe hook that detects whether the app is currently running inside a
 * mobile in-app browser (WebView) such as Threads, Instagram, Facebook,
 * KakaoTalk, or Line, along with the platform (iOS/Android).
 *
 * Returns a safe default (`isInApp: false`) on the server and during the
 * first paint so the modal never flashes before hydration.
 */
export function useInAppBrowser(): InAppBrowserInfo {
  const [info, setInfo] = React.useState<InAppBrowserInfo>(DEFAULT_INFO);

  React.useEffect(() => {
    if (typeof navigator === "undefined") return;

    const ua = navigator.userAgent || "";
    const appName = detectAppName(ua);
    setInfo({
      isInApp: appName !== null,
      platform: detectPlatform(ua),
      appName,
    });
  }, []);

  return info;
}
