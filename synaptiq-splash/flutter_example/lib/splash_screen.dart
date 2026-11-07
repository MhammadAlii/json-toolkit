import 'dart:async';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

/// Brand tokens.
abstract final class SynaptiqColors {
  static const background = Color(0xFF0B0B17);
  static const violet = Color(0xFF8B5CF6);
  static const violetBright = Color(0xFFA78BFA);
  static const cyan = Color(0xFF22D3EE);
  static const text = Color(0xFFF5F3FF);
}

/// Splash: plays `synaptiq_splash.json` exactly once, reveals the brand
/// name + tagline in sync with the animation, holds the final frame, and
/// navigates once BOTH the animation and [initialization] are done.
///
/// Reduced motion (OS "remove animations" / "reduce motion") shows the final
/// logo frame and the text immediately, with no movement.
class SynaptiqSplash extends StatefulWidget {
  const SynaptiqSplash({
    super.key,
    required this.initialization,
    required this.nextRouteBuilder,
  });

  /// App start-up work (auth restore, DB open, remote config, ...).
  final Future<void> initialization;

  /// Screen shown after the splash.
  final WidgetBuilder nextRouteBuilder;

  @override
  State<SynaptiqSplash> createState() => _SynaptiqSplashState();
}

class _SynaptiqSplashState extends State<SynaptiqSplash>
    with SingleTickerProviderStateMixin {
  // Timeline of the Lottie file (210 frames @ 60 fps = 3.5 s). These match
  // the "brand_text" marker (frame 156) in the JSON.
  static const _totalFrames = 210.0;
  static const _titleAt = 156 / _totalFrames; // 2.6 s
  static const _taglineAt = 170 / _totalFrames; // ~2.83 s
  static const _textFade = Duration(milliseconds: 420);

  late final AnimationController _controller = AnimationController(vsync: this);
  final _animationDone = Completer<void>();

  bool _reduceMotion = false;
  bool _showTitle = false;
  bool _showTagline = false;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_syncText);
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) _completeAnimation();
    });
    // Navigate only when both the animation and app init have finished.
    // Init errors are surfaced by the next screen, not swallowed here.
    Future.wait<void>([
      _animationDone.future,
      widget.initialization.catchError((Object _) {}),
    ]).then((_) => _goNext());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reduceMotion = MediaQuery.disableAnimationsOf(context);
  }

  void _syncText() {
    final v = _controller.value;
    if (!_showTitle && v >= _titleAt) setState(() => _showTitle = true);
    if (!_showTagline && v >= _taglineAt) setState(() => _showTagline = true);
  }

  void _completeAnimation() {
    if (!_animationDone.isCompleted) _animationDone.complete();
  }

  void _onLoaded(LottieComposition composition) {
    _controller.duration = composition.duration;
    if (_reduceMotion) {
      // Jump to the final, stable brand frame. No playback.
      _controller.value = 1.0;
      setState(() {
        _showTitle = true;
        _showTagline = true;
      });
      // Short, motionless hold so the brand is readable before navigating.
      Future<void>.delayed(const Duration(milliseconds: 700), _completeAnimation);
    } else {
      // forward() plays once and stops at 1.0: the last frame is held
      // (no repeat()) until navigation happens.
      _controller.forward(from: 0);
    }
  }

  void _goNext() {
    if (!mounted || _navigated) return;
    _navigated = true;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder<void>(
        pageBuilder: (context, _, __) => widget.nextRouteBuilder(context),
        transitionDuration:
            _reduceMotion ? Duration.zero : const Duration(milliseconds: 450),
        transitionsBuilder: (_, animation, __, child) =>
            FadeTransition(opacity: animation, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final fade = _reduceMotion ? Duration.zero : _textFade;

    return Scaffold(
      backgroundColor: SynaptiqColors.background, // Lottie is transparent.
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Semantics(
              label: 'Synaptiq logo',
              image: true,
              child: Lottie.asset(
                'assets/animations/synaptiq_splash.json',
                controller: _controller,
                width: 240,
                height: 240,
                fit: BoxFit.contain,
                frameRate: FrameRate.composition, // 60 fps
                onLoaded: _onLoaded,
                // Never trap the user on the splash if the asset fails.
                errorBuilder: (context, error, stack) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (!mounted) return;
                    setState(() => _showTitle = _showTagline = true);
                    _completeAnimation();
                  });
                  return const SizedBox(width: 240, height: 240);
                },
              ),
            ),
            const SizedBox(height: 8),
            _FadeUp(
              visible: _showTitle,
              duration: fade,
              child: Text(
                'Synaptiq',
                style: textTheme.headlineMedium?.copyWith(
                  color: SynaptiqColors.text,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.6,
                ),
              ),
            ),
            const SizedBox(height: 8),
            _FadeUp(
              visible: _showTagline,
              duration: fade,
              child: Text(
                'Turn knowledge into understanding.',
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium?.copyWith(
                  color: SynaptiqColors.text.withValues(alpha: 0.68),
                  letterSpacing: 0.2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Fades a child in while sliding it up ~12 px.
class _FadeUp extends StatelessWidget {
  const _FadeUp({
    required this.visible,
    required this.duration,
    required this.child,
  });

  final bool visible;
  final Duration duration;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: visible ? 1 : 0,
      duration: duration,
      curve: Curves.easeOutCubic,
      child: AnimatedSlide(
        offset: visible ? Offset.zero : const Offset(0, 0.5),
        duration: duration,
        curve: Curves.easeOutCubic,
        child: child,
      ),
    );
  }
}
