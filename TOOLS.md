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
  - Script: `tools/f5-tts/f5_tts_serve.py`
  - Default settings: **8-bit / rk4 / 8 steps** (best quality)
  - Emotions: neutral, calm, happy, excited, playful
  - Speed: ~5 min for ~2 min audio (acceptable tradeoff)
  - Usage: `.venv/bin/python f5_tts_serve.py --text "..." --output /tmp/out.wav --quantize 8 --steps 8 --method rk4`
  - Convert for WhatsApp: `ffmpeg -i out.wav -c:a libopus -b:a 64k out.ogg`
- **Fallback (non-English / quick): ElevenLabs** — commercial, multilingual
  - **My voice: Astrid** — ElevenLabs ID: `5ZEqi6zKIkeyp3OfcnZV` (custom, cleaned from Sahara)
  - **Legacy voices:** Sahara (`uWpgJjpZBRryNXSxH92F`), Leoni (`pBZVCk298iJlHAcHQwLr`)
  - Reference pangrams: `voice-tests/reference-pangrams/` (7 emotions × EN/NO)
  - ElevenLabs supports multilingual including Norwegian! 🇳🇴
- **Priority: F5-TTS → ElevenLabs** (local first, cloud fallback)

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

---

Add whatever helps you do your job. This is your cheat sheet.
