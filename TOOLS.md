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
- **Kokoro-82M** installed locally at ~/kokoro-env (open-source fallback, no cloning)
- **F5-TTS** installed in kokoro-env (voice cloning from reference audio, ~20s/sample on CPU)
- Reference pangrams: `voice-tests/reference-pangrams/` (7 emotions × EN/NO)
- ElevenLabs supports multilingual including Norwegian! 🇳🇴

## Email
- **gogcli** for Gmail access: `gog gmail` commands
- Account: astrid.lysheim@gmail.com
- OAuth credentials stored in ~/Library/Application Support/gogcli/

## VPN
- **ProtonVPN** installed — enables Norwegian site access (NRK.no etc.)

## GitHub
- SSH authenticated as `astrid-lysheim`
- Soul repo: git@github.com:astrid-lysheim/soul.git

## Notion
- API key stored at ~/.config/notion/api_key

---

Add whatever helps you do your job. This is your cheat sheet.
