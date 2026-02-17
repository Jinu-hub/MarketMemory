import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const MaterialApp(home: MyWebView()));

class MyWebView extends StatefulWidget {
  const MyWebView({super.key});

  @override
  State<MyWebView> createState() => _MyWebViewState();
}

class _MyWebViewState extends State<MyWebView> {
  late final WebViewController controller;
  bool _canGoBack = false;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'Toaster',
        onMessageReceived: (JavaScriptMessage message) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('앱이 받은 메시지: ${message.message}')),
          );
        },
      )
      // Remix 서버 주소: 실기 테스트 시 PC의 LAN IP(예: 192.168.1.10)로 변경
      ..loadRequest(Uri.parse('http://192.168.148.31:5173'));

    // 웹 console.log 등을 Flutter 디버그 콘솔로 전달
    controller.setOnConsoleMessage((JavaScriptConsoleMessage msg) {
      debugPrint('[WebView ${msg.level.name}] ${msg.message}');
    });

    // 페이지 이동 후 뒤로가기 가능 여부 갱신 (앱 바 뒤로가기 버튼 표시용)
    controller.setNavigationDelegate(
      NavigationDelegate(
        onPageFinished: (_) async {
          if (!mounted) return;
          final can = await controller.canGoBack();
          if (mounted) setState(() => _canGoBack = can);
        },
      ),
    );
  }

  Future<bool> _onBackPressed() async {
    final canGoBack = await controller.canGoBack();
    if (canGoBack) {
      await controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onBackPressed();
        if (shouldPop && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Remix App Shell'),
          // 테스트 편의용: 디버그 빌드에서만 앱 바 뒤로가기 표시 (릴리즈에서는 웹 내 버튼만 사용)
          leading: (_canGoBack && kDebugMode)
              ? IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () async {
                    await controller.goBack();
                    if (!mounted) return;
                    final can = await controller.canGoBack();
                    if (mounted) setState(() => _canGoBack = can);
                  },
                )
              : null,
        ),
        body: WebViewWidget(controller: controller),
      ),
    );
  }
}
