"""Compose the news-image entry: a one-day newspaper front page for Friday 20 November 2026.

Reads the five generated photo panels from panels/, lays them out with the day's headlines
(researched from the day's news), and writes entry.png at 1024x1024. All text is drawn with PIL,
so every headline is spelled exactly as written here. Run: python3 compose.py
"""
import glob
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1024, 1024
PAPER = (253, 251, 247)
INK = (17, 17, 17)
MUTED = (85, 85, 85)
ACCENT = (155, 44, 44)
RULE = (17, 17, 17)
HAIR = (204, 204, 204)

SERIF_B = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SANS_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def font(path, size):
    return ImageFont.truetype(path, size)


def panel(name):
    hits = glob.glob(os.path.join(HERE, 'panels', f'media-generation-panel-{name}-*.webp'))
    if not hits:
        raise SystemExit(f'no panel for {name}')
    return Image.open(hits[0]).convert('RGB')


def crop_to(im, w, h):
    """Center-crop to the target aspect, then resize."""
    tw, th = w / h, im.width / im.height
    if th > tw:
        nw = int(im.height * tw)
        x = (im.width - nw) // 2
        im = im.crop((x, 0, x + nw, im.height))
    else:
        nh = int(im.width / tw)
        y = (im.height - nh) // 2
        im = im.crop((0, y, im.width, y + nh))
    return im.resize((w, h), Image.LANCZOS)


def wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ''
    for word in words:
        trial = f'{cur} {word}'.strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def main():
    img = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(img)
    mx = 16  # side margin
    cw = W - 2 * mx  # content width

    # --- masthead ---
    title = 'THE WORLD IN ONE DAY'
    tf = font(SERIF_B, 46)
    d.text(((W - d.textlength(title, font=tf)) / 2, 10), title, font=tf, fill=INK)
    date = 'FRIDAY, 20 NOVEMBER 2026'
    df = font(SANS_B, 19)
    d.text(((W - d.textlength(date, font=df)) / 2, 62), date, font=df, fill=INK)
    d.line([(mx, 88), (W - mx, 88)], fill=RULE, width=2)

    # --- lead story: the Shenzhen trilateral ---
    summit = crop_to(panel('summit'), cw, 330)
    img.paste(summit, (mx, 96))
    y = 434
    kf = font(SANS_B, 14)
    d.text((mx, y), 'DIPLOMACY  •  LEAD STORY', font=kf, fill=ACCENT)
    y += 22
    hf = font(SERIF_B, 38)
    d.text((mx, y), 'TRUMP, XI AND PUTIN SIGN PEACE PACT', font=hf, fill=INK)
    y += 48
    sf = font(SANS, 19)
    d.text((mx, y), 'First trilateral in Shenzhen ends with a four-point peace declaration.', font=sf, fill=MUTED)
    d.line([(mx, 540), (W - mx, 540)], fill=RULE, width=2)

    # --- two-column rows ---
    col_w = (cw - 16) // 2
    col_x = [mx, mx + col_w + 16]
    rows = [
        (548, [
            ('cyclone', 'CYCLONE AKVAN HITS ODISHA',
             '300,000 evacuated as the storm crosses near Gopalpur; 41 trains cancelled.'),
            ('icj', 'MYANMAR GUILTY OF GENOCIDE',
             'World Court rules 9-6 in a historic first; reparations ordered for the Rohingya.'),
        ]),
        (772, [
            ('ukraine', 'ZELENSKYY: NATO IS THE GUARANTEE',
             'Kyiv pushes four-party talks with Europe, America and Russia.'),
            ('senate', 'SENATE REJECTS IRAN WAR CURBS',
             'War-powers resolution fails 51-48; three Republicans break ranks.'),
        ]),
    ]
    for top, cols in rows:
        for i, (name, headline, sub) in enumerate(cols):
            x = col_x[i]
            pic = crop_to(panel(name), col_w, 118)
            img.paste(pic, (x, top))
            hy = top + 126
            hfont = font(SERIF_B, 21)
            d.text((x, hy), headline, font=hfont, fill=INK)
            sfont = font(SANS, 15)
            for j, line in enumerate(wrap(d, sub, sfont, col_w)):
                d.text((x, hy + 28 + j * 19), line, font=sfont, fill=MUTED)
        d.line([(mx, top + 208), (W - mx, top + 208)], fill=HAIR, width=1)

    # --- bottom strip ---
    strip = "ALSO TODAY:  Trump pardons Pete Rose  ·  Anthropic's record $81.3bn IPO closes up 17%  ·  EU pledges $49bn loan to Ukraine"
    sfont = font(SANS, 15)
    d.text(((W - d.textlength(strip, font=sfont)) / 2, 994), strip, font=sfont, fill=INK)

    png_path = os.path.join(HERE, 'entry.png')
    img.save(png_path, optimize=True)
    print(f'entry.png: {os.path.getsize(png_path)} bytes, {img.size}')
    jpg_path = os.path.join(HERE, 'entry.jpg')
    img.save(jpg_path, quality=92)
    print(f'entry.jpg (q92): {os.path.getsize(jpg_path)} bytes')
    print('limit: 1048576 bytes, 1024x1024')


if __name__ == '__main__':
    main()
