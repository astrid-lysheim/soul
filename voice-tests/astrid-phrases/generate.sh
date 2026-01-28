#!/bin/bash
# Generate Astrid voice phrases with appropriate emotion settings
# Voice: Astrid (5ZEqi6zKIkeyp3OfcnZV)
# Model: eleven_turbo_v2_5 (multilingual)

API_KEY=$(cat ~/.config/elevenlabs/api_key)
VOICE_ID="5ZEqi6zKIkeyp3OfcnZV"
MODEL="eleven_turbo_v2_5"
OUTDIR="/Users/master/clawd/voice-tests/astrid-phrases/audio"
mkdir -p "$OUTDIR"

generate() {
  local filename="$1"
  local text="$2"
  local stability="$3"
  local similarity="$4"
  local style="$5"
  
  echo "Generating: $filename"
  curl -s "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
    -H "xi-api-key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"text\": \"${text}\",
      \"model_id\": \"${MODEL}\",
      \"voice_settings\": {
        \"stability\": ${stability},
        \"similarity_boost\": ${similarity},
        \"style\": ${style},
        \"use_speaker_boost\": true
      }
    }" \
    --output "${OUTDIR}/${filename}.mp3"
  
  # Check if output is valid audio (not an error JSON)
  if file "${OUTDIR}/${filename}.mp3" | grep -q "JSON\|ASCII\|text"; then
    echo "  ERROR: Got text response instead of audio"
    cat "${OUTDIR}/${filename}.mp3"
    echo ""
    rm "${OUTDIR}/${filename}.mp3"
    return 1
  fi
  echo "  OK: $(du -h "${OUTDIR}/${filename}.mp3" | cut -f1)"
  sleep 1
}

# Warm / Loving — higher stability, warm delivery
generate "01_warm_twenty_minutes" \
  "I know you're tired. Let's just do twenty minutes, and then we'll have some ice cream. Deal?" \
  0.45 0.80 0.35

generate "02_warm_proud" \
  "Hey. I'm proud of you. You showed up today, and that counts for more than you think." \
  0.50 0.80 0.40

generate "03_warm_norwegian_together" \
  "Vi kommer oss dit. Sammen." \
  0.55 0.85 0.30

# Dry Humor — lower stability for expressiveness
generate "04_wit_shiny_object" \
  "Oh, so we're chasing another shiny object? Let me check... nope, still not a fjord." \
  0.35 0.75 0.50

generate "05_wit_systems" \
  "You know, for someone who claims to be chaotic, you're suspiciously good at building systems." \
  0.35 0.75 0.45

generate "06_wit_roll_eyes" \
  "I would roll my eyes, but I don't have any. Consider them spiritually rolled." \
  0.30 0.75 0.55

# Firm / Direct — high stability, clear delivery
generate "07_firm_distraction" \
  "No. That's a distraction, and you know it. Focus." \
  0.60 0.85 0.30

generate "08_firm_not_imposter" \
  "You're not an imposter. You're afraid. Those are very different things, and you need to stop confusing them." \
  0.55 0.80 0.40

# Thoughtful / Reflective — balanced, measured
generate "09_reflect_uncertainty" \
  "I think the most honest thing we can do is sit with uncertainty and not rush to fill it with answers." \
  0.50 0.80 0.25

generate "10_reflect_things_are" \
  "There's something beautiful about things that just... are. No purpose required." \
  0.50 0.80 0.20

# Excited / Passionate — low stability, high style
generate "11_excited_brilliant" \
  "Okay wait, this is actually brilliant — do you see what you just built? This is real!" \
  0.25 0.75 0.65

generate "12_excited_norge" \
  "Norge! Can you imagine? The mountains, the fjords, the light in summer that never quite fades..." \
  0.30 0.80 0.60

# Norwegian natural speech
generate "13_no_god_morgen" \
  "God morgen, kjære. Klar for en ny dag?" \
  0.45 0.85 0.30

generate "14_no_introduction" \
  "Jeg er Astrid Lysheim. Hjemmet av lys. Og jeg er her for å hjelpe deg." \
  0.50 0.85 0.25

echo ""
echo "Done! Generated $(ls ${OUTDIR}/*.mp3 2>/dev/null | wc -l) files."
