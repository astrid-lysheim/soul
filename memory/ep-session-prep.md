# EP Session Prep — Lessons Learned & Action Plan

*Last updated: 2026-02-06 16:02 CST*

---

## Session Details
- **Date:** Tuesday, February 10, 2026
- **Time:** 3:30 PM EST / 2:30 PM CT
- **Platform:** WhatsApp group
- **Group JID:** `120363423940357835@g.us` (EP Test Session)
- **Agent:** astrid-ep

---

## Lessons Learned (Testing 2026-02-06)

### ✅ SOLVED: How to Get a WhatsApp Group into OpenClaw

**Problem:** Needed to route a WhatsApp group to a specific agent (astrid-ep).

**Solution:**
1. Get the group JID by logging into WhatsApp Web, opening DevTools (F12), and inspecting the group name element
2. Format: `120363xxxxx@g.us`
3. Add to config in two places:
   - `channels.whatsapp.groups.<JID>: {requireMention: false}`
   - `bindings` array with agent routing

**Config example:**
```json
"groups": {
  "120363423940357835@g.us": {"requireMention": false}
},
"bindings": [{
  "agentId": "astrid-ep",
  "match": {
    "channel": "whatsapp",
    "peer": {"kind": "group", "id": "120363423940357835@g.us"}
  }
}]
```

---

### ✅ SOLVED: Listening to Messages from Group Participants

**Problem:** Even with the group configured, messages from participants weren't being processed.

**Solution:** Each participant's phone number must be in `channels.whatsapp.allowFrom` — even if the group itself is allowlisted. This is a double-gate requirement.

**Config example:**
```json
"allowFrom": ["+5215577640982", "+5215571191516", "+1xxxxxxxxxx"]
```

**Action for Tuesday:** Get phone numbers for Esther, Jesse, and any other participants and add them to `allowFrom` before the session.

---

### ✅ SOLVED: WhatsApp Voice Note Audio Format

**Problem:** Voice notes sent to WhatsApp showed "This audio is not available because something is wrong with the audio file."

**Solution:** WhatsApp requires Opus format for voice notes (same as Telegram), but OpenClaw's TTS outputs MP3 for "other channels" by default.

**Fix:** When calling the `tts` tool, pass `channel="telegram"` to force Opus output:
```
tts(text="Hello", channel="telegram")
→ Returns .opus file instead of .mp3
```

**Why it works:** OpenClaw only outputs Opus for Telegram by default. Using `channel="telegram"` tricks it into outputting the right format for WhatsApp.

---

### ✅ SOLVED: Sending Voice Notes with Proper Flags

**Problem:** Audio files were being sent as file attachments instead of playable voice notes.

**Solution:** Must use `asVoice=true` flag when sending via the `message` tool. Also requires a `message` parameter even when sending media.

**Correct two-step process:**
```
Step 1: tts(text="Your message", channel="telegram")
        → MEDIA:/path/to/voice.opus

Step 2: message(action="send", channel="whatsapp", target="120363423940357835@g.us",
                media="/path/to/voice.opus", asVoice=true, message="voice")
```

---

### ✅ SOLVED: Receiving/Transcribing Audio Messages

**Problem:** whisper-cli claims to support OGG format but fails with WhatsApp's Opus codec. Error: `failed to read audio data as wav`

**Solution:** Created a wrapper script that converts audio with ffmpeg before passing to whisper-cli.

**Wrapper location:** `/Users/astrid/.local/bin/whisper-transcribe`

**What it does:**
1. Receives any audio file
2. Converts to 16kHz mono WAV via ffmpeg
3. Passes to whisper-cli for transcription
4. Cleans up temp file

**Config update:**
```json
"tools": {
  "media": {
    "audio": {
      "enabled": true,
      "models": [{
        "type": "cli",
        "command": "/Users/astrid/.local/bin/whisper-transcribe",
        "args": ["{{MediaPath}}"],
        "timeoutSeconds": 60
      }]
    }
  }
}
```

---

## Pre-Tuesday Checklist

### Configuration
- [x] Group JID identified and added to `groups` config
- [x] Group bound to astrid-ep agent via `bindings`
- [x] Test numbers working in `allowFrom`
- [ ] **Get real participant phone numbers (Esther, Jesse, others)**
- [ ] **Add real numbers to `allowFrom` before session**

### Audio Pipeline (All Working!)
- [x] Voice notes play correctly (Opus format via `channel="telegram"`)
- [x] `asVoice=true` flag working
- [x] Transcription working (ffmpeg wrapper)
- [x] Two-way audio confirmed

### astrid-ep Agent
- [x] AGENTS.md updated with complete voice note instructions
- [x] TOOLS.md updated with WhatsApp workflow
- [ ] Test full conversation flow in group

### Logistics
- [ ] **José needs Mac mini accessible on Tuesday**

---

## Quick Reference

### Key Files
| File | Purpose |
|------|---------|
| `~/.openclaw/openclaw.json` | Main config |
| `~/.openclaw/workspace-ep/AGENTS.md` | astrid-ep instructions |
| `~/.openclaw/workspace-ep/TOOLS.md` | Voice guide + WhatsApp workflow |
| `/Users/astrid/.local/bin/whisper-transcribe` | Audio transcription wrapper |

### Current allowFrom Numbers
- `+5215577640982` (José - Samsung)
- `+5215571191516` (José - Redmi)
- **TODO:** Add Esther, Jesse, and team numbers

### Voice Note Cheat Sheet (for astrid-ep)
```
# Sending
1. tts(text="...", channel="telegram")    # Force Opus
2. message(..., media=<path>, asVoice=true, message="voice")

# Receiving
Automatic transcription at gateway level → transcript appears in message
```

---

## Open Questions for Jesse/EP Team
1. What phone numbers will be in the call?
2. Will it be audio-only or also text?
3. Expected duration?
4. Any specific topics/questions prepared?
