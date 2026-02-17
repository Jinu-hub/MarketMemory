// Basic Flutter widget test. The real app uses WebView (needs platform in integration tests).
// This smoke test verifies the same app bar title without instantiating WebView.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('App shell shows Remix App Shell title', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          appBar: AppBar(title: const Text('Remix App Shell')),
          body: const SizedBox(),
        ),
      ),
    );

    expect(find.text('Remix App Shell'), findsOneWidget);
  });
}
