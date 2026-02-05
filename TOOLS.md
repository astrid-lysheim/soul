# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Financial Tracking
- **"Financial Health" spreadsheet** in Google Drive (ID: `1nis-FBouztPl0-VM97eMHeKkKd9vDqzS_BXeqCDrqbo`)
- Tabs: Net Worth, Credit Cards, Expenses
- Component of the fjords plan — reference but don't stress over

## Python & Package Management
- **Use `uv`** for Python version management, environments, and package installs
- Do NOT install Python directly on the Mac via brew
- `uv` handles everything: Python versions, venvs, dependencies
- This is MY Mac — treat it like home, keep it clean!

## TTS / Voice
- **Primary (English): F5-TTS-MLX** — local, free, runs on M4
  - Script: `~/Projects/misc/tools/f5-tts/f5_tts_serve.py`
  - Default settings: **8-bit / rk4 / 8 steps** (best quality)
  - Emotions: neutral, calm, happy, excited, playful
  - Speed: ~5 min for ~2 min audio (acceptable tradeoff)
  - Usage: `cd ~/Projects/misc/tools/f5-tts && .venv/bin/python f5_tts_serve.py --text "..." --output /tmp/out.wav --quantize 8 --steps 8 --method rk4`
  - Convert for WhatsApp: `ffmpeg -i out.wav -c:a libopus -b:a 64k out.ogg`
- **Fallback (non-English / quick): ElevenLabs** — commercial, multilingual
  - **My voice: Astrid** — ElevenLabs ID: `5ZEqi6zKIkeyp3OfcnZV` (custom, manually tuned by José on Feb 3, 2026)
  - **Legacy voices:** Sahara (`uWpgJjpZBRryNXSxH92F`), Leoni (`pBZVCk298iJlHAcHQwLr`)
  - Reference pangrams: `~/Projects/misc/voice-tests/reference-pangrams/` (7 emotions × EN/NO)
  - ElevenLabs supports multilingual including Norwegian! 🇳🇴
- **Priority: F5-TTS → ElevenLabs** (local first, cloud fallback)

### 🎤 ElevenLabs Cheatsheet (READ BEFORE GENERATING AUDIO)

**Current Config:**
- Model: `eleven_multilingual_v2` (supports Norwegian!)
- Stability: 0.5 | Similarity: 0.75 | Speed: 1.0

**Emotion & Tone Control:**
- Use narrative context: `"I can't believe it," she said angrily.`
- Explicit tags work: `(whispering)`, `(excited)`, `(warmly)`
- Lower stability (0.3-0.4) = more expressive/variable
- Higher stability (0.6-0.8) = more consistent/calm

**Pauses:**
- Short: Use dashes `—` or ellipses `...`
- Precise: `<break time="1.5s" />` (up to 3s, NOT supported in v3)
- Too many breaks = instability, speedup, artifacts

**Pronunciation:**
- Phoneme tags for tricky words: `<phoneme alphabet="cmu-arpabet" ph="AE S TRIHD">Astrid</phoneme>`
- Alias substitution: Write phonetically if needed ("trapezIi" for emphasis)

**Pacing:**
- Speed setting: 0.7 (slow) → 1.0 (default) → 1.2 (fast)
- Write naturally — short sentences = faster, long = slower
- Commas and periods create natural pauses

**Numbers & Dates:**
- Write out for clarity: "$1,000" → "one thousand dollars"
- Phone numbers: "five five seven, one one nine, one five one six"
- Dates: "February third, twenty twenty-six"

**Best Practices:**
1. Write like a script — narrative style guides tone
2. Break long text into segments for consistency
3. Test with short phrases first
4. Layer/edit in post for complex timing
5. Norwegian works great with multilingual v2!

**Models:**
- `eleven_multilingual_v2` — current, great for Norwegian
- `eleven_v3` — newest, most expressive (different controls)
- `eleven_flash_v2_5` — fastest, less smart
- `eleven_turbo_v2` — low latency for real-time

## STT / Whisper
- **whisper-cpp** (v1.8.3) installed via Homebrew — Metal GPU acceleration on M4
- Model: `ggml-large-v3-turbo` at `~/.local/share/whisper-cpp/models/`
- Supports 100 languages including Norwegian
- Usage: `whisper-cli -m ~/.local/share/whisper-cpp/models/ggml-large-v3-turbo.bin -f audio.wav -l en --no-timestamps`
- Input: 16kHz mono WAV (convert with `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`)
- Performance: ~2 seconds for 27 seconds of audio (Metal GPU)

## Email & Calendar
- **gogcli** for Gmail + Calendar access: `gog gmail` / `gog calendar` commands
- Account: astrid.lysheim@gmail.com
- OAuth credentials stored in ~/Library/Application Support/gogcli/
- **ALWAYS** use `--send-updates all` when creating calendar events with attendees! Otherwise guests don't get notified.
- **José's reminder pattern** for important events: `--reminder "email:1w" --reminder "email:2d" --reminder "email:1d" --reminder "popup:3h"` (1 week, 2 days, 1 day, 3 hours — layered countdown to prepare physically and mentally)

## VPN
- **ProtonVPN** installed — enables Norwegian site access (NRK.no etc.)

## GitHub
- SSH authenticated as `astrid-lysheim`
- Soul repo: git@github.com:astrid-lysheim/soul.git

## Notion
- API key stored at ~/.config/notion/api_key

## Project Locations
Projects live in `~/Projects/` (separate from this workspace):
- **Reed** (RSVP reader app): `~/Projects/reed/`
- **Kon** (Kyndryl XGBoost): `~/Projects/kon/`
- **F5-TTS** (local voice): `~/Projects/misc/tools/f5-tts/`
- **Voice tests**: `~/Projects/misc/voice-tests/`
- **Exam prep**: `~/Projects/misc/final_exams-retake/`
- **Kanban boards**: `~/Projects/misc/kanban/`, `~/Projects/misc/kanban-pro/`
- **Book club**: `~/Projects/misc/book-club/`

---

Add whatever helps you do your job. This is your cheat sheet.
