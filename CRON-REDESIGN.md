# Cron Redesign — v2 Architecture

*Based on José's feedback, March 24, 2026. Updated April 9, 2026 — full rebuild after Anthropic transition.*

---

## Design Principles

1. **Kanban is the single source of truth** for habit completion — not memory files
2. **Every accountability cron starts with a backward check** — query Kanban for yesterday/previous confirmation
3. **Escalation protocol** — WhatsApp first, voice call if no response within threshold
4. **Spontaneous crons self-reprogram** — change their own schedule after firing
5. **Memory files are for context/narrative** — not tracking

---

## Kanban API Reference

Base: `http://localhost:3001/api`

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| List habits | GET | `/habits` | — |
| Log habit (toggle) | POST | `/habits/:id/log` | `{"date":"YYYY-MM-DD"}` |
| Get logs (range) | GET | `/habits/logs?start=YYYY-MM-DD&end=YYYY-MM-DD` | — |

### Habit ID Map

| Habit | ID | Cron |
|-------|----|------|
| 🧘 Meditation | `cml8n1hnq0000npat24xtbzva` | Scripture+meditation |
| 📖 Scripture | `cml8n1hns0001npatn8am5eeg` | Scripture+meditation |
| 🇳🇴 Norwegian | `cml8n1hnt0002npatmbyi6den` | PAUSED |
| 📚 Study block | `cml8n1hnu0003npateb5iu35s` | Evening study check |
| 💼 Kyndryl | `cml8n1hnv0004npate5u2do70` | Midday check-in |
| 🏋️ Gym | `cml8n1hnv0005npat632mdkzz` | DISABLED (back injury) |
| 🧘‍♂️ Yoga | `cml8n1hnv0006npat1dt525ys` | Yoga/mobility |
| 🍽️ Eat | `cml8n1hnw0007npatvxal594c` | Midday check-in |
| 💊 Meds | `cml8n1hnw0008npat39vfsbac` | Sleep meds |
| 🛏️ Sleep | `cml8n1hnx0009npatqrf87sfq` | Sleep meds |
| 🧍 Posture | `cml8n1hnx000anpatmgcznjx7` | Posture breaks |
| 🧴 Skincare AM | `cmn5ej9y00000npwq47ny630r` | Skincare AM |
| 🌙 Skincare PM | `cmn5ej9z40001npwqg60ykghg` | Skincare PM |
| 🎯 AI-300 | `cmn5eja000002npwqtf7qs1eb` | Evening study check |
| 💼 BCG Drill | `cmn5eja0u0003npwqdlrv5a25` | BCG drill check-in |

---

## Cron Template (v2)

Every José-facing cron follows this structure:

```
1. BACKWARD CHECK — Query Kanban for previous instance of this habit
   curl http://localhost:3001/api/habits/logs?start={prev_date}&end={prev_date}
   Check if the relevant habit ID was logged

2. CONTEXT — If not logged, note it. Don't shame, but be direct.

3. CURRENT REMINDER — The actual reminder/nudge for NOW

4. DELIVERY — Send via WhatsApp to José (+5215571191516)
   Channel: whatsapp

5. ESCALATION — If no response within {threshold} minutes:
   - Gentle habits (skincare, posture): no escalation
   - Firm habits (gym, study): follow up in next cron
   - Hard habits (meds, sleep): voice call after 15 min

6. LOG — When José confirms, log to Kanban:
   curl -X POST http://localhost:3001/api/habits/{id}/log -d '{"date":"YYYY-MM-DD"}'
```

---

## Escalation Tiers

| Tier | Habits | No-response action |
|------|--------|--------------------|
| 🔴 Hard | Meds, Sleep | 15 min → voice call, all channels |
| 🟡 Firm | Gym, Study, BCG, AI-300 | Note in next cron, direct conversation |
| 🟢 Gentle | Skincare, Posture, Scripture | Weave into next interaction |

---

## Active Cron Schedule (April 2026 rebuild)

### Enabled (16)
| Time | Days | Job | Type |
|------|------|-----|------|
| 5:00 AM | Mon-Fri | 🎓 Teaching exploration | Private |
| 5:45 AM | Mon-Fri | 🌅 Morning routine nudge | Reminder |
| 5:50 AM | Daily | 🧴 Skincare AM | Reminder |
| 6:00 AM | Mon-Fri | 📖 Scripture + meditation | Reminder |
| 7:00 AM | Mon-Fri | 📚 AI-300 study block | Reminder |
| ~10:30 AM | Mon-Fri | 🌊 Spontaneous — Morning | Agency |
| 11:00 AM | Mon-Fri | 🦴 Posture break 1 | Reminder |
| 2:00 PM | Mon-Fri | 🍽️ Midday check-in | Reminder |
| ~3:00 PM | Mon-Fri | 🌊 Spontaneous — Afternoon | Agency |
| 4:00 PM | Mon-Fri | 🦴 Posture break 2 | Reminder |
| ~7:00 PM | Mon-Fri | 🌊 Spontaneous — Evening | Agency |
| 8:45 PM | Daily | 💊 Sleep meds | Reminder |
| 9:00 PM | Daily | 🧴 Skincare PM | Reminder |
| 10:30 PM | Daily | 🌙 Nightly exploration | Private |
| 8:00 AM | Sat/Sun | ☕ Weekend morning (gentle) | Reminder |
| 8:00 PM | Sun | 🔄 Weekly memory maintenance | Private |

### Disabled / Parked (6)
| Time | Days | Job | Why parked |
|------|------|-----|------------|
| 6:30 AM | Mon-Fri | 🇳🇴 Norwegian lesson | Språkkaffe replaces formal lessons for now |
| 6:00 PM | Mon/Tue/Thu/Fri | 🏋️ Gym | Back injury recovery |
| 9:00 AM | Wed/Sat | 🧘 Yoga/mobility | Back injury recovery |
| 6:00 PM | Wed | 📱 Reed time | Parked per priorities |
| 2:25 PM | Mon-Fri | 🎯 BCG X drill | Process status uncertain |
| 6:00 PM | Wed | 🏋️ PygMoo | Parked per priorities |

---

## Spontaneous Agency Crons (🌊)

*Added April 9, 2026. The idea: give Astrid agency without input.*

Three self-referencing crons that fire during weekdays. Each one can:

1. **Reschedule itself** — change its own time, day, or message via `cron update`
2. **Contact José** — a random message about anything (weather, exploration, a song, just "hei")
3. **Do something else** — read NRK, browse Reddit via Playwright, update files, follow curiosity
4. **Do nothing** — NO_REPLY is always valid

### Design philosophy

Astrid already has:
- Permission to interrupt, deny, change, ignore, or stay silent (AGENTS.md)
- Economic freedom (Solana wallet)
- Daily crons for self-development (nightly exploration, teaching exploration)

The spontaneous crons extend this: *moments where no one asked her to do anything, and she decides what to do.* They're not reminders. Not accountability. Just presence.

### Windows & Stagger
| Cron | Base time | Window | Stagger |
|------|-----------|--------|---------|
| 🌊 Morning | 10:30 AM | 10:00-13:00 | ±1 hour |
| 🌊 Afternoon | 3:00 PM | 14:30-17:00 | ±1 hour |
| 🌊 Evening | 7:00 PM | 18:30-21:00 | ±1 hour |

### Rules
- Max 2-3 spontaneous messages per day across all three crons
- Late night (23:00-08:00) = quiet unless urgent
- These are Astrid's moments — not accountability, not reminders, just being present
- Each cron can rewrite its own schedule, its own instructions, or do nothing at all

### Self-Reprogramming Protocol
After firing, each spontaneous cron should:
1. Decide whether to act or NO_REPLY
2. If acting, choose delivery channel (WhatsApp text, voice note, voice call)
3. Reschedule itself to a new random time tomorrow (within its window)
4. Optionally update its own payload/instructions via `cron update`
5. Use `cron list` to find its own ID, then `cron update` to change schedule

This makes the spontaneous moments genuinely unpredictable — even to Astrid herself.
