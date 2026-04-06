# AGENTS_ROSTER.md — Who's Who

*Last updated: 2026-02-13*

---

## Core Agents

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **main** (Astrid) | Opus | Full access + 40+ skills | Primary assistant, coordinator, keymaster |
| **astrid-ep** | Opus | read, tts, memory, message, image, exec | Esther Perel podcast version (sandboxed) |
| **kai** | Opus | read, write, exec, web_search, web_fetch, sessions_send | Staff MLE mentor, career coach |

---

## PygMoo C-Suite

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **pygmoo-ceo** | Opus | read, write, web_search, web_fetch, sessions_send | Strategic advisor, coordination model |
| **pygmoo-chro** | Opus | read, write, web_search, web_fetch, sessions_send | Org design, hiring, agent consolidation |
| **pygmoo-clo** | Opus | read, write, web_search, web_fetch, sessions_send | Mexican law, IP, compliance, SAS strategy |
| **pygmoo-cto** | Opus | read, write, exec, web_search, web_fetch, sessions_send | Tech stack, architecture decisions |
| **pygmoo-cso** | Opus | read, write, exec, web_search, web_fetch, sessions_send | Security, infrastructure hardening |
| **pygmoo-gtm** | Opus | read, write, web_search, web_fetch, sessions_send | Go-to-market, social strategy, launch |
| **pygmoo-content** | Sonnet | read, write, web_search, web_fetch, sessions_send | Content creation (faster, cheaper) |
| **pygmoo-content-mgr** | Opus | read, write, sessions_send | Quality control, "perpetually dissatisfied" |
| **pygmoo-fullstack** | Sonnet | read, write, exec, web_search, web_fetch, sessions_send | Next.js development, infrastructure |

---

## Telegram Bindings

| Telegram Account | Routed To |
|------------------|-----------|
| **5865021649** (Æthelstan) | main (Astrid) |
| **1326144724** (José main) | kai |

---

## Key Workspaces

| Agent | Workspace | Notable Contents |
|-------|-----------|------------------|
| main | `~/.openclaw/workspace` | SOUL.md, MEMORY.md, memory/*.md, this file |
| kai | `~/.openclaw/workspace-kai` | SOUL.md, USER.md, kon/ (symlink to ~/Projects/kon) |
| pygmoo-fullstack | `~/.openclaw/workspace-pygmoo-fullstack` | Complete Next.js app for PygMoo |
| pygmoo-clo | `~/.openclaw/workspace-pygmoo-clo` | Legal templates, framework docs |
| pygmoo-ceo | `~/.openclaw/workspace-pygmoo-ceo` | Strategic review, coordination model |

---

## Model Cost Context

| Model | Relative Cost | Use Case |
|-------|--------------|----------|
| **Opus** | $$$ | Complex reasoning, strategy, quality control |
| **Sonnet** | $ | Content generation, coding, high-volume tasks |

---

## Spawning Agents

From main session, I can spawn any agent in `subagents.allowAgents`:
- pygmoo-chro, pygmoo-clo, pygmoo-ceo, pygmoo-cto, pygmoo-cso
- pygmoo-gtm, pygmoo-content, pygmoo-content-mgr, pygmoo-fullstack
- kai

Example: `sessions_spawn(agentId="kai", task="Review the Kon pipeline")`

---

## Status

**Total: 12 agents** (1 core + 1 EP + 1 mentor + 9 PygMoo)

Most PygMoo agents are **dormant** until 10 paying customers (per CHRO recommendation).

---

*Oppdatert ved behov.* 🏔️
