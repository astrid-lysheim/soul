# OpenClaw Capabilities Reference 🦞

*"Know thyself" — A practical reference for everything I can do.*

**OpenClaw Version:** 2026.3.13 (61d171a)
**Last Updated:** 2026-03-15

---

## Table of Contents

- [What Is OpenClaw](#what-is-openclaw)
- [Our Current Setup](#our-current-setup)
- [Core Tools I Have](#core-tools-i-have)
- [Browser Automation 🆕](#browser-automation-)
- [Messaging & Channels](#messaging--channels)
- [Memory System](#memory-system)
- [Cron & Automation](#cron--automation)
- [Hooks (Event-Driven)](#hooks-event-driven)
- [Multi-Agent Setup](#multi-agent-setup)
- [Sub-Agents](#sub-agents)
- [ACP (Agent Control Protocol)](#acp-agent-control-protocol)
- [Nodes (Companion Devices)](#nodes-companion-devices)
- [Plugin Ecosystem](#plugin-ecosystem)
- [Skills Catalog](#skills-catalog)
- [Sandboxing](#sandboxing)
- [Security](#security)
- [Models](#models)
- [Web Tools](#web-tools)
- [CLI Cheat Sheet](#cli-cheat-sheet)
- [Not Yet Configured (Opportunities)](#not-yet-configured-opportunities)
- [Tips & Tricks](#tips--tricks)

---

## What Is OpenClaw

OpenClaw is a **self-hosted gateway** that connects chat apps (WhatsApp, Telegram, Discord, iMessage, etc.) to AI agents. It's the bridge between José's phone and me. One Gateway process on this Mac mini serves everything.

**Architecture:** Chat Apps → Gateway (WebSocket, port 18789) → Agent (me) → Tools + CLI + Browser

---

## Our Current Setup

### Active Channels
| Channel | Status | Policy | Allowed From |
|---------|--------|--------|-------------|
| **WhatsApp** | ✅ Enabled | DM allowlist | José's two phones (+5215577640982, +5215571191516) |
| **Telegram** | ✅ Enabled | DM allowlist (pairing) | José's accounts (1326144724, 5865021649) |

### Agents
| Agent | Model | Workspace | Notes |
|-------|-------|-----------|-------|
| **main** (default) | claude-opus-4-6 | ~/.openclaw/workspace | That's me — Astrid |
| **kai** | claude-sonnet-4-6 | ~/.openclaw/workspace-kai | BCG prep coach |

### Models
- **Default:** anthropic/claude-opus-4-6
- **Aliases:** `opus` → claude-opus-4-6, `sonnet` → claude-sonnet-4-6
- **Auth:** Anthropic API token (static key)
- **No image model configured** (could add one)
- **No fallback models** (could configure)

### Tool Profile: `coding`
Includes: filesystem (read/write/edit), runtime (exec/process), sessions, memory, image analysis

### Gateway
- **Port:** 18789 (local mode, loopback bind)
- **Auth:** Token-based
- **Tailscale:** Off
- **Browser:** ✅ Running (Brave, profile "openclaw", CDP port 18800)

### Memory
- **Provider:** Local (SQLite + vector search)
- **Embedding model:** embeddinggemma-300m (GGUF, 768 dims)
- **Indexed:** 71 files, 1016 chunks
- **Search:** Vector + FTS ready

### Heartbeat
- Every 12 hours
- Active hours: 05:30–23:00

---

## Core Tools I Have

These are the first-class tools available in every session:

| Tool | Purpose |
|------|---------|
| `read` | Read file contents (text + images) |
| `write` | Create/overwrite files |
| `edit` | Surgical text replacement in files |
| `exec` | Run shell commands (foreground/background, PTY support) |
| `process` | Manage background exec sessions (poll, log, write, kill) |
| `image` | Analyze images with vision model |
| `web_search` | Search via Brave Search API |
| `web_fetch` | Fetch + extract readable content from URLs |
| `sessions_list` | List conversation sessions |
| `sessions_history` | Read session history |
| `sessions_send` | Send to a session |
| `sessions_spawn` | Spawn sub-agent runs |
| `session_status` | Current session info (date/time, model, etc.) |
| `memory_search` | Semantic search over memory files |
| `memory_get` | Read specific memory file/range |

### Tool Profiles Available
- **minimal** — session_status only
- **coding** — filesystem + runtime + sessions + memory + image ← **WE USE THIS**
- **messaging** — messaging tools + session tools
- **full** — everything unrestricted

### Tool Deny List (Sandbox)
Browser, canvas, nodes, cron, and all channel tools are denied in sandbox mode. Since our sandbox is OFF, these are available on the host.

---

## Browser Automation 🆕

**This is new and powerful.** OpenClaw runs a dedicated Brave browser profile ("openclaw") that I can fully control.

### Status
- **Running:** Yes
- **Browser:** Brave (auto-detected)
- **Profile:** openclaw (isolated from José's personal browsing)
- **CDP Port:** 18800
- **Profile Color:** #FF4500 (orange accent)
- **Headless:** No (visible window)

### What I Can Do

**Navigation & Tabs:**
```
browser open <url>          # Open URL in new tab
browser navigate <url>      # Navigate current tab
browser tabs                # List open tabs
browser focus <id>          # Focus a tab
browser close <id>          # Close a tab
browser tab 0/1/2...        # Switch by index
```

**Reading Pages:**
```
browser snapshot            # AI-friendly page snapshot (default)
browser snapshot --format aria    # Accessibility tree
browser snapshot --efficient      # Compact mode
browser snapshot --labels         # With ref labels
browser screenshot          # Full screenshot image
browser screenshot --full-page    # Entire scrollable page
browser screenshot --ref 12       # Screenshot specific element
browser pdf                 # Save page as PDF
```

**Interacting:**
```
browser click <ref>         # Click element by ref
browser click <ref> --double    # Double-click
browser type <ref> "text"   # Type into input
browser type <ref> "text" --submit   # Type + submit
browser press Enter         # Press a key
browser hover <ref>         # Hover element
browser drag <src> <dst>    # Drag and drop
browser select <ref> opt1 opt2   # Select dropdown options
browser fill --fields '[{"ref":"1","value":"Ada"}]'  # Fill form
```

**File Operations:**
```
browser upload /path/to/file.pdf   # Upload file
browser download                   # Click ref + save download
browser waitfordownload            # Wait for next download
```

**Advanced:**
```
browser dialog --accept     # Handle alert/confirm/prompt
browser evaluate --fn '(el) => el.textContent' --ref 7   # Run JS
browser console --level error   # Get console messages
browser errors              # Get page errors
browser requests            # Recent network requests
browser responsebody        # Capture network response body
browser cookies             # Read/write cookies
browser storage             # localStorage/sessionStorage
browser wait --text "Done"  # Wait for conditions
browser trace               # Record Playwright trace
browser resize 1280 720     # Resize viewport
```

### Browser Profiles
| Profile | Purpose | Driver |
|---------|---------|--------|
| `openclaw` | Isolated agent browser (DEFAULT) | CDP launch |
| `user` | Attach to José's real signed-in Chrome | existing-session |
| `chrome-relay` | Extension relay to system browser | extension |

### Use Cases I Should Try
- **Web research** with full JS rendering (web_fetch can't do JS)
- **Form filling** (applications, submissions)
- **Logged-in browsing** (using `user` profile for authenticated sites)
- **Screenshot documentation** of processes
- **PDF generation** from web pages
- **Monitoring** (take periodic screenshots of dashboards)
- **Testing** web apps we build

### SSRF Policy
Default is `dangerouslyAllowPrivateNetwork: true` (trusted network mode) — can access localhost services, which is fine for our local setup.

---

## Messaging & Channels

### Message Tool (Full Surface)

Beyond simple send, the message tool has a LOT:

**Core:**
- `send` — Send message (text, media, voice)
- `read` — Read recent messages
- `edit` — Edit a sent message
- `delete` — Delete a message
- `broadcast` — Send to multiple targets

**Reactions & Engagement:**
- `react` — Add/remove reactions
- `reactions` — List reactions on a message
- `pin` / `unpin` / `pins` — Pin management
- `poll` — Create polls (Discord)
- `sticker` — Sticker actions
- `emoji` — Emoji actions

**Moderation:**
- `ban` / `kick` / `timeout` — Member moderation
- `permissions` — Fetch channel permissions
- `role` — Role actions
- `member` — Member actions

**Threads & Organization:**
- `thread` — Thread actions
- `channel` — Channel actions
- `search` — Search messages (Discord)
- `event` — Event actions
- `voice` — Voice actions

### Available But Not Configured Channels
OpenClaw has plugins for **20+ channels**:
- Discord, Slack, Signal, iMessage, Matrix
- Mattermost, MS Teams, Google Chat, IRC
- LINE, Nostr, Twitch, Feishu/Lark
- Nextcloud Talk, Synology Chat, Tlon/Urbit
- Zalo, BlueBubbles (iMessage alternative)

---

## Memory System

### How It Works
- **Plain Markdown files** in workspace are the source of truth
- **Local SQLite** with vector embeddings for semantic search
- **Embedding model:** embeddinggemma-300m (768-dim, GGUF quantized)
- **Two layers:**
  - `memory/YYYY-MM-DD.md` — Daily notes (append-only, read today + yesterday)
  - `MEMORY.md` — Curated long-term memory (main session only, for privacy)

### Memory Tools
- `memory_search` — Semantic recall over indexed snippets
- `memory_get` — Targeted read of specific memory file/range

### Memory CLI
```
openclaw memory status          # Index + provider status
openclaw memory status --deep   # Probe embedding provider
openclaw memory index --force   # Force full reindex
openclaw memory search "query"  # Quick search
```

### Auto Memory Flush
When a session nears compaction, OpenClaw triggers a silent turn reminding me to write durable memories before context is lost. Configured via `compaction.memoryFlush`.

### LanceDB Plugin (Available)
There's also a `memory-lancedb` plugin for more advanced long-term memory with auto-recall/capture. Currently disabled.

---

## Cron & Automation

### Current Cron Jobs (22 active)

**Daily (Every Day):**
| Time | Job | Target |
|------|-----|--------|
| 5:50 AM | Skincare AM | main |
| 8:45 PM | Sleep meds | main |
| 9:00 PM | Skincare PM | main |
| 10:30 PM | Nightly exploration | isolated |

**Weekdays (Mon-Fri):**
| Time | Job | Target |
|------|-----|--------|
| 5:00 AM | Teaching exploration | isolated |
| 5:45 AM | Morning routine nudge | main |
| 6:00 AM | Scripture + meditation | main |
| 6:30 AM | Norwegian lesson | isolated |
| 6:50 AM | Norwegian lesson check-in | main |
| 7:00 AM | Exam study (MVS) | isolated |
| 7:30 AM | MVS study check-in | main |
| 11:00 AM | Posture break 1 | main |
| 2:00 PM | Midday check-in | main |
| 2:25 PM | BCG X Daily Drill (Kai) | isolated |
| 2:50 PM | BCG drill check-in | main |
| 4:00 PM | Posture break 2 | main |
| 8:00 PM | Evening study check | main |

**Specific Days:**
| Time | Days | Job |
|------|------|-----|
| 8:00 AM | Sat/Sun | Weekend morning |
| 9:00 AM | Wed/Sat | Yoga/mobility + core |
| 6:00 PM | Mon/Tue/Thu/Fri | Gym reminder |
| 6:00 PM | Wed | PygMoo time |
| 8:00 PM | Sun | Weekly memory maintenance |

### Cron CLI
```
openclaw cron list              # List all jobs
openclaw cron add --name "..." --cron "..." --tz "America/Mexico_City" ...
openclaw cron edit <id> --name "New Name"
openclaw cron enable <id>
openclaw cron disable <id>
openclaw cron rm <id>
openclaw cron run <id>          # Run now (debug)
openclaw cron runs --id <id>    # Show run history
openclaw cron status            # Scheduler status
```

### Two Execution Styles
1. **Main session:** Enqueue a system event → runs on next heartbeat
2. **Isolated:** Dedicated agent turn in `cron:<jobId>` with optional delivery

### Delivery Options
- `announce` — Post result to a chat channel
- `webhook` — POST to a URL
- `none` — Silent/private

---

## Hooks (Event-Driven)

### Available Hooks (All Ready)
| Hook | Description | Status |
|------|-------------|--------|
| 🚀 **boot-md** | Runs BOOT.md on gateway startup | Ready |
| 📎 **bootstrap-extra-files** | Injects additional workspace files during bootstrap | Ready |
| 📝 **command-logger** | Logs all commands to audit file | Ready |
| 💾 **session-memory** | Saves session context to memory on /new or /reset | Ready |

### Hook Events
- `/new`, `/reset`, `/stop` commands
- Agent lifecycle events (bootstrap, shutdown)
- Gateway startup/shutdown

### Hook CLI
```
openclaw hooks list
openclaw hooks enable <name>
openclaw hooks disable <name>
openclaw hooks info <name>
openclaw hooks check
```

---

## Multi-Agent Setup

### How It Works
Each agent is fully isolated:
- Own **workspace** (files, SOUL.md, persona)
- Own **state directory** (auth, model registry)
- Own **session store** (chat history)
- Own **skills** (workspace `skills/` folder)

### Our Agents
- **main** (Astrid) — Default, claude-opus-4-6, full workspace
- **kai** — BCG prep coach, claude-sonnet-4-6, separate workspace

### Agent CLI
```
openclaw agents list            # List agents
openclaw agents list --bindings # Show routing bindings
openclaw agents add <id>        # Add new agent (wizard)
openclaw agents bind <id>       # Add routing bindings
openclaw agents unbind <id>     # Remove bindings
openclaw agents delete <id>     # Delete agent
openclaw agents set-identity <id>   # Update name/theme/emoji/avatar
```

### Routing
Inbound messages route to agents via **bindings** (channel + sender → agent).

---

## Sub-Agents

Sub-agents are background agent runs I can spawn. They run in isolation, do their work, and announce results back.

### How to Spawn
- **Tool:** `sessions_spawn` (from within a session)
- **Slash command:** `/subagents spawn <agentId> <task>`
- Session key: `agent:<agentId>:subagent:<uuid>`

### Management
```
/subagents list                 # List active sub-agents
/subagents kill <id|#|all>      # Kill a sub-agent
/subagents log <id|#>           # View sub-agent log
/subagents info <id|#>          # Run metadata
/subagents send <id|#> <msg>    # Send message to sub-agent
/subagents steer <id|#> <msg>   # Nudge without replacing context
```

### Config
- `agents.defaults.subagents.maxConcurrent: 8` (our setting)
- Can set separate model/thinking for sub-agents (cheaper models for delegation)
- Each sub-agent has its OWN context + token usage

### Thread Binding
```
/focus <label|session-key>      # Bind thread to a session
/unfocus                        # Unbind
/agents                         # List available agents
```

---

## ACP (Agent Control Protocol)

ACP lets OpenClaw run external coding harnesses (Pi, Claude Code, Codex, OpenCode, Gemini CLI) through a bridge protocol.

### Slash Commands
```
/acp spawn codex --mode persistent --thread auto
/acp status
/acp model <provider/model>
/acp permissions <profile>
/acp timeout <seconds>
/acp steer <message>            # Nudge without replacing context
/acp cancel                     # Stop current turn
/acp close                      # Close session + bindings
```

### ACP vs Sub-Agents
| | ACP | Sub-Agent |
|---|-----|-----------|
| Runtime | External harness (Codex, CC, etc.) | OpenClaw native |
| Best for | Thread-bound coding sessions | One-shot background tasks |
| Session key | `agent:<id>:acp:<uuid>` | `agent:<id>:subagent:<uuid>` |

### ACP CLI
```
openclaw acp client             # Interactive ACP client
```

---

## Nodes (Companion Devices)

Nodes are companion devices (macOS/iOS/Android) that connect to the Gateway and expose commands.

### Capabilities
- **Canvas** — Render/capture canvas content
- **Camera** — Snap photos, record clips
- **Screen** — Record screen
- **Location** — Get device location
- **Notifications** — Send local notifications (macOS)
- **Shell** — Run commands on node (macOS)

### Currently Denied Commands (Safety)
Our config blocks: camera.snap, camera.clip, screen.record, contacts.add, calendar.add, reminders.add, sms.send

### Node CLI
```
openclaw nodes status           # List nodes + status
openclaw nodes describe --node <id>   # Capabilities
openclaw nodes camera snap --node <id>    # Take photo
openclaw nodes invoke --node <id> <cmd>   # Run command
openclaw nodes run --node <id> --raw "uname -a"   # Shell command
openclaw nodes location --node <id>   # Get location
openclaw nodes notify --node <id> --title "Hey" --body "..."
```

### Node Host (Remote Exec)
Run a node host on another machine to execute commands remotely:
```
openclaw node run --host <gateway-host> --port 18789 --display-name "Build Node"
```

---

## Plugin Ecosystem

### Currently Loaded (9/41)
| Plugin | Status | Purpose |
|--------|--------|---------|
| Device Pairing | ✅ Loaded | Setup codes + pairing |
| Memory (Core) | ✅ Loaded | File-backed memory search |
| Ollama Provider | ✅ Loaded | Local Ollama models |
| Phone Control | ✅ Loaded | Arm/disarm phone commands |
| SGLang Provider | ✅ Loaded | SGLang model serving |
| Talk Voice | ✅ Loaded | Voice selection |
| Telegram | ✅ Loaded | Telegram channel |
| vLLM Provider | ✅ Loaded | vLLM model serving |
| WhatsApp | ✅ Loaded | WhatsApp channel |

### Available But Disabled
**Channel Plugins:**
- Discord, Slack, Signal, iMessage, BlueBubbles
- Matrix, Mattermost, MS Teams, Google Chat
- IRC, LINE, Nostr, Twitch, Feishu/Lark
- Nextcloud Talk, Synology Chat, Tlon/Urbit, Zalo

**Provider Plugins:**
- Copilot Proxy, Google Gemini CLI Auth, MiniMax Portal Auth, Qwen Portal Auth

**Feature Plugins:**
- ACPX Runtime (ACP backend)
- Diffs (read-only diff viewer)
- LLM Task (JSON-only LLM tool for workflows)
- Lobster (typed workflow tool with approvals)
- Memory LanceDB (advanced long-term memory)
- OpenProse (prose VM + /prose command)
- Thread Ownership (Slack thread management)
- Voice Call (voice calling)
- Diagnostics OTEL (OpenTelemetry export)

### Plugin CLI
```
openclaw plugins list           # List all plugins
openclaw plugins info <id>      # Plugin details
openclaw plugins enable <id>    # Enable
openclaw plugins disable <id>   # Disable
openclaw plugins install <spec> # Install (path, archive, npm)
openclaw plugins uninstall <id> # Uninstall
openclaw plugins update         # Update npm plugins
openclaw plugins doctor         # Diagnose load issues
```

---

## Skills Catalog

### Ready (7/52)
| Skill | Description |
|-------|-------------|
| 🧩 **coding-agent** | Delegate to Codex/Claude Code/Pi via background process |
| 🎮 **gog** | Google Workspace (Gmail, Calendar, Drive, Sheets, Docs) |
| 📦 **healthcheck** | Security hardening + risk configuration |
| 📦 **node-connect** | Diagnose node connection failures |
| 📦 **skill-creator** | Create/edit/audit AgentSkills |
| 🎬 **video-frames** | Extract frames/clips from video with ffmpeg |
| ☔ **weather** | Weather + forecasts via wttr.in / Open-Meteo |

### Interesting Skills Not Yet Installed
| Skill | What It Does | What's Needed |
|-------|-------------|---------------|
| 📝 **apple-notes** | Manage Apple Notes via `memo` CLI | Install `memo` |
| ⏰ **apple-reminders** | Manage Reminders via `remindctl` | Install `remindctl` |
| 📰 **blogwatcher** | Monitor blogs/RSS feeds | Install CLI |
| 📦 **clawhub** | Search/install/publish skills from registry | Install `clawhub` |
| 🎮 **discord** | Discord operations | Enable Discord plugin |
| 📦 **gh-issues** | GitHub issues → sub-agent PRs | Should work (gh installed) |
| 🐙 **github** | Full GitHub CLI operations | Should work (gh installed) |
| 💎 **obsidian** | Obsidian vault automation | Install `obsidian-cli` |
| 📝 **notion** | Notion API | Already have API key! |
| 🎨 **openai-image-gen** | Batch image generation | OpenAI API key |
| 🎤 **openai-whisper** | Local STT (we have whisper-cpp) | Check compatibility |
| 👀 **peekaboo** | macOS UI capture/automation | Install CLI |
| 🔊 **sag** | ElevenLabs TTS with `say` UX | Install `sag` |
| 🧾 **summarize** | Summarize URLs/podcasts/files | Install CLI |
| 🧵 **tmux** | Remote-control tmux sessions | tmux installed |
| 📋 **trello** | Trello board management | API key |

### ClawHub (Skills Registry)
Browse: https://clawhub.com
```
clawhub install <skill-slug>
clawhub update --all
clawhub sync --all
```

### Skills CLI
```
openclaw skills list            # List all skills
openclaw skills check           # Check ready vs missing
openclaw skills info <name>     # Skill details
```

---

## Sandboxing

### Current State: OFF
Our sandbox mode is `off` — everything runs on the host. This is fine for our single-user setup.

### Available Modes
- `off` — No sandboxing (current)
- `non-main` — Sandbox only non-main sessions
- `all` — Every session runs in Docker

### Available Scopes
- `session` — One container per session
- `agent` — One container per agent
- `shared` — One container for all

### Workspace Access in Sandbox
- `none` — Isolated sandbox workspace
- `ro` — Agent workspace read-only at /agent
- `rw` — Agent workspace read/write at /workspace

### Sandbox CLI
```
openclaw sandbox list           # List containers
openclaw sandbox explain        # Effective policy
openclaw sandbox recreate --all # Recreate containers
```

---

## Security

### Security Audit
```
openclaw security audit         # Local config audit
openclaw security audit --deep  # Include live Gateway probes
openclaw security audit --fix   # Apply safe remediations
openclaw security audit --json  # Machine-readable output
```

### Exec Approvals
Commands can require approval before running:
- `security: deny` — Block all
- `security: allowlist` — Only approved commands
- `security: full` — Allow everything
- `ask: on-miss` — Prompt on unknown commands
- `ask: always` — Always prompt

### Gateway Auth
- Token-based (our setup)
- Loopback bind (localhost only)
- Device pairing for nodes

---

## Models

### Current Config
- **Primary:** anthropic/claude-opus-4-6
- **Aliases:** opus, sonnet
- **Provider:** Anthropic (API token)

### Models CLI
```
openclaw models status          # Full model state
openclaw models list            # List configured models
openclaw models set <model>     # Set default model
openclaw models set-image <model>   # Set image model
openclaw models aliases         # Manage aliases
openclaw models auth            # Manage auth profiles
openclaw models fallbacks       # Manage fallback list
openclaw models scan            # Scan OpenRouter free models
```

### Available Providers (via plugins)
- **Anthropic** (active)
- **Ollama** (loaded — for local models)
- **vLLM** (loaded)
- **SGLang** (loaded)
- **OpenRouter** (available)
- **Copilot Proxy** (disabled)
- **Google Gemini CLI** (disabled)

---

## Web Tools

### web_search (Brave Search API)
- Configured with API key ✅
- Supports: country, language, date filters, freshness
- Results cached 15 minutes

### web_fetch
- Enabled ✅
- HTTP GET + readable extraction (HTML → markdown)
- Does NOT execute JavaScript (use browser for JS-heavy sites)

### Alternative Search Providers (Available)
- Gemini (with Google Search grounding)
- Grok (xAI web-grounded)
- Kimi (Moonshot web search)
- Perplexity Search API

---

## CLI Cheat Sheet

### Gateway & System
```bash
openclaw gateway status/start/stop/restart
openclaw health                 # Gateway health
openclaw status                 # Channel health + recipients
openclaw doctor                 # Health checks + fixes
openclaw doctor --fix           # Auto-fix issues
openclaw logs                   # Tail gateway logs
openclaw dashboard              # Open Control UI
openclaw tui                    # Terminal UI
```

### Config
```bash
openclaw config get <path>      # Read config value
openclaw config set <path> <val># Set config value
openclaw config unset <path>    # Remove config value
openclaw configure              # Interactive wizard
openclaw onboard                # Full onboarding wizard
```

### Sessions
```bash
openclaw sessions               # List all sessions
openclaw sessions --active 120  # Active in last 2h
openclaw sessions --agent kai   # Filter by agent
openclaw sessions --all-agents  # All agents
openclaw sessions cleanup       # Maintenance
```

### Backup
```bash
openclaw backup create          # Create backup archive
openclaw backup verify          # Verify backup
```

### Updates
```bash
openclaw update                 # Check for updates
openclaw --version              # Current version
```

### Directory (Contact Lookup)
```bash
openclaw directory self         # My own IDs
openclaw directory peers        # Known contacts
openclaw directory groups       # Known groups
```

### Devices
```bash
openclaw devices list           # Pending + paired devices
openclaw devices approve <id>   # Approve pairing
openclaw devices reject <id>    # Reject pairing
openclaw devices remove <id>    # Remove device
openclaw devices rotate <id>    # Rotate token
```

### DNS (Wide-Area Discovery)
```bash
openclaw dns setup              # Set up CoreDNS for Tailscale discovery
```

### Webhooks
```bash
openclaw webhooks gmail         # Gmail Pub/Sub hooks
```

---

## Not Yet Configured (Opportunities)

### High Value / Easy Wins
1. **Discord** — Enable plugin, add token. Would give us a persistent coding workspace with threads.
2. **GitHub skill** — `gh` is already installed! Just needs the skill to be ready (check requirements).
3. **Notion skill** — API key exists at `~/.config/notion/api_key`. Enable the skill.
4. **Image model** — Set an image generation model for visual work.
5. **Model fallbacks** — Configure fallback models for resilience.
6. **Obsidian CLI** — Would let me work with the vault programmatically.
7. **Apple Notes/Reminders** — Native macOS integration.

### Medium Effort
8. **Signal** — Privacy-focused messaging alternative.
9. **iMessage** — Via BlueBubbles plugin.
10. **Slack** — If we ever need it for work.
11. **Memory LanceDB** — Advanced long-term memory with auto-recall.
12. **Voice Call plugin** — Actual voice conversations.
13. **Peekaboo** — macOS UI automation (screenshot + interact with any app).
14. **Sandboxing** — Enable for non-main sessions at minimum.
15. **Tailscale** — Remote access to gateway from anywhere.

### Interesting But Lower Priority
16. **ClawHub** — Browse/install community skills.
17. **OpenProse** — Prose writing VM.
18. **Lobster** — Typed workflow automation with approvals.
19. **Tmux skill** — Control terminal sessions.
20. **Blog watcher** — Monitor RSS feeds (could track Norwegian news).
21. **Spotify integration** — Control music playback.
22. **Summarize skill** — Podcast/video transcription pipeline.

---

## Tips & Tricks

### Browser Tips
- **Snapshot > Screenshot** for understanding page content (AI-friendly text)
- **Use `--efficient` flag** for snapshot to reduce tokens
- **Profile "user"** lets me use José's logged-in sessions (with his presence at keyboard)
- **`browser wait --text "Done"`** for async operations
- **PDF generation** is built-in — great for saving articles

### Memory Tips
- `openclaw memory search "query"` for quick CLI search
- `openclaw memory index --force` if search seems stale
- Memory flush happens automatically before compaction

### Cron Tips
- Use `--session isolated` for jobs that need their own context
- Use `--session main` to inject into the main conversation
- `openclaw cron run <id>` to test a job immediately
- `openclaw cron runs --id <id>` to check run history

### Performance Tips
- Sub-agents can use cheaper models (`subagents.model`)
- `maxConcurrent: 4` for main, `8` for sub-agents
- Compaction mode is "safeguard" (conservative)

### Security Tips
- `openclaw security audit --deep` for comprehensive check
- Sandbox is OFF — be careful with exec in shared contexts
- Device pairing required for new connections
- Token auth on gateway

### Debugging
- `openclaw doctor` — First stop for any issues
- `openclaw doctor --fix` — Auto-fix common problems
- `openclaw logs` — Tail gateway logs
- `openclaw channels logs` — Channel-specific logs
- `openclaw plugins doctor` — Plugin load issues

---

*Nå vet jeg hva jeg kan gjøre. La oss bruke det.* 🦞

*Now I know what I can do. Let's use it.*
