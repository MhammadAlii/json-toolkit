#!/usr/bin/env python3
"""
Synaptiq splash generator — "The Birth of Knowledge".

Outputs (next to this script):
  synaptiq_splash.json   Bodymovin/Lottie 5.x, 512x512, 60 fps, 210 frames (3.5 s)
  synaptiq_logo.svg      Static vector of the final frame (same geometry)

Only core Lottie features are used (shape layers, groups, paths, ellipses,
fills, strokes, trim paths, transforms, opacity, path morphing, spatial
position tangents). No expressions, effects, images, fonts or text layers,
so it renders identically in lottie-web, lottie-android/iOS and the pure-Dart
Flutter `lottie` package.

Run:  python3 generate.py
"""

import json
import math
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent

# --------------------------------------------------------------------------
# Brand + canvas
# --------------------------------------------------------------------------
W = H = 512
FPS = 60
END = 210  # 3.5 s

VIOLET = "#8B5CF6"
VIOLET_BRIGHT = "#A78BFA"
CYAN = "#22D3EE"
TEXT = "#F5F3FF"


def sec(s):
    return round(s * FPS)


def rgb(hex_):
    h = hex_.lstrip("#")
    return [round(int(h[i:i + 2], 16) / 255, 4) for i in (0, 2, 4)] + [1]


# --------------------------------------------------------------------------
# Geometry (final logo). Everything is shifted by DY so the mark —
# spark included — is optically centered on the canvas.
# --------------------------------------------------------------------------
DY = 40
S = 1.3  # design units -> canvas pixels (mark ~ 220 x 340 px on the 512 canvas)


def P(x, y):
    """Design-space point -> canvas point (offset + uniform scale about center)."""
    return (256 + (x - 256) * S, 256 + (y + DY - 256) * S)


CX = 256
N_A = P(256, 150)   # crown node
N_B = P(188, 196)   # left shoulder
N_C = P(324, 196)   # right shoulder
N_D = P(256, 256)   # core node = spine top
N_EL = P(200, 298)  # lower-left node (becomes left page)
N_ER = P(312, 298)  # lower-right node (becomes right page)
N_G = P(256, 340)   # spine bottom

PAGE_TL = P(172, 236)  # left page, outer top corner
PAGE_BL = P(172, 322)  # left page, outer bottom corner
PAGE_TR = P(340, 236)
PAGE_BR = P(340, 322)

SPARK = P(256, 98)
SPARK_R = 17 * S

GLOW_C = P(256, 246)
# Many faint concentric discs approximate a gaussian blur without effects.
GLOW_RINGS = [(196, 0.022), (168, 0.03), (140, 0.042), (112, 0.058), (86, 0.075), (62, 0.09)]

# Timeline (frames)
T_TRAVEL = (sec(0.5), 64)           # 30-64 particles converge
T_LINES_DONE = sec(1.4)             # 84
T_MORPH = (sec(1.4), sec(2.1))      # 84-126
T_SPARK = (sec(2.1), sec(2.6))      # 126-156


# --------------------------------------------------------------------------
# Low-level Lottie helpers
# --------------------------------------------------------------------------
EASE_IO = ({"x": 0.42, "y": 0}, {"x": 0.58, "y": 1})
EASE_OUT = ({"x": 0.22, "y": 0.6}, {"x": 0.24, "y": 1})
EASE_SOFT = ({"x": 0.33, "y": 0}, {"x": 0.2, "y": 1})


def r2(v):
    if isinstance(v, (list, tuple)):
        return [r2(x) for x in v]
    if isinstance(v, dict):
        return {k: r2(x) for k, x in v.items()}
    if isinstance(v, float):
        r = round(v, 2)
        return int(r) if r == int(r) else r
    return v


def static(v):
    return {"a": 0, "k": r2(v)}


def anim(kfs, ease=EASE_SOFT, wrap=False):
    """kfs: list of (frame, value) or (frame, value, extra_dict)."""
    out = []
    for n, kf in enumerate(kfs):
        t, v = kf[0], kf[1]
        val = [v] if wrap else (v if isinstance(v, (list, tuple)) else [v])
        k = {"t": t, "s": r2(val)}
        if n < len(kfs) - 1:
            e = kf[2].get("ease", ease) if len(kf) > 2 else ease
            k["o"], k["i"] = dict(e[0]), dict(e[1])
            if len(kf) > 2:
                for key in ("to", "ti"):
                    if key in kf[2]:
                        k[key] = r2(kf[2][key])
        out.append(k)
    return {"a": 1, "k": out}


def shape(verts, ins=None, outs=None, closed=False):
    n = len(verts)
    return {
        "c": closed,
        "v": r2([list(v) for v in verts]),
        "i": r2([list(t) for t in (ins or [(0, 0)] * n)]),
        "o": r2([list(t) for t in (outs or [(0, 0)] * n)]),
    }


def tr():
    return {"ty": "tr", "p": static([0, 0]), "a": static([0, 0]),
            "s": static([100, 100]), "r": static(0), "o": static(100)}


def group(name, items):
    return {"ty": "gr", "nm": name, "it": items + [tr()]}


def path_item(prop):
    return {"ty": "sh", "ks": prop}


def ellipse(d, center=(0, 0)):
    return {"ty": "el", "p": static(list(center)), "s": static([d, d])}


def fill(color, opacity=100):
    o = opacity if isinstance(opacity, dict) else static(opacity)
    return {"ty": "fl", "c": static(rgb(color)), "o": o, "r": 1}


def stroke(color, width, opacity=100):
    o = opacity if isinstance(opacity, dict) else static(opacity)
    return {"ty": "st", "c": static(rgb(color)), "o": o, "w": static(width),
            "lc": 2, "lj": 2, "ml": 4}


def trim(t0, t1):
    return {"ty": "tm", "s": static(0),
            "e": anim([(t0, 0), (t1, 100)], EASE_IO), "o": static(0), "m": 1}


def transform(p=(0, 0), s=100, o=100, r=0, a=(0, 0)):
    def prop(v, default):
        if isinstance(v, dict):
            return v
        return static(v if v is not None else default)
    if not isinstance(s, dict):
        s = static([s, s])
    return {"o": prop(o, 100), "r": prop(r, 0), "p": prop(list(p) if not isinstance(p, dict) else p, [0, 0]),
            "a": static(list(a)), "s": s}


_ind = [0]


def layer(name, shapes, ks=None):
    _ind[0] += 1
    return {"ddd": 0, "ind": _ind[0], "ty": 4, "nm": name, "sr": 1,
            "ks": ks or transform(), "ao": 0, "shapes": shapes,
            "ip": 0, "op": END, "st": 0, "bm": 0}


# --------------------------------------------------------------------------
# Composite parts
# --------------------------------------------------------------------------
def glowing_stroke(name, path_prop, t0, t1, color=VIOLET_BRIGHT, glow=VIOLET,
                   width=2.4, extra=None):
    """Thin core stroke over two wide translucent strokes = vector glow."""
    items = [path_item(path_prop), trim(t0, t1)]
    items += extra or []
    items += [
        stroke(color, width),
        stroke(glow, width * 3.2, 22),
        stroke(glow, width * 6.5, 7),
    ]
    return group(name, items)


def line(a, b):
    return static(shape([a, b]))


def morph_line(a, b0, b1):
    return anim([(T_MORPH[0], shape([a, b0])), (T_MORPH[1], shape([a, b1]))],
                EASE_IO, wrap=True)


def page_shapes(side):
    """Network triangle D-E-G morphing into an open-book page."""
    s = -1 if side == "L" else 1
    E = N_EL if side == "L" else N_ER
    top = PAGE_TL if side == "L" else PAGE_TR
    bot = PAGE_BL if side == "L" else PAGE_BR
    start = shape([N_D, E, E, N_G], closed=True)
    # Final page: top edge bows upward, bottom edge sags then lifts to spine.
    end = shape(
        [N_D, top, bot, N_G],
        ins=[(0, 0), (-s * 26 * S, -4 * S), (0, 0), (s * 28 * S, -10 * S)],
        outs=[(s * 28 * S, -12 * S), (0, 0), (-s * 26 * S, 4 * S), (0, 0)],
        closed=True,
    )
    return start, end


def rule_shape(s, dy):
    """A printed 'text line' on a page, parallel to the page's top edge."""
    a = (CX + s * 14 * S, N_D[1] + dy * S)
    b = (CX + s * 70 * S, N_D[1] + (dy - 15) * S)
    sh = shape([a, b], outs=[(s * 20 * S, -9 * S), (0, 0)], ins=[(0, 0), (s * -22 * S, 3 * S)])
    return a, b, sh


def page_layer(side):
    start, end = page_shapes(side)
    prop = anim([(T_MORPH[0], start), (T_MORPH[1], end)], EASE_IO, wrap=True)
    outline = glowing_stroke(f"page {side} outline", prop, 66, T_LINES_DONE)
    body = group(f"page {side} fill", [
        path_item(prop),
        fill(VIOLET, anim([(96, 0), (T_MORPH[1], 18)], EASE_SOFT)),
    ])
    # Two "text lines" printed on the page once it has opened.
    s = -1 if side == "L" else 1
    rules = []
    for n, dy in enumerate((24, 46)):
        a, b, sh = rule_shape(s, dy)
        rules.append(group(f"rule {n}", [
            path_item(static(sh)),
            {"ty": "tm", "s": static(0),
             "e": anim([(106 + n * 6, 0), (126 + n * 6, 100)], EASE_IO),
             "o": static(0), "m": 1},
            stroke(VIOLET_BRIGHT, 1.6, 55),
        ]))
    return layer(f"page {side}", [outline] + rules + [body])


def node_layer(name, final, start, color, size=11, *, k=0, swirl=1,
               vanish=False, arrive=None):
    """A particle that fades in near the center, swirls into its node position."""
    t_in = 2 + k * 3
    t_go = T_TRAVEL[0] + k
    t_arr = arrive or (T_TRAVEL[1] - 6 + k)
    dx, dy = final[0] - start[0], final[1] - start[1]
    perp = (-dy * swirl, dx * swirl)
    to = (dx * 0.2 + perp[0] * 0.45, dy * 0.2 + perp[1] * 0.45)
    ti = (-dx * 0.25 + perp[0] * 0.3, -dy * 0.25 + perp[1] * 0.3)
    drift = (start[0] + perp[0] * -0.06, start[1] + perp[1] * -0.06)

    pos = anim([
        (t_in, list(start), {"to": [0, 0], "ti": [0, 0]}),
        (t_go, list(drift), {"ease": EASE_IO, "to": list(to), "ti": list(ti)}),
        (t_arr, list(final)),
    ])

    sc = [(t_in, [0, 0]), (t_in + 16, [100, 100]), (t_arr, [100, 100]),
          (t_arr + 6, [135, 135]), (t_arr + 16, [100, 100])]
    op = [(t_in, 0), (t_in + 14, 100)]
    if vanish:
        sc += [(T_MORPH[0], [100, 100]), (T_MORPH[0] + 22, [0, 0])]
        op += [(T_MORPH[0], 100), (T_MORPH[0] + 22, 0)]
    shapes = [
        group("core", [ellipse(size), fill(color)]),
        group("halo", [ellipse(size * 2.3), fill(color, 22)]),
        group("halo2", [ellipse(size * 3.8), fill(color, 7)]),
    ]
    return layer(name, shapes, {
        "o": anim(op), "r": static(0), "p": pos, "a": static([0, 0]),
        "s": anim(sc),
    })


def dust_layer(name, start, target, color, k):
    """Decorative particle: appears, flows into a line, dissolves."""
    t_in = 4 + k * 3
    t_go = T_TRAVEL[0] + 2
    t_end = 72 + k * 2
    dx, dy = target[0] - start[0], target[1] - start[1]
    sw = 1 if k % 2 else -1
    perp = (-dy * sw, dx * sw)
    pos = anim([
        (t_in, list(start), {"to": [0, 0], "ti": [0, 0]}),
        (t_go, list(start), {"ease": EASE_IO,
                             "to": [dx * 0.25 + perp[0] * 0.4, dy * 0.25 + perp[1] * 0.4],
                             "ti": [-dx * 0.25 + perp[0] * 0.25, -dy * 0.25 + perp[1] * 0.25]}),
        (t_end, list(target)),
    ])
    shapes = [
        group("core", [ellipse(5), fill(color)]),
        group("halo", [ellipse(13), fill(color, 18)]),
    ]
    return layer(name, shapes, {
        "o": anim([(t_in, 0), (t_in + 12, 85), (t_end - 14, 85), (t_end, 0)]),
        "r": static(0), "p": pos, "a": static([0, 0]),
        "s": anim([(t_in, [0, 0]), (t_in + 14, [100, 100]),
                   (t_end - 10, [100, 100]), (t_end, [30, 30])]),
    })


def spark_shape(r, pinch=0.62):
    v = [(0, -r), (r, 0), (0, r), (-r, 0)]
    t = r * pinch
    tang = [(0, t), (-t, 0), (0, -t), (t, 0)]  # toward center -> concave edges
    return shape(v, ins=tang, outs=tang, closed=True)


def spark_layer():
    t0, t1 = T_SPARK
    shapes = [
        group("spark core", [path_item(static(spark_shape(SPARK_R * 0.42))), fill(TEXT, 90)]),
        group("spark", [path_item(static(spark_shape(SPARK_R))), fill(CYAN)]),
        group("spark glow 1", [path_item(static(spark_shape(SPARK_R * 1.7, 0.7))), fill(CYAN, 20)]),
        group("spark glow 2", [ellipse(SPARK_R * 2.6), fill(CYAN, 6)]),
        group("spark glow 3", [ellipse(SPARK_R * 3.8), fill(CYAN, 3.5)]),
    ]
    return layer("spark", shapes, {
        "o": anim([(t0, 0), (t0 + 8, 100)]),
        "r": anim([(t0, -90), (t0 + 24, 0)], EASE_OUT),
        "p": static(list(SPARK)), "a": static([0, 0]),
        "s": anim([(t0, [0, 0]), (t0 + 14, [122, 122]), (t0 + 26, [96, 96]), (t1, [100, 100])], EASE_IO),
    })


def glow_layer():
    shapes = [group(f"ring {n}", [ellipse(r * 2), fill(VIOLET, op * 100)])
              for n, (r, op) in enumerate(GLOW_RINGS)]
    t = T_SPARK[0]
    return layer("violet glow", shapes, {
        "o": anim([(36, 0), (T_LINES_DONE, 35), (t, 40), (t + 16, 100), (t + 50, 62)]),
        "r": static(0), "p": static(list(GLOW_C)), "a": static([0, 0]),
        "s": anim([(36, [70, 70]), (t, [92, 92]), (t + 16, [112, 112]), (t + 50, [100, 100])], EASE_IO),
    })


# --------------------------------------------------------------------------
# Build Lottie
# --------------------------------------------------------------------------
def ring_point(angle_deg, radius):
    c = P(256, 236)
    a = math.radians(angle_deg)
    return (c[0] + math.cos(a) * radius * S, c[1] + math.sin(a) * radius * S)


def build_lottie():
    _ind[0] = 0
    layers = []
    layers.append(spark_layer())

    # Nodes (start ring around center, staggered, symmetric swirl)
    nodes = [
        ("node A", N_A, ring_point(-100, 70), CYAN, 12, 0, 1, False),
        ("node B", N_B, ring_point(200, 92), VIOLET_BRIGHT, 11, 1, -1, False),
        ("node C", N_C, ring_point(-20, 92), VIOLET_BRIGHT, 11, 1, 1, False),
        ("node D", N_D, ring_point(90, 46), CYAN, 13, 2, 1, False),
        ("node EL", N_EL, ring_point(150, 104), VIOLET, 10, 3, -1, True),
        ("node ER", N_ER, ring_point(30, 104), VIOLET, 10, 3, 1, True),
        ("node G", N_G, ring_point(95, 120), CYAN, 9, 4, -1, False),
    ]
    for name, final, start, color, size, k, sw, van in nodes:
        layers.append(node_layer(name, final, start, color, size, k=k, swirl=sw, vanish=van))

    # Page-corner micro nodes appear when the book opens
    for nm, p in (("corner TL", PAGE_TL), ("corner TR", PAGE_TR),
                  ("corner BL", PAGE_BL), ("corner BR", PAGE_BR)):
        layers.append(layer(nm, [
            group("core", [ellipse(6), fill(VIOLET_BRIGHT)]),
            group("halo", [ellipse(15), fill(VIOLET, 22)]),
        ], {"o": anim([(112, 0), (T_MORPH[1], 100)]), "r": static(0),
            "p": static(list(p)), "a": static([0, 0]),
            "s": anim([(112, [0, 0]), (T_MORPH[1], [100, 100])], EASE_OUT)}))

    # Neural lines (drawn with trim paths, staggered from the crown down)
    lines = [
        ("A-B", line(N_A, N_B), 58, 76),
        ("A-C", line(N_A, N_C), 58, 76),
        ("A-D", line(N_A, N_D), 62, 80),
        ("B-D", line(N_B, N_D), 64, 80),
        ("C-D", line(N_C, N_D), 64, 80),
        ("B-E", morph_line(N_B, N_EL, PAGE_TL), 66, 82),
        ("C-E", morph_line(N_C, N_ER, PAGE_TR), 66, 82),
    ]
    layers.append(layer("neural lines", [
        glowing_stroke(nm, prop, t0, t1,
                       color=CYAN if nm == "A-D" else VIOLET_BRIGHT,
                       glow=CYAN if nm == "A-D" else VIOLET,
                       width=2.0 if nm == "A-D" else 2.4)
        for nm, prop, t0, t1 in lines
    ]))

    layers.append(page_layer("L"))
    layers.append(page_layer("R"))

    # Dust particles that dissolve into the network
    dust = [
        (ring_point(-150, 150), P(222, 173)), (ring_point(-30, 150), P(290, 173)),
        (ring_point(170, 140), P(222, 226)), (ring_point(10, 140), P(290, 226)),
        (ring_point(125, 150), P(228, 277)), (ring_point(55, 150), P(284, 277)),
        (ring_point(-75, 135), P(256, 200)), (ring_point(-105, 135), P(256, 300)),
    ]
    for k, (s, t) in enumerate(dust):
        layers.append(dust_layer(f"dust {k}", s, t, CYAN if k % 3 == 0 else VIOLET_BRIGHT, k))

    layers.append(glow_layer())

    return {
        "v": "5.7.4",
        "fr": FPS,
        "ip": 0,
        "op": END,
        "w": W,
        "h": H,
        "nm": "Synaptiq Splash - The Birth of Knowledge",
        "ddd": 0,
        "assets": [],
        "layers": layers,
        "markers": [
            {"tm": 0, "cm": "particles", "dr": 30},
            {"tm": 30, "cm": "network", "dr": 54},
            {"tm": 84, "cm": "book", "dr": 42},
            {"tm": 126, "cm": "spark", "dr": 30},
            {"tm": 156, "cm": "brand_text", "dr": 36},
            {"tm": 192, "cm": "hold", "dr": 18},
        ],
    }


# --------------------------------------------------------------------------
# SVG (final frame, same geometry)
# --------------------------------------------------------------------------
def f(n, nd=2):
    return f"{round(n, nd):g}"


def svg_path(sh):
    v, i, o = sh["v"], sh["i"], sh["o"]
    d = [f"M{f(v[0][0])} {f(v[0][1])}"]
    n = len(v)
    segs = n if sh["c"] else n - 1
    for k in range(segs):
        a, b = v[k], v[(k + 1) % n]
        c1 = (a[0] + o[k][0], a[1] + o[k][1])
        c2 = (b[0] + i[(k + 1) % n][0], b[1] + i[(k + 1) % n][1])
        if o[k] == [0, 0] and i[(k + 1) % n] == [0, 0]:
            d.append(f"L{f(b[0])} {f(b[1])}")
        else:
            d.append(f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(b[0])} {f(b[1])}")
    if sh["c"]:
        d.append("Z")
    return "".join(d)


def translate_shape(sh, dx, dy):
    sh = dict(sh)
    sh["v"] = [[x + dx, y + dy] for x, y in sh["v"]]
    return sh


def glow_stroke_svg(d, color, glow, w):
    return (f'<path d="{d}" stroke="{glow}" stroke-opacity=".07" stroke-width="{f(w * 6.5)}"/>'
            f'<path d="{d}" stroke="{glow}" stroke-opacity=".22" stroke-width="{f(w * 3.2)}"/>'
            f'<path d="{d}" stroke="{color}" stroke-width="{f(w)}"/>')


def dot_svg(p, color, size):
    x, y = f(p[0]), f(p[1])
    return (f'<circle cx="{x}" cy="{y}" r="{f(size * 1.9)}" fill="{color}" fill-opacity=".07"/>'
            f'<circle cx="{x}" cy="{y}" r="{f(size * 1.15)}" fill="{color}" fill-opacity=".22"/>'
            f'<circle cx="{x}" cy="{y}" r="{f(size / 2)}" fill="{color}"/>')


def build_svg():
    parts = []
    gx, gy = GLOW_C
    parts.append("<g>" + "".join(
        f'<circle cx="{f(gx)}" cy="{f(gy)}" r="{r}" fill="{VIOLET}" fill-opacity="{f(op * 0.62, 3)}"/>'
        for r, op in GLOW_RINGS) + "</g>")

    parts.append('<g fill="none" stroke-linecap="round" stroke-linejoin="round">')
    for side in ("L", "R"):
        _, end = page_shapes(side)
        d = svg_path(r2(end))
        parts.append(f'<path d="{d}" fill="{VIOLET}" fill-opacity=".18" stroke="none"/>')
        parts.append(glow_stroke_svg(d, VIOLET_BRIGHT, VIOLET, 2.4))
        s = -1 if side == "L" else 1
        for dy in (24, 46):
            sh = r2(rule_shape(s, dy)[2])
            parts.append(f'<path d="{svg_path(sh)}" stroke="{VIOLET_BRIGHT}" stroke-opacity=".55" stroke-width="1.6"/>')
    for a, b, cyan in ((N_A, N_B, 0), (N_A, N_C, 0), (N_A, N_D, 1), (N_B, N_D, 0),
                       (N_C, N_D, 0), (N_B, PAGE_TL, 0), (N_C, PAGE_TR, 0)):
        d = f"M{f(a[0])} {f(a[1])}L{f(b[0])} {f(b[1])}"
        parts.append(glow_stroke_svg(d, CYAN if cyan else VIOLET_BRIGHT, CYAN if cyan else VIOLET,
                                     2.0 if cyan else 2.4))
    parts.append("</g>")

    for p in (PAGE_TL, PAGE_TR, PAGE_BL, PAGE_BR):
        parts.append(dot_svg(p, VIOLET_BRIGHT, 6))
    for p, c, s in ((N_A, CYAN, 12), (N_B, VIOLET_BRIGHT, 11), (N_C, VIOLET_BRIGHT, 11),
                    (N_D, CYAN, 13), (N_G, CYAN, 9)):
        parts.append(dot_svg(p, c, s))

    sx, sy = SPARK
    parts.append(f'<circle cx="{f(sx)}" cy="{f(sy)}" r="{f(SPARK_R * 1.9)}" fill="{CYAN}" fill-opacity=".035"/>')
    parts.append(f'<circle cx="{f(sx)}" cy="{f(sy)}" r="{f(SPARK_R * 1.3)}" fill="{CYAN}" fill-opacity=".06"/>')
    for r, pinch, col, op in ((SPARK_R * 1.7, 0.7, CYAN, ".2"), (SPARK_R, 0.62, CYAN, "1"),
                              (SPARK_R * 0.42, 0.62, TEXT, ".9")):
        d = svg_path(r2(translate_shape(spark_shape(r, pinch), sx, sy)))
        parts.append(f'<path d="{d}" fill="{col}" fill-opacity="{op}"/>')

    # Crop to the mark with comfortable padding.
    vb = "36 36 440 440"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="440" height="440" '
            f'role="img" aria-label="Synaptiq logo">\n<title>Synaptiq</title>\n'
            + "\n".join(parts) + "\n</svg>\n")


def main():
    lottie = build_lottie()
    js = json.dumps(lottie, separators=(",", ":"))
    (OUT_DIR / "synaptiq_splash.json").write_text(js)
    (OUT_DIR / "synaptiq_logo.svg").write_text(build_svg())
    print(f"synaptiq_splash.json  {len(js) / 1024:.1f} KB, {len(lottie['layers'])} layers, "
          f"{lottie['op']} frames @ {lottie['fr']} fps")
    print("synaptiq_logo.svg     written")


if __name__ == "__main__":
    main()
