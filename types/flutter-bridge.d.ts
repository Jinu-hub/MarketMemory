/**
 * Flutter WebView JavaScript 채널 타입
 * Flutter 앱 내 WebView에서만 주입되며, 일반 브라우저에서는 undefined
 */
interface FlutterToasterChannel {
  postMessage(message: string): void;
}

declare global {
  interface Window {
    Toaster?: FlutterToasterChannel;
  }
}

export {};
