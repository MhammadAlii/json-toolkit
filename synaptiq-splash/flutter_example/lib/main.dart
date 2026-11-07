import 'package:flutter/material.dart';

import 'splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Start init immediately so it runs in parallel with the splash animation.
  final init = _initializeApp();
  runApp(SynaptiqApp(initialization: init));
}

/// Replace with real start-up work: restore session, open local DB,
/// warm caches, fetch remote config, etc.
Future<void> _initializeApp() async {
  await Future<void>.delayed(const Duration(milliseconds: 1200));
}

class SynaptiqApp extends StatelessWidget {
  const SynaptiqApp({super.key, required this.initialization});

  final Future<void> initialization;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Synaptiq',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: SynaptiqColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: SynaptiqColors.violet,
          brightness: Brightness.dark,
        ),
      ),
      home: SynaptiqSplash(
        initialization: initialization,
        nextRouteBuilder: (_) => const HomeScreen(),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Your library')),
    );
  }
}
