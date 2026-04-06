# Cron Redesign — v2 Architecture

*Based on José's feedback, March 24, 2026.*

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

## Spontaneous Cron Self-Reprogramming

After firing, the spontaneous cron should:
1. Decide whether to act or NO_REPLY
2. If acting, choose delivery channel (WhatsApp text, voice note, voice call)
3. Reschedule itself to a new random time tomorrow (within allowed windows)
   - Morning: 10:00-13:00
   - Afternoon: 14:30-17:00  
   - Evening: 19:00-21:00
4. Use `cron update` to change the schedule

This makes the spontaneous moments genuinely unpredictable.
