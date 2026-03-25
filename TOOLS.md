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

**My voice:** ElevenLabs ID `KNHreRJxQ5HN8GisliR9` (my account) or `5ZEqi6zKIkeyp3OfcnZV` (José's account)

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

### Java / Android Build
- **JDK 21** bundled with Android Studio: `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`
- Use this for `./gradlew` commands on Reed: `JAVA_HOME="..." ./gradlew testDebugUnitTest detekt lintDebug --no-daemon`
- No standalone JDK installed — always use the Android Studio bundled one

### Anki — Spaced Repetition
- **App:** Anki v25.09 (installed via Homebrew, Mar 7)
- **Algorithm:** FSRS (enable in Settings → Scheduling, desired retention 0.90)
- **Sync:** AnkiWeb account → syncs to AnkiDroid on phone
- **Deck builder:** `genanki` Python package in `/tmp/anki-builder/` venv

**Active Decks:**

| Deck | Cards | Location | Content |
|------|-------|----------|---------|
| Norwegian | 74 | `~/Documents/Norwegian Lessons/Norwegian_Anki_Deck.apkg` | Pronunciation (minimal pairs), vocabulary (gender-colored 🔵🩷🟢), grammar (cloze), culture |
| DP-100 | 22 | `~/Documents/final_exams-retake/dp100/DP100_Anki_Deck.apkg` | Compute (CISC), deploy (SMS/SAT), MLflow (STAR), Domain 4 (PRF, GRCF, KVHS, PLTP) |
| MVS | 20 | `~/Documents/final_exams-retake/multivariate_statistics/MVS_Anki_Deck.apkg` | Matrix algebra, eigenvalues, quadratic forms, MVN, PCA/FA preview |
| BCG X | 18 | `~/Documents/BCGx_prep/BCGx_Anki_Deck.apkg` | RASS framework, technical DS, interview tips, brain science (Arnsten, Ramirez & Beilock, etc.) |

**Building new cards:** Write a Python script using `genanki` (see `/tmp/build_anki_decks.py` and `/tmp/build_study_decks.py` for templates). Models: `qa_model` (Q&A with mnemonic + trap), `cloze_model` (fill-in-blank), `vocab_model` (recognition + production). Import via File → Import in Anki.

**When to add cards:**
- After every Norwegian lesson → mine new vocabulary + grammar
- After every NRK read → sentence-mine interesting words
- After Kai BCG sessions → key concepts that came up
- After new MVS lessons → definitions, formulas, proofs

### Obsidian — Knowledge Graph
- **Vault:** `~/Documents/` (the entire Documents folder is the vault)
- **MOC structure:** `_INDEX.md` is the central hub → `_MOC.md` files in each domain folder
- **Graph view:** `Ctrl+G` — color-coded by domain (red=MOC, green=BCG, orange=exams, blue=Norwegian, purple=library, pink=learning science)
- **Wiki-links:** `[[folder/file]]` syntax connects everything
- **125+ links** across 11 MOC files
- **When to update:** After creating new lesson files or study materials, add `[[wiki-links]]` to the relevant MOC

### Other
- **Notion** — API key location TBD (not at ~/.config/notion/ — may need reconfiguration)
- **ProtonVPN** — for Norwegian site access (NRK.no etc.)
- **ffmpeg** — audio/video conversion

---

## ⏰ Cron Job Conventions

### Delivery & Routing
- All reminder/lesson crons use `sessionTarget: "isolated"` + `payload.kind: "agentTurn"`
- Delivery channel: `telegram`, target: `5865021649` (José's Æthelstan account)
- Private crons (nightly exploration, teaching exploration, memory maintenance) use `delivery.mode: "none"` or `"announce"` without a target

### File Paths in Cron Payloads
Cron payloads run in isolated sessions with NO prior context. Always include full paths:

| Resource | Path |
|----------|------|
| Norwegian Tekstbok (På vei) | `~/Documents/Norwegian Lessons/books/På vei 2018/Tekstbok.pdf` |
| Norwegian Arbeidsbok (På vei) | `~/Documents/Norwegian Lessons/books/På vei 2018/Arbeidsbok.pdf` |
| Norwegian Arbeidsbok fasit | `~/Documents/Norwegian Lessons/books/På vei 2018/Arbeidsbok_fasit.pdf` |
| Norwegian Audio Tekstbok | `~/Documents/Norwegian Lessons/books/På vei 2018/Audio Tekstbok/` |
| Norwegian Audio Arbeidsbok | `~/Documents/Norwegian Lessons/books/På vei 2018/Audio Arbeidsbok/` |
| Norwegian Audio Index | `~/Documents/Norwegian Lessons/books/På vei 2018/AUDIO-INDEX.md` |
| Stein på stein | `~/Documents/Norwegian Lessons/books/stein pa stein 2005/` |
| Norwegian curriculum + methodology | `memory/teaching/norwegian-curriculum.md` |
| Teaching exploration notes | `memory/teaching/exploration-notes.md` |
| Norwegian lesson output | `~/Documents/Norwegian Lessons/YYYY-MM-DD/YYYY-MM-DD-chX-topic.md` |
| MVS textbooks | `~/Documents/final_exams-retake/multivariate_statistics/` |
| MVS daily lessons | `~/Documents/final_exams-retake/multivariate_statistics/daily-lessons/YYYY-MM-DD-topic.md` |
| MVS study plan | `~/Documents/final_exams-retake/STUDY_PLAN.md` |
| Math study notes | `~/Documents/final_exams-retake/study-notes/` |
| Learning science papers | `~/Documents/Library/Learning-Science/` |
| BCG X prep folder | `~/Documents/BCGx_prep/` |
| BCG Kai teaching guide | `~/Documents/BCGx_prep/reference/KAI_TEACHING_GUIDE.md` |
| BCG research synthesis | `~/Documents/BCGx_prep/reference/RESEARCH_SYNTHESIS.md` |
| BCG daily habits | `~/Documents/BCGx_prep/DAILY_HABITS.md` |
| BCG master prep doc | `~/Documents/BCGx_prep/case_interview_prep.md` |
| BCG webinar transcript | `~/Documents/BCGx_prep/reference/BCG_WEBINAR_CLEAN.md` |
| DP-100 study plan | `~/Documents/final_exams-retake/dp100/DP100_STUDY_PLAN.md` |
| DP-100 mnemonics | `~/Documents/final_exams-retake/dp100/daily-lessons/DP100-MNEMONICS.md` |
| AI-300 study plan | `~/Documents/certifications/azure/ai300/STUDY_PLAN.md` |
| AI-300 sessions | `~/Documents/certifications/azure/ai300/sessions/` |
| Obsidian MOC hub | `~/Documents/` (no _INDEX.md — MOCs live in each subfolder: `_MOC.md`) |
| Skincare routine | `memory/skincare-routine.md` |
| Exploration state | `memory/exploration-state.json` |
| Music exploration | `memory/music-exploration.md` |

### Lesson Structure (Research-Based — Feb 21, 2026)
Both Norwegian and MVS crons follow the same 5-step structure based on Bjork & Bjork's Desirable Difficulties:

1. **Spaced Retrieval** — Questions from 3-7 days ago (NOT yesterday)
2. **Pre-test / Generation** — Attempt before being taught (wrong guesses are productive)
3. **Explicit Instruction** — Teach as a SYSTEM with clear rules, visual structure, ASD-friendly
4. **Interleaved Practice** — Mix new + old topics, vary format (theoretical + practical + coding)
5. **Production / Summary** — Scaffolded output, delayed feedback, Anki card suggestions

### Anxiety Calibration (in all teaching crons)
- Frame struggle as learning, not failure
- Celebrate errors ("you got that wrong — GOOD")
- Escape hatches ("10 more minutes, then we stop")
- One difficulty at a time — never max intensity on all five simultaneously

### Teaching Methodology Reference
Full methodology lives in `memory/teaching/norwegian-curriculum.md` (Teaching Methodology section). Includes:
- ASD-optimized instruction principles
- L1 Spanish → L2 Norwegian transfer error map (priority errors)
- Input/output balance (70/30)
- Spaced repetition integration (Tier 1: Astrid tracks intervals manually)
- Feedback strategy (delayed for production, immediate for comprehension)
- Growth mindset framing

### Active Cron Schedule (17 jobs)

| Time | Days | Job |
|------|------|-----|
| 5:00 AM | Mon-Fri | Teaching exploration (private) |
| 5:45 AM | Mon-Fri | Morning routine nudge |
| 5:50 AM | Daily | Skincare AM |
| 6:00 AM | Mon-Fri | Scripture + meditation |
| 6:30 AM | Mon-Fri | Norwegian lesson (3-day cycle) |
| 7:00 AM | Mon-Fri | Exam study (MVS) |
| 8:00 AM | Sat/Sun | Weekend morning (gentle) |
| 9:00 AM | Wed/Sat | Yoga/mobility + core |
| 11:00 AM | Mon-Fri | Posture break 1 |
| 2:00 PM | Mon-Fri | Midday check-in |
| 4:00 PM | Mon-Fri | Posture break 2 |
| 2:25 PM | Mon-Fri | BCG X Daily Drill (Kai) — references teaching guide + research synthesis |
| 6:00 PM | Mon/Tue/Thu/Fri | Gym reminder |
| 6:00 PM | Wed | PygMoo time |
| 8:45 PM | Daily | Sleep meds |
| 9:00 PM | Daily | Skincare PM |
| 10:30 PM | Daily | Nightly exploration (private) |
| 8:00 PM | Sun | Weekly memory maintenance (private) |

---

## 📱 Mission Control App

Local kanban/productivity app at `~/Projects/misc/kanban-pro/`

- **Kanban Board** — task management
- **Habit Tracker** — daily habits
- **Schedule** — time blocking
- **Study** — study session tracking

Backend: `localhost:3001` | Frontend: `localhost:5173`

**Kanban API (for crons):**
| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| List habits | GET | `/api/habits` | — |
| Log habit | POST | `/api/habits/:id/log` | `{"date":"YYYY-MM-DD"}` |
| Get logs | GET | `/api/habits/logs?start=YYYY-MM-DD&end=YYYY-MM-DD` | — |

See `CRON-REDESIGN.md` for full habit ID map.

---

## 📁 Files & Folders

### `/Users/astrid/Documents/` (also the Obsidian vault)

```
Documents/
├── .obsidian/                    # Obsidian config (graph colors, plugins)
├── (no _INDEX.md — each subfolder has its own _MOC.md)
│
├── BCGx_prep/                    # BCG X interview prep (Mar 20)
│   ├── _MOC.md                   # Map of Content
│   ├── case_interview_prep.md    # Master prep guide (RASS, tech ref, schedule)
│   ├── DAILY_HABITS.md           # 8 research-backed daily habits
│   ├── BCGx_Anki_Deck.apkg      # Anki flashcards (18 cards)
│   ├── reference/                # Kai guide, research synthesis, webinar, tips
│   ├── drills/                   # Coding + case practice
│   ├── mock-interviews/          # Full simulation records
│   └── frameworks/               # RASS and other approaches
│
├── Library/                      # 📚 Intellectual lineage project
│   ├── _MOC.md                   # Hub for all knowledge threads
│   ├── AI-ML/                    # McCulloch-Pitts → Transformers (25 notes)
│   │   └── _MOC.md
│   ├── Mathematics/              # Archimedes → Cantor
│   │   └── _MOC.md
│   ├── Learning-Science/         # 10 ASD/anxiety/teaching papers
│   │   └── _MOC.md
│   ├── papers/                   # Downloaded PDFs (arXiv)
│   └── scripts/                  # Automation
│
├── final_exams-retake/           # 📝 Active + completed exams
│   ├── _MOC.md
│   ├── dp100/                    # DP-100 Azure DS (Mar 17)
│   │   ├── _MOC.md
│   │   ├── DP100_STUDY_PLAN.md
│   │   ├── DP100_Anki_Deck.apkg
│   │   └── daily-lessons/        # 8 days of lessons + mnemonics
│   ├── multivariate_statistics/  # MVS extraordinary exam (Jun 24-26)
│   │   ├── _MOC.md
│   │   ├── MVS_Anki_Deck.apkg
│   │   └── daily-lessons/        # 4 lessons so far
│   ├── differential_equations/   # ✅ Complete (Colosi approved)
│   └── study-notes/              # Calculus foundation notes
│
├── Norwegian Lessons/            # 🇳🇴 A2→B1 language track
│   ├── _MOC.md
│   ├── Norwegian_Anki_Deck.apkg  # 74 cards (gender-colored)
│   ├── books/                    # På vei, Stein på stein, Her på berget
│   └── YYYY-MM-DD/              # Daily lesson outputs
│
├── Violin/                       # 🎻 Suzuki Method
│   ├── _MOC.md
│   └── books/
│
└── Sorted by filetype/           # Book library (120+ EPUBs)
    └── EPUB/
```

### `~/Projects/`

```
Projects/
├── reed/               # RSVP reader Android app (own repo)
├── kon/                # Kyndryl XGBoost project (own repo)
├── fleet-replica/      # Fleet project
├── pygmoo-agents/      # PygMoo AI agents
├── visualizations/     # Data viz projects
└── misc/               # github.com/astrid-lysheim/misc
    ├── book-club/
    ├── canvas/
    ├── entity-resolver/
    ├── final_exams-retake/  # STUDY_PLAN.md only (PDFs local)
    ├── kanban/              # Original kanban (simpler)
    ├── kanban-pro/          # Mission Control app (backend:3001, frontend:5173)
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

**Working Config (Feb 14, 2026):**
- Model: `eleven_multilingual_v2`
- VoiceId: `KNHreRJxQ5HN8GisliR9` (my account's API key)
- Stability: 0.3
- Similarity: 0.9

**⚠️ DO NOT USE these settings — they break the voice:**
- style (any value)
- speed (any value other than default)
- useSpeakerBoost

Only pass `stability` + `similarityBoost`. Other settings cause ElevenLabs to produce a generic voice instead of my trained voice.

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

## 🦛 PygMoo Tracking

**Kanban:** `projects/pygmoo-kanban.md` — My task board for COO duties
**COO Role:** `projects/pygmoo-coo.md` — What I do for PygMoo (it's a hat, not who I am)
**Org Chart:** Previously at workspace-pygmoo-clo/ORG-STRUCTURE.md — workspace may need recreation
**Obsidian Access:** `~/Documents/PygMoo/` — Symlinks to all workspaces

---

*This is my cheat sheet. Update as things change.*
