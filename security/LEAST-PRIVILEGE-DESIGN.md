# Least Privilege Design for OpenClaw Agents

*Implemented: 2026-02-16*

## Principles

1. **exec** — Only for roles that write/run code
2. **web_fetch/web_search** — Only for roles needing external research
3. **sessions_spawn** — Only for managers who delegate
4. **gateway** — Nobody (including main) — too dangerous

## Agent Tool Matrix

| Agent | read | write | exec | web_* | sessions_send | sessions_spawn | Notes |
|-------|------|-------|------|-------|---------------|----------------|-------|
| **main** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Full access (owner agent) |
| **astrid-ep** | ✅ | ❌ | ❌ | ❌ | ✅ (message) | ❌ | Podcast only - no code/web |
| **kai** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Mentor needs exec for code review |

### C-Suite

| Agent | read | write | exec | web_* | sessions_send | sessions_spawn | Notes |
|-------|------|-------|------|-------|---------------|----------------|-------|
| **pygmoo-ceo** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | Strategy research, no code |
| **pygmoo-cto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Tech lead, needs exec |
| **pygmoo-clo** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Legal research |
| **pygmoo-chro** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | Internal HR, no external |
| **pygmoo-cso** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | Internal strategy, no code/web |
| **pygmoo-cpo** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Product research |

### Marketing/Content

| Agent | read | write | exec | web_* | sessions_send | sessions_spawn | Notes |
|-------|------|-------|------|-------|---------------|----------------|-------|
| **pygmoo-gtm** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Market research |
| **pygmoo-content-mgr** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Manager, delegates to creators |
| **pygmoo-content** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | Creator needs research |

### Curriculum

| Agent | read | write | exec | web_* | sessions_send | sessions_spawn | Notes |
|-------|------|-------|------|-------|---------------|----------------|-------|
| **pygmoo-curriculum-mgr** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Manager, delegates |
| **pygmoo-curriculum-creator** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | Creator needs research |

### Tech

| Agent | read | write | exec | web_* | sessions_send | sessions_spawn | Notes |
|-------|------|-------|------|-------|---------------|----------------|-------|
| **pygmoo-fullstack** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Dev needs exec |
| **pygmoo-prompt-eng** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | Internal prompt work |

### Legal Team

| Agent | read | write | exec | web_* | sessions_send | sessions_spawn | Notes |
|-------|------|-------|------|-------|---------------|----------------|-------|
| **All 6 legal counsels** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | Legal research needed |

## Changes from Current Config

| Agent | Removed | Reason |
|-------|---------|--------|
| astrid-ep | exec | Podcast doesn't need shell access |
| pygmoo-chro | web_search, web_fetch | HR is internal-facing |
| pygmoo-cso | exec, web_search, web_fetch | Strategy is internal analysis |
| pygmoo-prompt-eng | web_search, web_fetch | Prompt work is internal |

## Exec Approvals

For agents that retain `exec`:
- **main**: allowlist mode, auto-allow skills
- **pygmoo-cto**: allowlist mode
- **pygmoo-fullstack**: allowlist mode  
- **kai**: allowlist mode

## Sandboxing (Phase 2)

Built Docker sandbox image `openclaw-sandbox:bookworm-slim` and enabled sandboxing.

### Sandbox Status

| Agent | Sandboxed | Reason |
|-------|-----------|--------|
| **main** | ❌ | Owner agent, needs full host access |
| **kai** | ❌ | Mentor needs real code execution |
| **All 19 PygMoo agents** | ✅ | Don't need host access |
| **astrid-ep** | ✅ | Podcast only |

### Sandbox Config
- Image: `openclaw-sandbox:bookworm-slim` (debian + git/curl/jq)
- Scope: per-agent (one container each)
- Workspace: read/write access to agent workspace
- Network: bridge (for web_fetch)
- User: 1000:1000 (non-root)

---

*Principle: If you don't need it, you don't have it. If you don't need host access, you don't get it.* 🔐
