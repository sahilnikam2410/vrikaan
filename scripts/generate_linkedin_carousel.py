"""
Generate VRIKAAN LinkedIn launch carousel PDF.
1080x1080 square, 5 slides, brand colors.
"""
from reportlab.lib.pagesizes import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Brand colors
BG_DARK = HexColor("#030712")
BG_DARK2 = HexColor("#0a0f1e")
WHITE = HexColor("#f1f5f9")
MUTED = HexColor("#94a3b8")
ACCENT = HexColor("#6366f1")  # indigo
CYAN = HexColor("#14e3c5")    # mint
GREEN = HexColor("#22c55e")
RED = HexColor("#ef4444")

# Square 1080x1080 (LinkedIn carousel native)
SIZE = 1080
W = SIZE
H = SIZE

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "vrikaan-launch-carousel.pdf")
OUTPUT = os.path.abspath(OUTPUT)


def gradient_bg(c):
    """Subtle radial gradient background."""
    c.setFillColor(BG_DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # Subtle accent circle (top-right)
    c.setFillColor(HexColor("#1a1f3a"))
    c.circle(W * 0.85, H * 0.85, 280, fill=1, stroke=0)
    c.setFillColor(HexColor("#0f1730"))
    c.circle(W * 0.15, H * 0.15, 200, fill=1, stroke=0)


def draw_logo_badge(c, x, y, size=60):
    """Draw VRIKAAN 'V' logo badge."""
    # Gradient-feel rounded square
    c.setFillColor(ACCENT)
    c.roundRect(x, y, size, size, size * 0.22, fill=1, stroke=0)
    c.setFillColor(CYAN)
    c.roundRect(x + 4, y + 4, size - 8, size - 8, size * 0.20, fill=1, stroke=0)
    # V letter
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", size * 0.55)
    text_w = c.stringWidth("V", "Helvetica-Bold", size * 0.55)
    c.drawString(x + (size - text_w) / 2, y + size * 0.27, "V")


def draw_brand_header(c):
    """Top-left logo + VRIKAAN text."""
    draw_logo_badge(c, 60, H - 110, 60)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(140, H - 90, "VRIKAAN")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 11)
    c.drawString(140, H - 108, "AI Cyber Defense")


def draw_swipe_hint(c, page_num, total):
    """Bottom 'swipe' indicator."""
    # Page dots
    dot_y = 60
    dot_size = 8
    spacing = 18
    total_w = (total - 1) * spacing + dot_size
    start_x = (W - total_w) / 2
    for i in range(total):
        if i == page_num - 1:
            c.setFillColor(CYAN)
        else:
            c.setFillColor(HexColor("#1f2937"))
        c.circle(start_x + i * spacing + dot_size / 2, dot_y, dot_size / 2, fill=1, stroke=0)

    # Swipe arrow (right-side, except last slide)
    if page_num < total:
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 14)
        c.drawRightString(W - 60, 50, "Swipe →")


def draw_url_footer(c):
    """Bottom-left URL."""
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, 50, "vrikaan.com")


def wrap_text(c, text, max_width, font, size):
    """Manually wrap text to fit max_width."""
    c.setFont(font, size)
    words = text.split()
    lines = []
    current = []
    for w in words:
        test = " ".join(current + [w])
        if c.stringWidth(test, font, size) <= max_width:
            current.append(w)
        else:
            if current:
                lines.append(" ".join(current))
            current = [w]
    if current:
        lines.append(" ".join(current))
    return lines


# ───────────────────────────────────────────────
# SLIDE 1 — Title / Hook
# ───────────────────────────────────────────────
def slide_1(c):
    gradient_bg(c)
    draw_brand_header(c)

    # Big "Now Live" pill
    c.setFillColor(HexColor("#0a3320"))
    c.roundRect(60, H - 200, 180, 40, 20, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(82, H - 188, "● NOW LIVE")

    # Massive headline
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 90)
    c.drawString(60, H - 380, "VRIKAAN")

    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 56)
    c.drawString(60, H - 460, "is live.")

    # Subtitle
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 32)
    c.drawString(60, H - 540, "AI-powered cyber defense")
    c.drawString(60, H - 580, "for everyone.")

    # Built-in-India badge
    c.setFillColor(HexColor("#1a1f3a"))
    c.roundRect(60, 160, 240, 50, 25, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(82, 178, "🇮🇳 Built in India")

    # Founder credit
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 13)
    c.drawString(60, 130, "by Sahil Anil Nikam · Solo founder")

    draw_url_footer(c)
    draw_swipe_hint(c, 1, 5)
    c.showPage()


# ───────────────────────────────────────────────
# SLIDE 2 — Problem
# ───────────────────────────────────────────────
def slide_2(c):
    gradient_bg(c)
    draw_brand_header(c)

    # Section label
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(60, H - 200, "● THE PROBLEM")

    # Massive stat
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 130)
    c.drawString(60, H - 350, "₹100Cr+")

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 26)
    c.drawString(60, H - 405, "lost to cybercrime in India in 2024")

    # Stats list
    y = H - 540
    stats = [
        ("4 in 10", "Indians faced phishing attempts"),
        ("75 minutes", "average time to lose money to a scam"),
        ("90%", "of small businesses are unprotected"),
    ]

    for big, small in stats:
        c.setFillColor(CYAN)
        c.setFont("Helvetica-Bold", 32)
        c.drawString(60, y, big)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 18)
        c.drawString(60, y - 28, small)
        y -= 90

    # Bottom punchline
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(60, 130, "Existing tools: too technical, too expensive,")
    c.drawString(60, 100, "or built for enterprises only.")

    draw_url_footer(c)
    draw_swipe_hint(c, 2, 5)
    c.showPage()


# ───────────────────────────────────────────────
# SLIDE 3 — Solution
# ───────────────────────────────────────────────
def slide_3(c):
    gradient_bg(c)
    draw_brand_header(c)

    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(60, H - 200, "● THE SOLUTION")

    # Hero text
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 72)
    c.drawString(60, H - 310, "AI cyber defense")

    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 72)
    c.drawString(60, H - 390, "for real people.")

    # Subtitle
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 24)
    lines = wrap_text(
        c,
        "Built for parents, students, freelancers, and small business owners — not enterprise IT teams.",
        W - 120, "Helvetica", 24,
    )
    y = H - 470
    for ln in lines:
        c.drawString(60, y, ln)
        y -= 32

    # Three principles
    principles = [
        ("Free to start", "No credit card. No spam."),
        ("Built for India", "₹ pricing. UPI. Hindi support coming."),
        ("Privacy first", "Your data never leaves our servers."),
    ]
    py = 290
    for title, desc in principles:
        c.setFillColor(ACCENT)
        c.circle(75, py + 10, 6, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(100, py + 4, title)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 16)
        c.drawString(100, py - 18, desc)
        py -= 60

    draw_url_footer(c)
    draw_swipe_hint(c, 3, 5)
    c.showPage()


# ───────────────────────────────────────────────
# SLIDE 4 — Features
# ───────────────────────────────────────────────
def slide_4(c):
    gradient_bg(c)
    draw_brand_header(c)

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(60, H - 200, "● WHAT YOU CAN DO")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 56)
    c.drawString(60, H - 280, "8 tools. One platform.")

    # 2x4 grid of features
    features = [
        ("✉", "Email Breach Scanner", "Scan against billions of leaks"),
        ("🔗", "Phishing Analyzer", "Check any URL in seconds"),
        ("🌐", "Threat Map", "Live global attack visualization"),
        ("🔐", "Password Vault", "Encrypted, breach-aware"),
        ("🕷", "Dark Web Monitor", "Get alerts when your data leaks"),
        ("⚡", "Fraud AI", "Detect scam calls and SMS"),
        ("🛡", "Vulnerability Scan", "Find weaknesses in your accounts"),
        ("📚", "Learn Academy", "Free cybersec courses"),
    ]

    cols = 2
    rows = 4
    box_w = 460
    box_h = 110
    gap_x = 40
    gap_y = 18
    start_x = 60
    start_y = H - 380

    for i, (icon, title, desc) in enumerate(features):
        col = i % cols
        row = i // cols
        x = start_x + col * (box_w + gap_x)
        y = start_y - row * (box_h + gap_y) - box_h

        c.setFillColor(BG_DARK2)
        c.roundRect(x, y, box_w, box_h, 12, fill=1, stroke=0)

        # Icon background
        c.setFillColor(HexColor("#1a1f3a"))
        c.roundRect(x + 14, y + 30, 50, 50, 10, fill=1, stroke=0)
        c.setFillColor(CYAN)
        c.setFont("Helvetica", 26)
        c.drawString(x + 26, y + 46, icon)

        # Title
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(x + 80, y + 68, title)
        # Desc
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 13)
        c.drawString(x + 80, y + 44, desc)

    draw_url_footer(c)
    draw_swipe_hint(c, 4, 5)
    c.showPage()


# ───────────────────────────────────────────────
# SLIDE 5 — CTA
# ───────────────────────────────────────────────
def slide_5(c):
    gradient_bg(c)
    draw_brand_header(c)

    # Big invitation
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 64)
    c.drawString(60, H - 280, "Try it free.")

    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 64)
    c.drawString(60, H - 360, "Right now.")

    # Body
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 24)
    lines = wrap_text(
        c,
        "I'm building this solo. Every signup, every piece of feedback genuinely helps me figure out what to ship next.",
        W - 120, "Helvetica", 24,
    )
    y = H - 440
    for ln in lines:
        c.drawString(60, y, ln)
        y -= 32

    # Big CTA box
    cta_y = 380
    c.setFillColor(ACCENT)
    c.roundRect(60, cta_y, W - 120, 130, 20, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(W / 2, cta_y + 75, "vrikaan.com")
    c.setFillColor(HexColor("#dde7ff"))
    c.setFont("Helvetica", 18)
    c.drawCentredString(W / 2, cta_y + 38, "Free · No credit card · 25 AI credits to start")

    # Ask
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(60, 290, "Would mean a lot if you:")

    asks = [
        "✓  Tried it (takes 30 seconds)",
        "✓  Told me what's broken",
        "✓  Shared with someone who'd care",
    ]
    ay = 240
    for a in asks:
        c.setFillColor(CYAN)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(60, ay, a)
        ay -= 36

    # Signature
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 14)
    c.drawString(60, 110, "— Sahil Anil Nikam, Founder")
    c.drawString(60, 90, "hello@vrikaan.com  ·  +91 8329935878")

    draw_swipe_hint(c, 5, 5)
    c.showPage()


# ───────────────────────────────────────────────
# Build
# ───────────────────────────────────────────────
def build():
    c = canvas.Canvas(OUTPUT, pagesize=(W, H))
    c.setTitle("VRIKAAN — Launch Carousel")
    c.setAuthor("Sahil Anil Nikam")

    slide_1(c)
    slide_2(c)
    slide_3(c)
    slide_4(c)
    slide_5(c)

    c.save()
    print(f"[OK] Generated: {OUTPUT}")
    print(f"     Size: {os.path.getsize(OUTPUT) / 1024:.1f} KB")


if __name__ == "__main__":
    build()
