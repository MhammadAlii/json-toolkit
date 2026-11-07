#!/usr/bin/env python3
"""
Structural validator for synaptiq_splash.json.

Checks the things that break Lottie players on mobile:
  * required top-level fields, canvas 512x512 @ 60 fps, 0..210 frames
  * no image/precomp assets, no fonts/chars, no text layers, no effects,
    no expressions (string "x" props), no masks / mattes
  * every layer is a shape layer with valid ip/op/st/ks
  * every shape item type is in the supported allow-list
  * every animated property has strictly increasing keyframe times inside
    the composition, bezier easing handles present on non-final keyframes
  * morphing paths keep a constant vertex count and closed flag
  * every colour is RGBA in 0..1
Exit code 0 = valid.

Run:  python3 validate.py [path/to/synaptiq_splash.json]
"""

import json
import sys
from pathlib import Path

SUPPORTED_SHAPES = {"gr", "sh", "el", "rc", "fl", "st", "tm", "tr"}
errors = []


def err(path, msg):
    errors.append(f"{path}: {msg}")


def check_prop(prop, path, comp_op):
    if not isinstance(prop, dict) or "k" not in prop:
        return err(path, "property missing 'k'")
    if "x" in prop and isinstance(prop["x"], str):
        err(path, "expression found")
    if prop.get("a") != 1:
        return
    kfs = prop["k"]
    if not isinstance(kfs, list) or len(kfs) < 2:
        return err(path, "animated property needs >= 2 keyframes")
    last_t = -1
    shape_sig = None
    for n, kf in enumerate(kfs):
        t = kf.get("t")
        if not isinstance(t, (int, float)):
            err(f"{path}[{n}]", "keyframe missing numeric 't'")
            continue
        if t <= last_t:
            err(f"{path}[{n}]", f"keyframe time {t} not increasing")
        if not 0 <= t <= comp_op:
            err(f"{path}[{n}]", f"keyframe time {t} outside composition")
        last_t = t
        if "s" not in kf:
            err(f"{path}[{n}]", "keyframe missing 's'")
        if n < len(kfs) - 1 and not kf.get("h"):
            for h in ("i", "o"):
                if h not in kf or "x" not in kf[h] or "y" not in kf[h]:
                    err(f"{path}[{n}]", f"missing easing handle '{h}'")
        s = kf.get("s")
        if isinstance(s, list) and s and isinstance(s[0], dict) and "v" in s[0]:
            sig = (len(s[0]["v"]), s[0].get("c"))
            if shape_sig and sig != shape_sig:
                err(f"{path}[{n}]", f"path morph changes vertex count/closed {shape_sig} -> {sig}")
            shape_sig = sig


def check_color(prop, path):
    vals = prop["k"] if prop.get("a") == 0 else [k["s"] for k in prop["k"]]
    vals = [vals] if prop.get("a") == 0 else vals
    for v in vals:
        if len(v) not in (3, 4) or any(not 0 <= c <= 1 for c in v):
            err(path, f"colour out of range {v}")


def walk_shapes(items, path, op):
    for n, it in enumerate(items):
        p = f"{path}/{it.get('nm', it.get('ty'))}#{n}"
        ty = it.get("ty")
        if ty not in SUPPORTED_SHAPES:
            err(p, f"unsupported shape type '{ty}'")
            continue
        if ty == "gr":
            if not it.get("it") or it["it"][-1].get("ty") != "tr":
                err(p, "group must end with a 'tr' transform")
            walk_shapes(it.get("it", []), p, op)
        for key, val in it.items():
            if isinstance(val, dict) and "k" in val:
                check_prop(val, f"{p}.{key}", op)
        if ty in ("fl", "st"):
            check_color(it["c"], f"{p}.c")
            if ty == "st" and "w" not in it:
                err(p, "stroke without width")


def main(file):
    raw = Path(file).read_bytes()
    data = json.loads(raw)
    for key in ("v", "fr", "ip", "op", "w", "h", "layers"):
        if key not in data:
            err("root", f"missing '{key}'")
    if (data.get("w"), data.get("h"), data.get("fr")) != (512, 512, 60):
        err("root", "expected 512x512 @ 60fps")
    op = data.get("op", 0)
    if data.get("assets"):
        err("root", "assets must be empty (no images / precomps)")
    for bad in ("fonts", "chars"):
        if data.get(bad):
            err("root", f"'{bad}' not allowed")
    inds = set()
    for n, layer in enumerate(data.get("layers", [])):
        lp = f"layer[{n}] {layer.get('nm')}"
        if layer.get("ty") != 4:
            err(lp, f"only shape layers allowed (ty={layer.get('ty')})")
        if layer.get("ind") in inds:
            err(lp, "duplicate 'ind'")
        inds.add(layer.get("ind"))
        for key in ("ip", "op", "st", "ks", "shapes"):
            if key not in layer:
                err(lp, f"missing '{key}'")
        for bad in ("ef", "masksProperties", "tt", "td"):
            if layer.get(bad):
                err(lp, f"'{bad}' (effects/masks/mattes) not allowed")
        for key, val in layer.get("ks", {}).items():
            check_prop(val, f"{lp}.ks.{key}", op)
        walk_shapes(layer.get("shapes", []), lp, op)
    if "\"x\":\"" in raw.decode():
        err("root", "expression string detected")

    size_kb = len(raw) / 1024
    if errors:
        print(f"INVALID ({len(errors)} problems)")
        for e in errors:
            print("  -", e)
        return 1
    print(f"OK  {file}")
    print(f"    {len(data['layers'])} shape layers, {op} frames @ {data['fr']} fps "
          f"({op / data['fr']:.2f}s), {data['w']}x{data['h']}, {size_kb:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else
                  Path(__file__).resolve().parent / "synaptiq_splash.json"))
