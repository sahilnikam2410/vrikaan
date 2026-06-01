"""
VRIKAAN — AD-QUALITY LinkedIn Launch Carousel
1080x1080, 5 slides, exported to multi-page PDF + per-slide PNGs.

v2 changes:
  - Replaced all emoji with hand-drawn vector icons (envelope, link, globe,
    padlock, spider, bolt, shield, book) — no more missing-glyph boxes
  - Real 5-star rating using star polygons
  - Cleaner pill icons on slide 1 (drawn shield/magnifier/spider)
  - Fixed text alignment / spacing
"""
import os
import math
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ─── Constants ───
SIZE = 1080
W = H = SIZE
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_PDF = os.path.join(ROOT, "vrikaan-launch-carousel.pdf")

# Brand palette
BG_DEEP = (3, 7, 18)
BG_DARK = (10, 15, 30)
BG_CARD = (18, 24, 50)
WHITE = (241, 245, 249)
MUTED = (148, 163, 184)
DIM = (100, 116, 139)
ACCENT = (99, 102, 241)
CYAN = (20, 227, 197)
PURPLE = (139, 92, 246)
GREEN = (34, 197, 94)
RED = (239, 68, 68)
ORANGE = (251, 146, 60)
YELLOW = (250, 204, 21)
PINK = (236, 72, 153)

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_LIGHT = "C:/Windows/Fonts/segoeuil.ttf"


def f(font_path, size):
    return ImageFont.truetype(font_path, size)


# ─── Background helpers ───
def linear_gradient_bg(size, top, bot):
    img = Image.new("RGBA", size, top + (255,))
    d = ImageDraw.Draw(img)
    for y in range(size[1]):
        t = y / size[1]
        r = int(top[0] + (bot[0] - top[0]) * t)
        g = int(top[1] + (bot[1] - top[1]) * t)
        b = int(top[2] + (bot[2] - top[2]) * t)
        d.line([(0, y), (size[0], y)], fill=(r, g, b, 255))
    return img


def radial_glow(img, cx, cy, r, color, alpha_max=200):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    steps = 60
    for i in range(steps, 0, -1):
        a = int(alpha_max * (i / steps) ** 2.4 * 0.18)
        rad = int(r * (i / steps))
        od.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=color + (a,))
    img.alpha_composite(overlay)


def make_base_canvas():
    bg = linear_gradient_bg((W, H), BG_DEEP, BG_DARK)
    radial_glow(bg, int(W * 0.85), int(H * 0.15), 600, ACCENT, 200)
    radial_glow(bg, int(W * 0.15), int(H * 0.85), 700, CYAN, 130)
    radial_glow(bg, int(W * 0.55), int(H * 0.45), 400, PURPLE, 60)

    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for i in range(0, W, 60):
        gd.line([(i, 0), (i, H)], fill=(255, 255, 255, 4))
    for i in range(0, H, 60):
        gd.line([(0, i), (W, i)], fill=(255, 255, 255, 4))
    bg.alpha_composite(grid)
    return bg


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_glow_text(img, text, pos, font, color, glow_color=None, glow_radius=14, glow_alpha=120):
    if glow_color is None:
        glow_color = color
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.text(pos, text, font=font, fill=glow_color + (glow_alpha,))
    glow = glow.filter(ImageFilter.GaussianBlur(glow_radius))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    d.text(pos, text, font=font, fill=color + (255,))


# ─── Vector ICONS ───
def icon_envelope(d, cx, cy, size, color):
    """Mail envelope."""
    w = size
    h = int(size * 0.7)
    x = cx - w // 2
    y = cy - h // 2
    rounded_rect(d, [x, y, x + w, y + h], 4, outline=color + (255,), width=3)
    # flap
    d.line([(x, y + 4), (cx, y + h // 2 + 2), (x + w, y + 4)], fill=color + (255,), width=3)


def icon_link(d, cx, cy, size, color):
    """Two interlocking ovals = link."""
    s = size // 2
    # left oval
    d.rounded_rectangle([cx - s, cy - 8, cx, cy + 8], 8, outline=color + (255,), width=3)
    # right oval
    d.rounded_rectangle([cx, cy - 8, cx + s, cy + 8], 8, outline=color + (255,), width=3)


def icon_globe(d, cx, cy, size, color):
    r = size // 2
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color + (255,), width=3)
    # equator
    d.line([(cx - r, cy), (cx + r, cy)], fill=color + (255,), width=2)
    # meridian
    d.ellipse([cx - r // 2, cy - r, cx + r // 2, cy + r], outline=color + (255,), width=2)
    # meridian2 (vertical)
    d.line([(cx, cy - r), (cx, cy + r)], fill=color + (255,), width=2)


def icon_lock(d, cx, cy, size, color):
    """Padlock."""
    body_w = int(size * 0.85)
    body_h = int(size * 0.55)
    bx = cx - body_w // 2
    by = cy - body_h // 2 + 6
    rounded_rect(d, [bx, by, bx + body_w, by + body_h], 6, outline=color + (255,), width=3)
    # shackle
    sh_w = int(size * 0.55)
    sh_h = int(size * 0.4)
    shx = cx - sh_w // 2
    shy = by - sh_h + 4
    d.arc([shx, shy, shx + sh_w, shy + sh_h * 2], start=180, end=360, fill=color + (255,), width=3)
    # keyhole
    d.ellipse([cx - 3, by + body_h // 2 - 5, cx + 3, by + body_h // 2 + 1], fill=color + (255,))


def icon_spider_web(d, cx, cy, size, color):
    """Spider web - radial lines + concentric arcs."""
    r = size // 2
    # 6 radial spokes
    for ang in range(0, 360, 60):
        a = math.radians(ang)
        d.line([(cx, cy), (cx + r * math.cos(a), cy + r * math.sin(a))],
               fill=color + (255,), width=2)
    # 3 concentric arcs (only top half = visual interest)
    for rr in [int(r * 0.4), int(r * 0.7), r]:
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=color + (180,), width=2)


def icon_bolt(d, cx, cy, size, color):
    """Lightning bolt."""
    s = size // 2
    pts = [
        (cx - s // 2 + 2, cy - s),
        (cx + s // 2, cy - s),
        (cx, cy - 2),
        (cx + s // 2 + 2, cy - 2),
        (cx - s // 4, cy + s),
        (cx + 4, cy + 4),
        (cx - s // 2 - 2, cy + 4),
    ]
    d.polygon(pts, fill=color + (255,))


def icon_shield(d, cx, cy, size, color):
    s = size // 2
    pts = [
        (cx - s, cy - int(s * 0.85)),
        (cx, cy - s),
        (cx + s, cy - int(s * 0.85)),
        (cx + s, cy + 2),
        (cx, cy + s),
        (cx - s, cy + 2),
    ]
    d.polygon(pts, outline=color + (255,), fill=None)
    # outline thicker
    d.line(pts + [pts[0]], fill=color + (255,), width=3)
    # check inside
    d.line([(cx - 10, cy + 2), (cx - 2, cy + 10), (cx + 12, cy - 8)],
           fill=color + (255,), width=3)


def icon_book(d, cx, cy, size, color):
    w = int(size * 0.9)
    h = int(size * 0.7)
    x = cx - w // 2
    y = cy - h // 2
    rounded_rect(d, [x, y, x + w, y + h], 4, outline=color + (255,), width=3)
    # spine
    d.line([(cx, y), (cx, y + h)], fill=color + (255,), width=2)
    # page lines
    for i in range(3):
        ly = y + 10 + i * 10
        d.line([(x + 6, ly), (cx - 4, ly)], fill=color + (180,), width=2)
        d.line([(cx + 4, ly), (x + w - 6, ly)], fill=color + (180,), width=2)


def icon_magnifier(d, cx, cy, size, color):
    r = int(size * 0.4)
    d.ellipse([cx - r - 4, cy - r - 4, cx + r - 4, cy + r - 4],
              outline=color + (255,), width=3)
    d.line([(cx + r - 12, cy + r - 12), (cx + r + 6, cy + r + 6)],
           fill=color + (255,), width=4)


def icon_eye(d, cx, cy, size, color):
    """Watching eye = monitoring."""
    w = size
    h = int(size * 0.55)
    d.ellipse([cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2],
              outline=color + (255,), width=3)
    d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=color + (255,))


def icon_star(d, cx, cy, size, color, fill=True):
    """5-point star."""
    r_outer = size / 2
    r_inner = r_outer * 0.4
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    if fill:
        d.polygon(pts, fill=color + (255,))
    else:
        d.polygon(pts, outline=color + (255,))


def icon_check_circle(d, cx, cy, size, color):
    r = size // 2
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (255,))
    # check
    d.line([(cx - r // 2, cy + 1), (cx - 2, cy + r // 2 - 2), (cx + r // 2, cy - r // 4)],
           fill=WHITE + (255,), width=4)


def icon_pulse_dot(d, cx, cy, color):
    d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=color)


def icon_warning(d, cx, cy, size, color):
    s = size // 2
    pts = [(cx, cy - s), (cx + s, cy + s - 4), (cx - s, cy + s - 4)]
    d.polygon(pts, outline=color + (255,), width=3, fill=None)
    d.line(pts + [pts[0]], fill=color + (255,), width=3)
    # exclamation
    d.line([(cx, cy - s // 2 + 4), (cx, cy + s // 4 - 6)], fill=color + (255,), width=3)
    d.ellipse([cx - 3, cy + s // 4 - 4, cx + 3, cy + s // 4 + 2], fill=color + (255,))


# ─── Brand chrome ───
def draw_logo(img, x, y, size=70):
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle([x - 4, y - 4, x + size + 4, y + size + 4], radius=18, fill=ACCENT + (180,))
    glow = glow.filter(ImageFilter.GaussianBlur(15))
    img.alpha_composite(glow)
    body = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    for i in range(size):
        t = i / size
        r = int(ACCENT[0] + (CYAN[0] - ACCENT[0]) * t)
        g = int(ACCENT[1] + (CYAN[1] - ACCENT[1]) * t)
        b = int(ACCENT[2] + (CYAN[2] - ACCENT[2]) * t)
        bd.line([(0, i), (size, i)], fill=(r, g, b, 255))
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size, size], radius=14, fill=255)
    img.paste(body, (x, y), mask)
    od2 = ImageDraw.Draw(img)
    v_font = f(FONT_BOLD, int(size * 0.6))
    bbox = od2.textbbox((0, 0), "V", font=v_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    od2.text(
        (x + (size - tw) / 2 - bbox[0], y + (size - th) / 2 - bbox[1] - 2),
        "V", font=v_font, fill=WHITE + (255,),
    )


def draw_header(img):
    draw_logo(img, 60, 60, 70)
    d = ImageDraw.Draw(img)
    d.text((150, 65), "VRIKAAN", font=f(FONT_BOLD, 28), fill=WHITE)
    d.text((150, 100), "AI Cyber Defense", font=f(FONT_REG, 13), fill=MUTED)


def draw_footer(img, page, total):
    d = ImageDraw.Draw(img)
    rounded_rect(d, [60, H - 100, 320, H - 50], 25, fill=BG_CARD + (200,))
    icon_globe(d, 92, H - 75, 26, CYAN)
    d.text((125, H - 90), "vrikaan.com", font=f(FONT_BOLD, 22), fill=WHITE)

    cy = H - 75
    spacing = 22
    dot_w = 8
    total_w = (total - 1) * spacing + dot_w
    sx = (W - total_w) / 2
    for i in range(total):
        if i == page - 1:
            rounded_rect(d, [sx + i * spacing - 6, cy - 4, sx + i * spacing + 22, cy + 4], 4, fill=CYAN)
        else:
            d.ellipse([sx + i * spacing, cy - 4, sx + i * spacing + 8, cy + 4], fill=(45, 55, 80, 255))

    if page < total:
        d.text((W - 200, H - 90), "Swipe →", font=f(FONT_BOLD, 20), fill=CYAN)


# ──────────────────────────────────────────────────
# SLIDE 1 — Launch hero
# ──────────────────────────────────────────────────
def slide_1():
    img = make_base_canvas()
    draw_header(img)
    d = ImageDraw.Draw(img)

    # JUST LAUNCHED pill
    rounded_rect(d, [60, 200, 320, 250], 25, fill=(20, 83, 45, 255))
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([72, 211, 102, 241], fill=GREEN + (200,))
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    icon_pulse_dot(d, 87, 226, GREEN)
    d.text((110, 213), "JUST LAUNCHED", font=f(FONT_BOLD, 16), fill=GREEN)

    # Massive wordmark
    draw_glow_text(img, "VRIKAAN", (60, 290), f(FONT_BOLD, 160), WHITE, CYAN, 30, 90)

    d = ImageDraw.Draw(img)
    d.text((60, 480), "is now live.", font=f(FONT_BOLD, 80), fill=CYAN)

    d.text((60, 600), "AI-powered cyber defense", font=f(FONT_LIGHT, 38), fill=WHITE)
    d.text((60, 645), "for everyone in India.", font=f(FONT_LIGHT, 38), fill=MUTED)

    # Three feature pills with drawn icons
    pills = [
        ("Threat Detection", ACCENT, "shield"),
        ("Fraud Analysis", CYAN, "magnifier"),
        ("Dark Web Monitor", PURPLE, "eye"),
    ]
    px = 60
    py = 740
    for txt, color, icon_type in pills:
        bbox = d.textbbox((0, 0), txt, font=f(FONT_BOLD, 17))
        tw = bbox[2] - bbox[0]
        pw = tw + 78  # space for icon + padding
        rounded_rect(d, [px, py, px + pw, py + 50], 25, fill=BG_CARD + (220,), outline=color + (180,), width=2)
        # icon
        if icon_type == "shield":
            icon_shield(d, px + 26, py + 25, 26, color)
        elif icon_type == "magnifier":
            icon_magnifier(d, px + 26, py + 25, 26, color)
        elif icon_type == "eye":
            icon_eye(d, px + 26, py + 25, 26, color)
        d.text((px + 50, py + 14), txt, font=f(FONT_BOLD, 17), fill=color)
        px += pw + 14

    # Footer credit
    d.text((60, 830), "Built solo  ·  Made in India", font=f(FONT_REG, 17), fill=MUTED)
    # tiny tricolor stripe
    d.rectangle([255, 832, 270, 838], fill=ORANGE)
    d.rectangle([255, 838, 270, 844], fill=WHITE)
    d.rectangle([255, 844, 270, 850], fill=GREEN)

    draw_footer(img, 1, 5)
    return img


# ──────────────────────────────────────────────────
# SLIDE 2 — Problem with bar chart
# ──────────────────────────────────────────────────
def slide_2():
    img = make_base_canvas()
    draw_header(img)
    d = ImageDraw.Draw(img)

    rounded_rect(d, [60, 200, 270, 245], 22, fill=(74, 17, 17, 200), outline=RED + (120,), width=1)
    icon_pulse_dot(d, 85, 222, RED)
    d.text((105, 212), "THE PROBLEM", font=f(FONT_BOLD, 16), fill=RED)

    d.text((60, 270), "Cybercrime in India", font=f(FONT_LIGHT, 44), fill=WHITE)
    d.text((60, 320), "is exploding.", font=f(FONT_BOLD, 56), fill=WHITE)

    draw_glow_text(img, "₹100Cr+", (60, 420), f(FONT_BOLD, 130), CYAN, CYAN, 25, 110)
    d = ImageDraw.Draw(img)
    d.text((60, 580), "lost to scams in 2024 alone", font=f(FONT_REG, 24), fill=MUTED)

    # Bar chart
    chart_x = 60
    chart_y = 660
    chart_h = 180
    chart_w = 800
    bars = [
        ("2020", 0.25, "₹14Cr"),
        ("2021", 0.35, "₹19Cr"),
        ("2022", 0.55, "₹38Cr"),
        ("2023", 0.75, "₹66Cr"),
        ("2024", 1.0, "₹100Cr+"),
    ]
    bar_w = 110
    gap = (chart_w - bar_w * len(bars)) // (len(bars) - 1)
    for i, (label, ratio, val) in enumerate(bars):
        bx = chart_x + i * (bar_w + gap)
        bh = int(chart_h * ratio)
        by = chart_y + chart_h - bh
        bar_img = Image.new("RGBA", (bar_w, bh), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bar_img)
        for yy in range(bh):
            t = yy / max(bh, 1)
            if i == len(bars) - 1:
                r1, g1, b1 = CYAN
                r2, g2, b2 = ACCENT
            else:
                r1, g1, b1 = ACCENT
                r2, g2, b2 = (50, 50, 90)
            r = int(r1 + (r2 - r1) * t)
            g = int(g1 + (g2 - g1) * t)
            b = int(b1 + (b2 - b1) * t)
            bd.line([(0, yy), (bar_w, yy)], fill=(r, g, b, 240))
        mask = Image.new("L", (bar_w, bh), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([0, 0, bar_w, bh], radius=10, fill=255)
        img.paste(bar_img, (bx, by), mask)

        d = ImageDraw.Draw(img)
        d.text((bx + 30, chart_y + chart_h + 12), label, font=f(FONT_REG, 14), fill=MUTED)
        color = CYAN if i == len(bars) - 1 else WHITE
        d.text((bx + 8, by - 28), val, font=f(FONT_BOLD, 16), fill=color)

    d = ImageDraw.Draw(img)
    d.text((60, 905), "And existing tools are too technical, too expensive, or", font=f(FONT_REG, 19), fill=MUTED)
    d.text((60, 932), "built only for enterprises — not regular people.", font=f(FONT_REG, 19), fill=MUTED)

    draw_footer(img, 2, 5)
    return img


# ──────────────────────────────────────────────────
# SLIDE 3 — Solution with mock terminal
# ──────────────────────────────────────────────────
def slide_3():
    img = make_base_canvas()
    draw_header(img)
    d = ImageDraw.Draw(img)

    rounded_rect(d, [60, 200, 280, 245], 22, fill=(13, 64, 54, 200), outline=CYAN + (140,), width=1)
    icon_pulse_dot(d, 85, 222, CYAN)
    d.text((105, 212), "THE SOLUTION", font=f(FONT_BOLD, 16), fill=CYAN)

    d.text((60, 285), "Cyber defense", font=f(FONT_BOLD, 78), fill=WHITE)
    draw_glow_text(img, "for real people.", (60, 370), f(FONT_BOLD, 78), CYAN, CYAN, 22, 100)

    d = ImageDraw.Draw(img)
    d.text((60, 478), "Built for parents, students, freelancers, and SMBs —", font=f(FONT_REG, 22), fill=MUTED)
    d.text((60, 510), "not enterprise IT teams.", font=f(FONT_REG, 22), fill=MUTED)

    # Mock terminal
    mx, my, mw, mh = 60, 580, W - 120, 360
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([mx + 8, my + 14, mx + mw + 8, my + mh + 14], radius=20, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    img.alpha_composite(shadow)

    rounded_rect(d, [mx, my, mx + mw, my + mh], 20, fill=BG_CARD + (250,), outline=(60, 70, 110, 255), width=1)
    rounded_rect(d, [mx, my, mx + mw, my + 50], 20, fill=(15, 22, 45, 255))
    d.rectangle([mx, my + 30, mx + mw, my + 50], fill=(15, 22, 45, 255))
    d.ellipse([mx + 18, my + 18, mx + 32, my + 32], fill=RED)
    d.ellipse([mx + 40, my + 18, mx + 54, my + 32], fill=YELLOW)
    d.ellipse([mx + 62, my + 18, mx + 76, my + 32], fill=GREEN)
    d.text((mx + mw / 2 - 70, my + 17), "vrikaan.com / scan", font=f(FONT_REG, 14), fill=MUTED)

    cx = mx + 30
    cy = my + 80
    d.text((cx, cy), "$ scan email:", font=f(FONT_BOLD, 18), fill=CYAN)
    d.text((cx + 130, cy), "youremail@gmail.com", font=f(FONT_REG, 18), fill=WHITE)

    cy += 50
    rounded_rect(d, [cx, cy, mx + mw - 30, cy + 70], 12, fill=(60, 14, 14, 200), outline=RED + (100,), width=1)
    icon_warning(d, cx + 28, cy + 35, 28, RED)
    d.text((cx + 64, cy + 12), "3 BREACHES FOUND", font=f(FONT_BOLD, 18), fill=RED)
    d.text((cx + 64, cy + 40), "LinkedIn (2021)  ·  Adobe (2019)  ·  Canva (2019)", font=f(FONT_REG, 14), fill=MUTED)

    cy += 90
    rounded_rect(d, [cx, cy, mx + mw - 30, cy + 70], 12, fill=(20, 50, 30, 200), outline=GREEN + (100,), width=1)
    icon_check_circle(d, cx + 28, cy + 35, 28, GREEN)
    d.text((cx + 64, cy + 12), "PASSWORD STRENGTH", font=f(FONT_BOLD, 18), fill=GREEN)
    d.text((cx + 64, cy + 40), "Strong  ·  14 chars  ·  Not in any breach", font=f(FONT_REG, 14), fill=MUTED)

    cy += 90
    d.text((cx, cy), "→ Set up dark web monitoring?", font=f(FONT_BOLD, 18), fill=CYAN)
    d.rectangle([cx + 380, cy, cx + 392, cy + 24], fill=CYAN)

    draw_footer(img, 3, 5)
    return img


# ──────────────────────────────────────────────────
# SLIDE 4 — 8 features grid (vector icons)
# ──────────────────────────────────────────────────
def slide_4():
    img = make_base_canvas()
    draw_header(img)
    d = ImageDraw.Draw(img)

    rounded_rect(d, [60, 200, 290, 245], 22, fill=(35, 26, 80, 200), outline=ACCENT + (140,), width=1)
    icon_pulse_dot(d, 85, 222, ACCENT)
    d.text((105, 212), "WHAT'S INSIDE", font=f(FONT_BOLD, 16), fill=ACCENT)

    d.text((60, 270), "8 powerful tools.", font=f(FONT_BOLD, 56), fill=WHITE)
    d.text((60, 335), "One simple platform.", font=f(FONT_LIGHT, 36), fill=MUTED)

    features = [
        ("Email Breach Scan",  "Check billions of leaks",   CYAN,   "envelope"),
        ("Phishing Analyzer",  "Verify suspicious URLs",    ACCENT, "link"),
        ("Live Threat Map",    "Global cyber attacks",      PURPLE, "globe"),
        ("Password Vault",     "Encrypted, breach-aware",   GREEN,  "lock"),
        ("Dark Web Monitor",   "Alerts when data leaks",    ORANGE, "spider"),
        ("Fraud AI Detection", "Spot scam calls & SMS",     YELLOW, "bolt"),
        ("Vulnerability Scan", "Find account weaknesses",   RED,    "shield"),
        ("Learn Academy",      "Free cybersec courses",     PINK,   "book"),
    ]

    cols = 2
    bx0, by0 = 60, 430
    bw, bh = 480, 110
    gx, gy = 30, 14

    for i, (title, desc, color, icon_type) in enumerate(features):
        row = i // cols
        col = i % cols
        x = bx0 + col * (bw + gx)
        y = by0 + row * (bh + gy)

        rounded_rect(d, [x, y, x + bw, y + bh], 16, fill=BG_CARD + (180,), outline=(60, 70, 110, 200), width=1)

        # Icon tile — dark base so the colored icon stays visible on top
        tile_bg = (max(0, color[0] // 6), max(0, color[1] // 6), max(0, color[2] // 6), 255)
        rounded_rect(d, [x + 14, y + 22, x + 86, y + 94], 14, fill=tile_bg, outline=color + (180,), width=2)
        ic_cx = x + 50
        ic_cy = y + 58
        if icon_type == "envelope":
            icon_envelope(d, ic_cx, ic_cy, 36, color)
        elif icon_type == "link":
            icon_link(d, ic_cx, ic_cy, 40, color)
        elif icon_type == "globe":
            icon_globe(d, ic_cx, ic_cy, 36, color)
        elif icon_type == "lock":
            icon_lock(d, ic_cx, ic_cy, 36, color)
        elif icon_type == "spider":
            icon_spider_web(d, ic_cx, ic_cy, 38, color)
        elif icon_type == "bolt":
            icon_bolt(d, ic_cx, ic_cy, 40, color)
        elif icon_type == "shield":
            icon_shield(d, ic_cx, ic_cy, 36, color)
        elif icon_type == "book":
            icon_book(d, ic_cx, ic_cy, 38, color)

        d.text((x + 110, y + 28), title, font=f(FONT_BOLD, 19), fill=WHITE)
        d.text((x + 110, y + 60), desc, font=f(FONT_REG, 15), fill=MUTED)

    # Bottom callout
    d.text((60, 920), "All free to start.  No credit card.  25 AI credits to begin.",
           font=f(FONT_BOLD, 18), fill=CYAN)

    draw_footer(img, 4, 5)
    return img


# ──────────────────────────────────────────────────
# SLIDE 5 — CTA with QR + stars
# ──────────────────────────────────────────────────
def slide_5():
    img = make_base_canvas()
    draw_header(img)
    d = ImageDraw.Draw(img)

    rounded_rect(d, [60, 200, 270, 245], 22, fill=(35, 26, 80, 200), outline=ACCENT + (140,), width=1)
    icon_pulse_dot(d, 85, 222, ACCENT)
    d.text((105, 212), "YOUR TURN", font=f(FONT_BOLD, 16), fill=ACCENT)

    d.text((60, 285), "Try it free.", font=f(FONT_BOLD, 84), fill=WHITE)
    draw_glow_text(img, "Right now.", (60, 380), f(FONT_BOLD, 84), CYAN, CYAN, 22, 110)

    # 5-star rating using drawn polygons
    d = ImageDraw.Draw(img)
    star_y = 520
    for i in range(5):
        icon_star(d, 80 + i * 44, star_y, 36, YELLOW)
    d.text((310, 510), "Built by a SOC analyst, for everyone", font=f(FONT_REG, 17), fill=MUTED)

    # Body
    d.text((60, 580), "I'm building this solo. Every signup, every honest piece", font=f(FONT_REG, 22), fill=WHITE)
    d.text((60, 615), "of feedback shapes what I ship next.", font=f(FONT_REG, 22), fill=WHITE)

    # CTA card
    cta_y = 690
    cta_h = 220
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle([60, cta_y, W - 60, cta_y + cta_h], radius=24, fill=ACCENT + (180,))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)

    cta_img = Image.new("RGBA", (W - 120, cta_h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cta_img)
    for yy in range(cta_h):
        t = yy / cta_h
        r = int(ACCENT[0] + (CYAN[0] - ACCENT[0]) * t)
        g = int(ACCENT[1] + (CYAN[1] - ACCENT[1]) * t)
        b = int(ACCENT[2] + (CYAN[2] - ACCENT[2]) * t)
        cd.line([(0, yy), (W - 120, yy)], fill=(r, g, b, 255))
    mask = Image.new("L", (W - 120, cta_h), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, W - 120, cta_h], radius=24, fill=255)
    img.paste(cta_img, (60, cta_y), mask)

    # QR code (proper black on white)
    qr_size = 170
    qr_img = qrcode.make("https://www.vrikaan.com").resize((qr_size, qr_size)).convert("RGBA")
    qr_x = W - 60 - qr_size - 30
    qr_y = cta_y + (cta_h - qr_size) // 2
    rounded_rect(d, [qr_x - 14, qr_y - 14, qr_x + qr_size + 14, qr_y + qr_size + 14], 14, fill=WHITE + (255,))
    img.paste(qr_img, (qr_x, qr_y))

    d = ImageDraw.Draw(img)
    d.text((110, cta_y + 40), "Scan or visit", font=f(FONT_REG, 22), fill=(220, 230, 255, 240))
    d.text((110, cta_y + 75), "vrikaan.com", font=f(FONT_BOLD, 56), fill=WHITE)
    d.text((110, cta_y + 145), "Free  ·  No card  ·  Setup in 30 sec", font=f(FONT_BOLD, 18), fill=(220, 230, 255, 240))

    d.text((60, 945), "— Sahil Anil Nikam  ·  Founder  ·  hello@vrikaan.com",
           font=f(FONT_REG, 16), fill=MUTED)

    draw_footer(img, 5, 5)
    return img


# ─── Build ───
def main():
    print("[1/5] Rendering slide 1 — Launch hero...")
    s1 = slide_1()
    print("[2/5] Rendering slide 2 — Problem...")
    s2 = slide_2()
    print("[3/5] Rendering slide 3 — Solution...")
    s3 = slide_3()
    print("[4/5] Rendering slide 4 — Features...")
    s4 = slide_4()
    print("[5/5] Rendering slide 5 — CTA...")
    s5 = slide_5()

    slides = [s.convert("RGB") for s in [s1, s2, s3, s4, s5]]
    slides[0].save(
        OUT_PDF,
        save_all=True,
        append_images=slides[1:],
        format="PDF",
        resolution=144,
        title="VRIKAAN — Launch",
        author="Sahil Anil Nikam",
    )
    size_kb = os.path.getsize(OUT_PDF) / 1024
    print(f"\n[OK] {OUT_PDF}  ({size_kb:.1f} KB)")

    png_dir = os.path.join(ROOT, "carousel_pngs")
    os.makedirs(png_dir, exist_ok=True)
    for i, s in enumerate([s1, s2, s3, s4, s5], 1):
        p = os.path.join(png_dir, f"slide_{i}.png")
        s.convert("RGB").save(p, "PNG", optimize=True)
    print(f"[OK] PNG copies in: {png_dir}/")


if __name__ == "__main__":
    main()
