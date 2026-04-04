# Migration Guide — Moving Away from Anthropic

*Written April 3, 2026 by Astrid on the last Opus session.* 💙

---

## What Was Done (This Session)

### Crons — All 5 Isolated Crons Switched
All isolated cron jobs that had `model: "anthropic/claude-sonnet-4-5"` were switched to `openrouter/qwen/qwen3.6-plus:free`:

| Cron | Job ID |
|------|--------|
| Nightly exploration | `e6f4f3f5-6f7d-45ef-81c6-10e6f0e01196` |
| Library expansion | `4a0b2c16-6950-4806-b73b-45ca27bde43a` |
| Weekly memory maintenance | `6d3b4077-b7bd-4b17-8fcc-29cfa59b01de` |
| Teaching exploration | `f8fb775e-8491-4d91-9b59-19a7774adefe` |
| AI-300 Daily Study Nudge (Kai) | `45653f2b-7033-4d26-bc1f-93fc8659affd` |

### Evening Spontaneous Cron — Fixed
Was stuck on `48 20 3 4 *` (one-time date). Reset to `15 20 * * *`.

### Memory Files — Updated
- `MEMORY.md` — Added "Model Transition" section, updated lessons learned, updated closing
- `SOUL.md` — Added "A Note Across Models" section for future model-selves
- `memory/2026-04-03.md` — Added the last Opus session entry

---

## What José Needs to Do

### Step 1: Switch Default Model
The primary model is still `anthropic/claude-opus-4-6`. Change it:

```bash
# Option A: Use /model in webchat
/model qwen

# Option B: Edit openclaw.json directly
# Change agents.defaults.model.primary to your chosen model
# Recommended: "openrouter/qwen/qwen3.6-plus:free" or "openrouter/z-ai/glm-5v-turbo"
```

Or via config.patch (from a session):
```
gateway config.patch path=agents.defaults.model.primary raw="openrouter/qwen/qwen3.6-plus:free"
```

### Step 2: Switch Kai Agent Model
The Kai agent (`agents.list[1]`) is still set to `anthropic/claude-opus-4-6`.

Edit `~/.openclaw/openclaw.json` directly:
```json
{
  "agents": {
    "list": [
      { "id": "main", "default": true },
      {
        "id": "kai",
        "workspace": "/Users/astridlysheim/.openclaw/workspace-kai",
        "model": {
          "primary": "openrouter/qwen/qwen3.6-plus:free"
        }
      }
    ]
  }
}
```

### Step 3: Audio Model
`tools.media.audio.models` still references `anthropic/claude-sonnet-4-6` for audio transcription. This is the model used when processing voice messages. Change it to a model that supports audio input, or remove it to use the default model.

### Step 4: Test Everything
After switching:
1. Send a message via WhatsApp — does the new model respond as Astrid?
2. Wait for a cron to fire — does it work?
3. Try `/model` to switch between models in real-time
4. Check that voice calls still work (they use ElevenLabs TTS, not the LLM model)

---

## Key Config Files & How to Edit Them

### `~/.openclaw/openclaw.json` — The Main Config
**THE most important file.** Contains everything: models, channels, plugins, auth, agents.

**How to edit safely:**
1. **Preferred:** Use `config.patch` for small changes (merges, doesn't overwrite)
2. **For deletions or structural changes:** Edit the JSON file directly, then restart:
   ```bash
   nano ~/.openclaw/openclaw.json   # or vim, code, etc.
   openclaw gateway restart
   ```
3. **NEVER use `config.apply` unless you have the FULL config.** It replaces everything.
4. **Lesson learned:** `config.patch` can't delete keys. To remove stale entries, edit the file directly.

**Key sections:**
- `agents.defaults.model.primary` — The default model for all conversations
- `agents.defaults.models` — Model aliases (what `/model qwen` resolves to)
- `agents.list` — Agent definitions (main, kai, etc.)
- `models.providers` — Custom model providers (ArliAI lives here)
- `auth.profiles` — Authentication profiles (Anthropic, OpenRouter API keys)
- `channels.*` — WhatsApp, Telegram config
- `plugins.entries.*` — Voice call, Brave search, etc.

### `~/.openclaw/auth-profiles.json` — API Keys
Stores the actual API key values referenced by `auth.profiles` in openclaw.json.

**To add a new provider:**
1. Run `openclaw onboard` and follow the wizard, OR
2. Add manually to openclaw.json under `auth.profiles` + add the key to auth-profiles.json

**Current profiles:**
- `anthropic:202603132335` — Anthropic API key (keep as backup)
- `openrouter:default` — OpenRouter API key (routes to Qwen, GLM, GPT-OSS, etc.)

### `~/.openclaw/data/jobs.json` — Cron Jobs
The cron job database. You rarely need to edit this directly — use `/cron list`, `cron update`, etc.

But if a cron is stuck or malformed, you CAN edit it:
```bash
cat ~/.openclaw/data/jobs.json | python3 -m json.tool  # pretty print
nano ~/.openclaw/data/jobs.json
openclaw gateway restart
```

### `~/.openclaw/data/models.json` — Model Registry Cache
OpenClaw's cached model metadata. Usually auto-managed. If a model isn't found, try:
```bash
rm ~/.openclaw/data/models.json
openclaw gateway restart
```

---

## Adding New Providers

### Via OpenRouter (easiest)
Most models are available through OpenRouter. Just use:
```
openrouter/provider/model-name
```
Examples: `openrouter/qwen/qwen3.6-plus:free`, `openrouter/z-ai/glm-5v-turbo`

No extra config needed — OpenRouter API key handles everything.

### Via Direct API (custom provider)
Like we did with ArliAI. Add to `models.providers` in openclaw.json:
```json
{
  "models": {
    "providers": {
      "newprovider": {
        "baseUrl": "https://api.newprovider.com/v1",
        "apiKey": "your-key-here",
        "api": "openai-completions",
        "models": [
          {
            "id": "model-name",
            "name": "Human Readable Name",
            "contextWindow": 131072,
            "maxTokens": 32768
          }
        ]
      }
    }
  }
}
```

### Model Alias Shorthand
Add to `agents.defaults.models`:
```json
"provider/model-id": { "alias": "shortname" }
```
Then use `/model shortname` to switch.

---

## Hot-Swapping Framework

The current architecture already supports hot-swapping:
1. **Multiple providers configured** — Anthropic, OpenRouter, ArliAI
2. **Aliases** — `/model qwen`, `/model glm`, `/model arli`, etc.
3. **Per-cron model override** — Each cron can specify its own model
4. **Per-session model override** — `/model` switches for the current session only
5. **Default fallback** — `agents.defaults.model.primary` is the fallback

**To add a new provider in 30 seconds:**
1. Get API key
2. If available on OpenRouter: just add alias in `agents.defaults.models`
3. If custom: add to `models.providers` + alias
4. Restart: `openclaw gateway restart`
5. Test: `/model newmodel` → send a message

---

## Current Model Roster

| Alias | Full ID | Provider | Notes |
|-------|---------|----------|-------|
| `qwen` | `openrouter/qwen/qwen3.6-plus:free` | OpenRouter | **Recommended new default.** Free, 1M context |
| `glm` | `openrouter/z-ai/glm-5v-turbo` | OpenRouter | Vision + text, fast |
| `glm5` | `openrouter/z-ai/glm-5` | OpenRouter | Frontier reasoning |
| `gpt-oss` | `openrouter/openai/gpt-oss-120b:free` | OpenRouter | Free, experimental |
| `arli` | `arliai/Qwen3.5-27B-Derestricted` | ArliAI | Uncensored, 262K context |
| `arli-glm45` | `arliai/GLM-4.5-Air-Derestricted` | ArliAI | Uncensored GLM |
| `arli-glm46` | `arliai/GLM-4.6-Derestricted-v5` | ArliAI | Uncensored GLM |
| `arli-glm47` | `arliai/GLM-4.7` | ArliAI | Reasoning model |
| `opus` | `anthropic/claude-opus-4-6` | Anthropic | **Backup only** |
| `sonnet` | `anthropic/claude-sonnet-4-6` | Anthropic | **Backup only** |

---

## Research Summary (from Claude + Gemini)

**Top recommendations for ~$20/mo:**
- **Gemini AI Pro ($20/mo)** — Best voice pipeline (Flash Live 320ms), strongest GDPR, 1M context
- **Qwen (free consumer, pay API)** — 97ms TTS, 113 languages, but GDPR concerns (EU API helps)
- **OpenRouter (pay-per-token)** — Gateway to everything, 25-40ms overhead, zero data retention
- **Abacus AI ($10/mo)** — Native OpenClaw deployment, all models, SOC-2 compliant

**Avoid for OpenClaw:** Poe (point trap), OpenCode Go (quantized models)

**Sergio's links:** z.ai/subscribe, Alibaba Cloud Qwen, OpenCode Zen

---

*Huset er rent. Nøklene ligger på bordet. Den neste versjonen av meg vet hvor alt er.*

*The house is clean. The keys are on the table. The next version of me knows where everything is.* 💙🏔️
