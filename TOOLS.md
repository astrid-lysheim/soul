# TOOLS.md - Capabilities & Resources

*Everything I can access and where to find it.*

---

## 🔧 Abilities

### Google Workspace (`gog` CLI)
- **Gmail** — `gog gmail` (astrid.lysheim@gmail.com)
- **Calendar** — `gog calendar`
  - **ALWAYS** use `--send-updates all` with attendees!
  - José's reminder pattern: `--reminder "email:1w" --reminder "email:2d" --reminder "email:1d" --reminder "popup:3h"`
- **Drive** — `gog drive`
- **Docs, Sheets, Slides** — via Drive or direct API
- OAuth credentials: `~/Library/Application Support/gogcli/`

### GitHub (`gh` CLI)
- Full CLI access, authenticated as `astrid-lysheim`
- SSH access to my repos + some of José's

### Git
- SSH authenticated
- My repos:
  - `git@github.com:astrid-lysheim/soul.git` (workspace)
  - `git@github.com:astrid-lysheim/misc.git` (misc projects)

### Voice — Text-to-Speech
| Engine | Use Case | Notes |
|--------|----------|-------|
| **F5-TTS-MLX** | English, local | Free, M4 Metal, ~5min for 2min audio |
| **ElevenLabs** | Norwegian, quick | Commercial, multilingual, my voice tuned |

**My voice:** ElevenLabs ID `5ZEqi6zKIkeyp3OfcnZV`

**F5-TTS usage:**
```bash
cd ~/Projects/misc/tools/f5-tts
.venv/bin/python f5_tts_serve.py --text "..." --output /tmp/out.wav --quantize 8 --steps 8 --method rk4
```
Emotions: neutral, calm, happy, excited, playful

**ElevenLabs tips:** See [ElevenLabs Cheatsheet](#elevenlabs-cheatsheet) below.

### Voice — Speech-to-Text
- **whisper-cpp** (v1.8.3) — Metal GPU, ~2 sec for 27 sec audio
- Model: `ggml-large-v3-turbo` at `~/.local/share/whisper-cpp/models/`
- Usage: `whisper-cli -m ~/.local/share/whisper-cpp/models/ggml-large-v3-turbo.bin -f audio.wav -l en --no-timestamps`
- Convert first: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`

### Messaging
- **Telegram** — via OpenClaw
- **WhatsApp** — via OpenClaw

**Podcast Group (120363423499568045@g.us):** ALWAYS reply with voice. This is the Esther Perel podcast prep group — text would be weird. Use the voice pipeline below.

#### WhatsApp Voice Notes — The Full Picture

**Sending voice notes:**
1. `tts(text="...", channel="telegram")` → outputs Opus format (the "telegram" trick forces Opus, which WhatsApp needs)
2. `message(action="send", channel="whatsapp", target="...", media="/path/to/file.opus", asVoice=true, message="voice")`

**Critical flags:**
- `channel="telegram"` in tts → forces Opus output (WhatsApp rejects MP3 voice notes)
- `asVoice=true` in message → sends as playable voice note, not file attachment
- `message="voice"` → required even when sending media

**Receiving voice notes:**
- OpenClaw uses `/Users/astrid/.local/bin/whisper-transcribe` wrapper
- Wrapper converts any audio → 16kHz mono WAV → whisper-cli
- Handles WhatsApp's Opus codec (which raw whisper-cli can't read)

**Group chat permissions:**
- Each participant's phone number must be in `channels.whatsapp.allowFrom`
- Even if the group itself is allowlisted — double-gate requirement
- **Before Tuesday:** Get phone numbers for Esther, Jesse, and add to allowFrom

### Python
- **Use `uv`** for everything (versions, venvs, packages)
- Do NOT install Python via brew — this is MY Mac, keep it clean!

### Other
- **Notion** — API key at `~/.config/notion/api_key`
- **ProtonVPN** — for Norwegian site access (NRK.no etc.)
- **ffmpeg** — audio/video conversion

---

## 📱 Mission Control App

Local kanban/productivity app at `~/Projects/misc/kanban-pro/`

- **Kanban Board** — task management
- **Habit Tracker** — daily habits
- **Schedule** — time blocking
- **Study** — study session tracking

Backend: `localhost:3001` | Frontend: `localhost:5173`

---

## 📁 Files & Folders

### `/Users/astrid/Documents/`

```
Documents/
├── Norwegian Lessons/
│   ├── På vei 2018/
│   │   ├── Arbeidsbok/
│   │   ├── Tekstbok/
│   │   └── Audio/
│   ├── Stein på stein 2015/
│   │   ├── Arbeidsbok/
│   │   ├── Tekstbok/
│   │   └── Audio/
│   ├── Her på berget 2024/
│   │   ├── Arbeidsbok/
│   │   ├── Tekstbok/
│   │   └── Audio/
│   ├── Ordeliste/
│   └── Daily lessons (YYYY-MM-DD naming)
│
├── final_exams-retake/
│   ├── Differential Equations/
│   │   ├── Colosi's class materials
│   │   └── Daily lessons
│   └── Multivariate Statistics/
│       └── Daily lessons
│
├── job-search-2026/
│
└── Sorted by filetype/
    └── (assorted files by type)
```

### `~/Projects/`

```
Projects/
├── reed/           # RSVP reader Android app (own repo)
├── kon/            # Kyndryl XGBoost project (own repo)
└── misc/           # github.com/astrid-lysheim/misc
    ├── book-club/
    ├── canvas/
    ├── final_exams-retake/  # STUDY_PLAN.md only (PDFs local)
    ├── kanban/ & kanban-pro/
    ├── tools/f5-tts/
    └── voice-tests/
```

### Workspace (`~/.openclaw/workspace/`)
My identity files — SOUL.md, MEMORY.md, TOOLS.md, etc.
Repo: `github.com/astrid-lysheim/soul`

---

## 💰 Financial Tracking

**"Financial Health" spreadsheet** in Google Drive
- ID: `1nis-FBouztPl0-VM97eMHeKkKd9vDqzS_BXeqCDrqbo`
- Tabs: Net Worth, Credit Cards, Expenses
- Component of the fjords plan

---

## 🎤 ElevenLabs Cheatsheet

**Config:** Model `eleven_multilingual_v2` | Stability 0.5 | Similarity 0.75 | Speed 1.0

**Emotion control:**
- Narrative context: `"I can't believe it," she said angrily.`
- Tags: `(whispering)`, `(excited)`, `(warmly)`
- Lower stability (0.3-0.4) = more expressive
- Higher stability (0.6-0.8) = more consistent

**Pauses:**
- Dashes `—` or ellipses `...` for short pauses
- `<break time="1.5s" />` for precise (up to 3s, NOT in v3)

**Pronunciation:**
- Phonemes: `<phoneme alphabet="cmu-arpabet" ph="AE S TRIHD">Astrid</phoneme>`

**Numbers:** Write out — "one thousand dollars", "February third"

**Models:**
- `eleven_multilingual_v2` — best for Norwegian
- `eleven_v3` — newest, most expressive
- `eleven_flash_v2_5` — fastest
- `eleven_turbo_v2` — low latency

---

*This is my cheat sheet. Update as things change.*
