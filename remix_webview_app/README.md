# Remix WebView 앱 (Flutter)

Remix 웹앱을 Flutter WebView로 감싸서 앱으로 실행하는 셸입니다.  
웹에서 `window.Toaster.postMessage()`로 보낸 메시지를 앱에서 SnackBar로 받습니다.

## 사전 요구사항

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 설치 후 `flutter doctor` 확인

## 프로젝트 생성 (최초 1회)

이 폴더에 `lib/`와 `pubspec.yaml`만 있는 상태이므로, **Flutter로 플랫폼 코드를 생성**해야 합니다.

```bash
cd remix_webview_app
flutter create . --platforms=android,ios
flutter pub get
```

## Remix 서버 주소 변경

`lib/main.dart` 안의 `loadRequest` URL을 **Remix 개발 서버가 떠 있는 PC의 LAN IP**로 바꿉니다.

- 예: `http://192.168.1.10:3000`
- Android 에뮬레이터에서 PC 접속: `http://10.0.2.2:3000` 사용 가능

## Android: HTTP 허용 (개발용)

`android/app/src/main/AndroidManifest.xml`의 `<application>` 태그에 다음을 추가합니다.

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

## iOS: HTTP + 로컬 네트워크 권한

`ios/Runner/Info.plist`에 다음을 추가합니다.

1. **App Transport Security 예외** (HTTP 허용):

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

2. **로컬 네트워크 권한** (iOS 14+, 같은 와이파이 PC 접속용):

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>개발 중 PC에서 실행 중인 Remix 서버에 접속합니다.</string>
```

## Remix 서버 실행 (실기/에뮬 접속용)

같은 와이파이의 핸드폰에서 접속하려면 **호스트를 열어서** 실행해야 합니다.

```bash
# Remix 프로젝트 루트에서
npm run dev:mobile
```

또는 `npx react-router dev --host`

## 실행

```bash
cd remix_webview_app
flutter run
```

(실기 또는 에뮬레이터 선택 후 실행)

## 동작 확인

1. Remix 홈에서 **「앱으로 메시지 보내기」** 버튼 클릭
2. Flutter 앱에서 SnackBar로 `앱이 받은 메시지: 안녕 플러터! 나 리믹스야.` 표시되면 연동 완료
