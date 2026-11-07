# Synaptiq splash — "The Birth of Knowledge"

| File | What |
|---|---|
| `synaptiq_splash.json` | Lottie 5.7, 512×512, 60 fps, 210 frames (3.5 s), transparent, ~42 KB, no expressions/effects/assets |
| `synaptiq_logo.svg` | Static final-frame logo (same geometry) |
| `generate.py` | Generates both files: `python3 generate.py` |
| `validate.py` | Structural validator: `python3 validate.py` |
| `preview.html` | Local preview with frame scrubber |
| `flutter_example/` | `lottie` splash: plays once, holds the last frame, reveals the name/tagline at 2.6 s, navigates once init is done, supports reduced motion |

Timeline markers in the JSON: `particles` 0, `network` 30, `book` 84, `spark` 126, `brand_text` 156, `hold` 192.

## Preview & validate
1. `python3 validate.py` checks the structure: keyframe order, no expressions, effects or assets, and consistent morph vertex counts.
2. Drag `synaptiq_splash.json` into https://lottiefiles.com/preview or https://lottie.github.io/lottie-web/ (or the LottieFiles desktop app). Set the background to `#0B0B17`.
3. Or run `python3 -m http.server` in this folder, open `http://localhost:8000/preview.html`, and scrub the frames.
4. On a device, run `flutter_example` (`flutter create .` once to add the platform folders, then `flutter run`).

For reduced motion, the Flutter example reads `MediaQuery.disableAnimationsOf`, jumps to the final frame (`controller.value = 1`) and shows the text immediately.
