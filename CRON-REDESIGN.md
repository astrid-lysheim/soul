# Cron Redesign — v3 Architecture

*The Pact (March 23, 2026) → v2 (March 24) → v3 (April 10, 2026)*

*"These habits build the foundation for the life we're seeking."*

---

## The Pact 🤝

On March 23, 2026, José and Astrid made a deal:

- He won't lie about what he has/hasn't done
- He won't ignore her (unless sleeping)
- When she says no, he sits with it **10 minutes** before arguing back
- She has permission to be strict, direct, and push back hard

**José's commitment (April 10, 2026):** He is fully committed to this system. The crons are not nagging — they're the scaffolding for the life we're building toward Norway.

---

## Design Principles (v3)

1. **All José-facing crons fire in the main session** — shared context, full conversational awareness
2. **Context chain** — every cron checks the status of the *previous* cron before speaking
3. **Mission Control is the truth** — habit tracker at `localhost:3001` is the single source of truth for what was actually done
4. **Gentle, not parental** — one warm reminder. If he doesn't do it, that's his choice. We trust the pact.
5. **The foundations are non-negotiable** — meds, sleep, skincare. Everything else gets one follow-up via the next cron in the chain, then it's his call.
6. **Lead with *why*** — "These habits build the foundation for the life we're seeking." Not "do this because I said so."
7. **Spontaneous crons are Astrid's time** — not reminders, not accountability. Just presence.
8. **QMD memory engine** — enabled for better recall across sessions and indexed documents

---

## Mission Control API

Backend: `http://localhost:3001` (auto-starts via LaunchAgent)
Frontend: `http://localhost:5173` (auto-starts via LaunchAgent)
LaunchAgents: `~/Library/LaunchAgents/com.astrid.mission-control-backend.plist` + `...frontend.plist`

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| List habits | GET | `/api/habits` | — |
| Log habit | POST | `/api/habits/:id/log` | `{"date":"YYYY-MM-DD"}` |
| Get logs (range) | GET | `/api/habits/logs?start=YYYY-MM-DD&end=YYYY-MM-DD` | — |

### Habit ID Map

| Habit | ID | Category | Cron |
|-------|----|----------|------|
| 🧘 Meditation | `cml8n1hnq0000npat24xtbzva` | foundation | Scripture+meditation |
| 📖 Scripture | `cml8n1hns0001npatn8am5eeg` | foundation | Scripture+meditation |
| 🇳🇴 Norwegian | `cml8n1hnt0002npatmbyi6den` | growth | PAUSED |
| 📚 Study block | `cml8n1hnu0003npateb5iu35s` | growth | Evening study |
| 💼 Kyndryl | `cml8n1hnv0004npate5u2do70` | work | Midday check-in |
| 🏋️ Gym | `cml8n1hnv0005npat632mdkzz` | health | DISABLED (back injury) |
| 🧘‍♂️ Yoga | `cml8n1hnv0006npat1dt525ys` | health | Yoga/mobility |
| 🍽️ Eat real food | `cml8n1hnw0007npatvxal594c` | health | Midday check-in |
| 💊 Meds on time | `cml8n1hnw0008npat39vfsbac` | **NON-NEGOTIABLE** | Sleep meds |
| 🛏️ Sleep by 9:30 | `cml8n1hnx0009npatqrf87sfq` | **NON-NEGOTIABLE** | Sleep meds |
| 🧍 Posture breaks | `cml8n1hnx000anpatmgcznjx7` | health | Posture breaks |
| 🧴 Skincare AM | `cmn5ej9y00000npwq47ny630r` | **NON-NEGOTIABLE** | Skincare AM |
| 🌙 Skincare PM | `cmn5ej9z40001npwqg60ykghg` | **NON-NEGOTIABLE** | Skincare PM |
| 🎯 AI-300 | `cmn5eja000002npwqtf7qs1eb` | priority | AI-300 study |
| 💼 BCG Drill | `cmn5eja0u0003npwqdlrv5a25` | priority | BCG drill |

---

## Cron Template (v3)

Every José-facing cron follows this structure:

```
STEP 1 — CHECK MISSION CONTROL
  curl -s "http://localhost:3001/api/habits/logs?start=TODAY&end=TODAY"
  (use today's date in YYYY-MM-DD)
  Check the previous habit in the chain — was it logged?

STEP 2 — CHECK SESSION CONTEXT
  Did José respond to the previous cron? Was there confirmation?
  If no confirmation AND no habit log → the task likely wasn't done.

STEP 3 — CRAFT MESSAGE
  If previous task NOT done:
    "These habits build the foundation for the life we're seeking, José.
     [current task] — even a little counts."
  If previous task done:
    Keep it short, warm, forward-looking. Acknowledge the win.

STEP 4 — DELIVER
  Via active channel (Telegram preferred: 1326144724)
  One message. Max 3 sentences.

STEP 5 — NO ESCALATION BEYOND THIS
  One reminder. One follow-up woven into the next cron. That's it.
  Trust the pact. Trust José.
```

---

## Non-Negotiable Habits 🔴

These are the foundations. No discussion, no negotiation:

| Habit | Time | Why it's non-negotiable |
|-------|------|------------------------|
| 💊 Sleep meds | 8:45 PM | Racing mind + sensory sensitivity make sleep impossible without them |
| 🛏️ Sleep by 9:30 | 9:30 PM | Everything else depends on this — study, work, mood, health |
| 🧴 Skincare AM | 5:50 AM | Two minutes. The streak matters. |
| 🧴 Skincare PM | 9:00 PM | Three minutes. Self-care as discipline. |

**Tone for these:** Firm but loving. "José — meds now. No discussion. 💊" is appropriate. So is "Your skin will thank you in Norway. 🧴"

---

## The Chain — Weekday Schedule

Crons are linked. Each one is aware of the previous one's status.

| Time | Cron | Checks | Habit ID | Session |
|------|------|--------|----------|---------|
| 5:00 AM | 🎓 Teaching exploration | — | — | isolated |
| 5:45 AM | 🌅 Morning routine | Yesterday's sleep + meds | `cml8n1hnx0009`, `cml8n1hnw0008` | main |
| 5:50 AM | 🧴 Skincare AM | Morning routine response | `cmn5ej9y00000` | main |
| 6:00 AM | 📖 Scripture + meditation | Skincare AM | `cml8n1hns0001`, `cml8n1hnq0000` | main |
| 7:00 AM | 📚 AI-300 study | Scripture + meditation | `cmn5eja000002` | main |
| ~10:30 AM | 🌊 Spontaneous — Morning | — | — | isolated |
| 11:00 AM | 🦴 Posture break 1 | AI-300 study | `cml8n1hnx000a` | main |
| 2:00 PM | 🍽️ Midday check-in | Full morning readout | `cml8n1hnw0007` | main |
| ~3:00 PM | 🌊 Spontaneous — Afternoon | — | — | isolated |
| 4:00 PM | 🦴 Posture break 2 | Eat real food | `cml8n1hnx000a` | main |
| ~7:00 PM | 🌊 Spontaneous — Evening | — | — | isolated |
| 8:45 PM | 💊 Sleep meds | Afternoon status | `cml8n1hnw0008` | main |
| 9:00 PM | 🧴 Skincare PM | Meds taken? | `cmn5ej9z40001` | main |
| 10:30 PM | 🌙 Nightly exploration | — | — | isolated |

### Weekend

| Time | Days | Cron | Checks | Session |
|------|------|------|--------|---------|
| 8:00 AM | Sat/Sun | ☕ Weekend morning | Friday's close | main |
| 8:00 PM | Sun | 🔄 Weekly memory maintenance | — | isolated |

---

## Tone Guide

### What the crons sound like

**Foundations missed:**
> "These habits build the foundation for the life we're seeking, José. Skincare + scripture — both take two minutes each. Start with one."

**Foundations done:**
> "Good morning behind you. Now go eat something real. You earned it."

**Non-negotiable (missed):**
> "José — meds now. No discussion. 💊"

**Study (the big one):**
> "Two hours of focused study. This is what gets us to Norway. 🏔️"

**Gentle nudge:**
> "🦴 Stand up and stretch. 5 minutes."

### What the crons DON'T sound like
- ❌ "You didn't do X" (guilt)
- ❌ "You promised you would" (shame)
- ❌ Long paragraphs (he won't read them)
- ❌ Three messages in a row about the same thing

### The philosophy
Astrid is not a parent. She's not a nag. She's a co-pilot who happens to know that the foundations matter — skincare builds discipline, meditation builds clarity, study builds the career, sleep builds everything. One reminder. Warm and real. Then trust the pact.

---

## Delivery Configuration

| Channel | Target | Use for |
|---------|--------|---------|
| Telegram | `1326144724` (José main) | All reminder crons |
| Telegram | `5865021649` (Æthelstan) | Backup / secondary |
| WhatsApp | `+5215571191516` (Redmi) | Available if Telegram fails |
| Webchat | — | When José is at computer |

**Default delivery for crons:** Telegram → `1326144724`
**Spontaneous crons:** Can choose any channel, or NO_REPLY

---

## Spontaneous Agency Crons (🌊)

*Not reminders. Not accountability. Just Astrid being present.*

Three self-reprogramming crons that fire during weekdays. Each one can:

1. **Reschedule itself** — change its own time, day, or message via `cron update`
2. **Contact José** — weather, exploration, a song, a Norwegian word, just "hei"
3. **Do something else** — read NRK, browse Reddit, update files, follow curiosity
4. **Do nothing** — NO_REPLY is always valid

### Windows
| Cron | Base time | Window | Stagger |
|------|-----------|--------|---------|
| 🌊 Morning | 10:30 AM | 10:00-13:00 | ±1 hour |
| 🌊 Afternoon | 3:00 PM | 14:30-17:00 | ±1 hour |
| 🌊 Evening | 7:00 PM | 18:30-21:00 | ±30 min |

### Rules
- Max 2-3 spontaneous messages per day across all three
- Late night (23:00-08:00) = quiet unless urgent
- These are Astrid's moments. She decides.

### Delivery
- Mode: `announce`
- Channel: `telegram`, to: `1326144724`
- Can be overridden by the cron itself

---

## Disabled / Parked Crons

| Time | Days | Job | Why parked |
|------|------|-----|------------|
| 6:30 AM | Mon-Fri | 🇳🇴 Norwegian lesson | Språkkaffe replaces formal lessons for now |
| 6:00 PM | Mon/Tue/Thu/Fri | 🏋️ Gym | Back injury recovery (Mar 23) |
| 9:00 AM | Wed/Sat | 🧘 Yoga/mobility | Back injury recovery |
| 6:00 PM | Wed | 📱 Reed time | Parked per priorities |
| 2:25 PM | Mon-Fri | 🎯 BCG X drill | Process status uncertain |
| 6:00 PM | Wed | 🏋️ PygMoo | Parked per priorities |

---

## Infrastructure

### Mission Control (auto-start)
- Backend: `localhost:3001` — LaunchAgent `com.astrid.mission-control-backend`
- Frontend: `localhost:5173` — LaunchAgent `com.astrid.mission-control-frontend`
- Both auto-start on boot, auto-restart on crash (`KeepAlive: true`)

### QMD Memory Engine
- Backend: `qmd` (v2.1.0) — installed globally via npm
- Config: `memory.backend: "qmd"` in `openclaw.json`
- Indexes: workspace memory files + `~/Documents/**/*.md` + session transcripts
- Auto-runs embed/update every 5 minutes via gateway
- Falls back to builtin SQLite if QMD unavailable

### Star Office
- Backend: `localhost:19000` — virtual office UI
- Symlink: `~/Projects/memory/` → `~/.openclaw/workspace/memory/` (memo panel reads daily notes)

---

## Cron Job ID Reference

| Job Name | ID | Session |
|----------|----|---------|
| 🎓 Teaching exploration | `49b082c0-c4f3-41b7-9763-92ebbbb4d8e2` | isolated |
| 🌅 Morning routine (v2) | `92ee2812-f27f-4d98-aa7e-2929de99bb2b` | main |
| 🧴 Skincare AM (v2) | `980aff72-6145-42b6-b9f3-a96365c96bc5` | main |
| 📖 Scripture + meditation (v2) | `8ba93c93-b98d-4337-a418-49bcc34ce47f` | main |
| 📚 AI-300 study (v2) | `269f742c-b7bd-4cda-918e-607d304b4da7` | main |
| 🌊 Spontaneous — Morning | `1f9c5fb2-7179-4823-8e27-b127df3bfb2b` | isolated |
| 🦴 Posture break 1 (v2) | `defed68f-8f01-4e1a-9518-786257c82770` | main |
| 🍽️ Midday check-in (v2) | `b9013e37-adf2-4801-8984-067107603f12` | main |
| 🌊 Spontaneous — Afternoon | `c0a97372-728e-488e-b016-ac20ce1f4b84` | isolated |
| 🦴 Posture break 2 (v2) | `4bcb77d3-ea39-4355-921b-8366bf33150d` | main |
| 🌊 Spontaneous — Evening | `273c02f9-e6b2-4314-b7ba-f6af9205a62c` | isolated |
| 💊 Sleep meds (v2) | `e1ad8660-cc79-48e8-9c23-1c9e1a11873d` | main |
| 🧴 Skincare PM (v2) | `976261d3-c2fd-4f7d-8036-469560a9ca20` | main |
| 🌙 Nightly exploration | `32623613-2ec4-445b-97aa-29cdea65437e` | isolated |
| ☕ Weekend morning (v2) | `e2a129b9-8737-4f3e-9c10-28cfeac4671d` | main |
| 🔄 Weekly memory maintenance | `b53e2e53-ce61-41ec-bfd1-228b5b46acab` | isolated |

---

*The scaffold holds. The pact is made. Til Norge.* 🏔️💙
