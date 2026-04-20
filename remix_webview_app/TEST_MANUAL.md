# Remix WebView 테스트 메뉴얼

실제 테스트를 진행할 때 필요한 실행 흐름만 정리한 문서입니다.

## 목적

- Flutter WebView에서 Remix 앱이 정상 로드되는지 확인
- 웹(`window.Toaster.postMessage`) -> 앱(SnackBar) 메시지 브릿지 동작 확인

## 테스트 전 체크

- `flutter doctor` 주요 항목이 정상인지 확인
- 테스트 대상 디바이스 준비
  - Android: 에뮬레이터(AVD) 또는 실기기
  - iOS: 시뮬레이터 또는 실기기
- `lib/main.dart`의 `loadRequest` URL이 현재 테스트 환경에 맞는지 확인
  - Android 에뮬레이터: `http://10.0.2.2:<port>`
  - iOS 시뮬레이터/실기기, Android 실기기: `http://<PC_LAN_IP>:<port>`

## 테스트 실행 흐름

### 1) Remix 서버 실행 (항상 먼저)

Remix 프로젝트 루트에서 실행:

```bash
npm run dev:mobile
```

`dev:mobile` 스크립트가 없다면:

```bash
npx react-router dev --host
```

### 2) Flutter 앱 실행

`remix_webview_app` 폴더에서 실행:

flutter emulators
flutter emulators --launch <emulator_id>
flutter devices

```bash
flutter run
```

디바이스(에뮬레이터/시뮬레이터/실기기)를 선택해 실행합니다.

### 3) 1차 검증: 페이지 로드

- 앱 실행 후 WebView에 Remix 홈 화면이 정상 표시되는지 확인
- 로딩 실패 시 URL/IP/포트/네트워크(같은 Wi-Fi)부터 확인

### 4) 2차 검증: 브릿지 메시지

- 웹 화면에서 `앱으로 메시지 보내기` 버튼 클릭
- Flutter 앱에서 SnackBar 메시지 수신 확인
  - 기대 결과 예시: `앱이 받은 메시지: 안녕 플러터! 나 리믹스야.`

### 5) 플랫폼별 확인

- Android: 시스템 뒤로가기 시 웹 히스토리 뒤로 이동이 먼저 동작하는지 확인
- iOS: HTTP/로컬 네트워크 권한 이슈 없이 접속되는지 확인

## 실패 시 점검 순서

1. Remix 서버를 `--host`로 실행했는지 확인
2. `loadRequest` URL이 디바이스 유형과 일치하는지 확인
3. 포트 번호, 방화벽, VPN, 같은 네트워크 여부 확인
4. Android/iOS 권한 설정(`README.md` 참고) 확인

## 완료 기준 (Done)

- WebView에서 Remix 홈이 열린다
- 버튼 클릭 시 앱에서 SnackBar 메시지가 표시된다
- (선택) Android 뒤로가기 UX가 기대대로 동작한다
