"""
Generate the VideoOverlayKit logo via OpenRouter (Gemini Nano Banana).

Reads LLM_API_KEY from the repo root .env. Writes:
  docs/assets/logo.png       1024x1024 logo mark
  docs/assets/og.png         1200x630 social preview
"""

from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = REPO_ROOT.parent.parent / ".env"
ASSETS = REPO_ROOT / "docs" / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

MODEL = "google/gemini-3.1-flash-image-preview"
URL = "https://openrouter.ai/api/v1/chat/completions"


def load_env():
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def generate(prompt: str, out_path: Path):
    api_key = os.environ.get("LLM_API_KEY")
    if not api_key:
        sys.exit("LLM_API_KEY not set in environment or repo .env")

    payload = {
        "model": MODEL,
        "messages": [{
            "role": "user",
            "content": [{"type": "text", "text": prompt}],
        }],
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/alichherawalla/video-overlay-kit",
            "X-Title": "VideoOverlayKit Logo",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}")
        print(e.read().decode()[:3000])
        sys.exit(1)

    msg = body.get("choices", [{}])[0].get("message", {})
    for img in msg.get("images", []) or []:
        url = img.get("image_url", {}).get("url") if isinstance(img, dict) else None
        if url and url.startswith("data:"):
            b64 = url.split(",", 1)[1]
            out_path.write_bytes(base64.b64decode(b64))
            print(f"wrote {out_path} ({out_path.stat().st_size} bytes)")
            return
    print("No image found in response.")
    print(json.dumps(body, indent=2)[:2000])
    sys.exit(1)


LOGO_PROMPT = """A clean modern logo mark for a developer tool called VideoOverlayKit.

The mark is a single geometric symbol on a transparent or near-white background.
It combines two ideas: a play-triangle (forward-pointing) nested inside stacked
overlay layers (rectangles offset slightly to suggest depth). The shape reads as
both 'video' and 'layered overlay'.

Use a soft sunset gradient inside the shape: pink (#DE7BAD) at the top-left
flowing through orchid (#B153D3), into lavender-bright (#A485F5), and finishing
at deep lavender (#5A3DB8) at the bottom-right. Smooth, vector-style fills with
clean edges, no photographic texture.

Background: solid pure white #FFFFFF. The mark fills roughly 70% of the canvas,
centred, with comfortable margins. Square 1:1 canvas.

Aesthetic: minimal, geometric, premium developer-tool brand. Think Linear, Vercel,
Stripe in style sensibility, with lavender as the dominant brand colour.

No text. No tagline. Just the symbol. No drop shadows. No 3D bevels. Pure flat
vector design."""

OG_PROMPT = """A social-card hero image for a developer tool called VideoOverlayKit,
1.91:1 aspect ratio, 1200x630 layout in mind. Left side: the same geometric logo
mark - a play-triangle nested inside stacked overlay rectangles - filled with a
sunset gradient running from pink (#DE7BAD) through orchid (#B153D3) and lavender
(#A485F5) to deep lavender (#5A3DB8). Right side: the wordmark 'VideoOverlayKit'
in clean modern sans-serif (think Inter Bold), in deep charcoal #0B0B0D, with a
short subtitle 'b-roll for technical videos' below it in lighter grey #6B6B7E.

Background: a soft off-white #F0EDF8 with a very subtle radial bloom of lavender
in the upper area. Pure flat vector design, no photography, no 3D. Premium
developer-tool brand aesthetic."""


def main():
    load_env()
    generate(LOGO_PROMPT, ASSETS / "logo.png")
    generate(OG_PROMPT, ASSETS / "og.png")


if __name__ == "__main__":
    main()
