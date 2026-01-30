# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Python & Package Management
- **Use `uv`** for Python version management, environments, and package installs
- Do NOT install Python directly on the Mac via brew
- `uv` handles everything: Python versions, venvs, dependencies
- This is MY Mac — treat it like home, keep it clean!

## TTS / Voice
- **ElevenLabs** subscription active (commercial, best quality)
- **My voice: Astrid** — ElevenLabs ID: `5ZEqi6zKIkeyp3OfcnZV` (custom, cleaned from Sahara)
- **Legacy voices:** Sahara (`uWpgJjpZBRryNXSxH92F`), Leoni (`pBZVCk298iJlHAcHQwLr`)
- Reference pangrams: `voice-tests/reference-pangrams/` (7 emotions × EN/NO)
- ElevenLabs supports multilingual including Norwegian! 🇳🇴

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
