"""Build side-by-side comparison: reference mockup vs implemented screens."""
from PIL import Image

mock = Image.open("/home/z/my-project/handoff-extract/a_wide_clean_pastel_ui_mockup_scene_showing_four.png")
# mockup: 1572x856, four phone frames ~370px wide each
# crop each phone screen roughly: x centers at ~196, 588, 980, 1372 (width ~372)
frames = []
for i, x0 in enumerate([10, 402, 794, 1186]):
    frames.append(mock.crop((x0, 8, x0 + 372, 848)))

shots = [
    Image.open(f"/home/z/my-project/scripts/qa/final-{n}.png")
    for n in ["welcome", "home", "stats", "members"]
]

H = 720
def scale(im, h=H):
    w = int(im.width * h / im.height)
    return im.resize((w, h))

frames = [scale(f) for f in frames]
shots = [scale(s) for s in shots]

GAP, PAD = 12, 16
total_w = PAD * 2 + sum(f.width for f in frames) + sum(s.width for s in shots) + GAP * 7
canvas = Image.new("RGB", (total_w, H + 44), "#FFF9FC")

from PIL import ImageDraw
d = ImageDraw.Draw(canvas)
x = PAD
for f in frames:
    canvas.paste(f, (x, 36))
    x += f.width + GAP
x += 8  # divider space
d.rectangle([x, 8, x + 2, H + 30], fill="#F6CDE0")
x += 10
for i, s in enumerate(shots):
    canvas.paste(s, (x, 36))
    x += s.width + GAP

d.text((PAD, 10), "REFERENCE MOCKUP (left)  —  IMPLEMENTED SCREENS (right)", fill="#38293A")
canvas.save("/home/z/my-project/scripts/qa/comparison-side-by-side.png", optimize=True)
print("saved", canvas.size)
