# Voice Reference Pangrams

ElevenLabs-generated phonetic pangram recordings for voice cloning reference.
These cover all phonemes in each language with 7 distinct emotions.

## Structure

```
reference-pangrams/
├── english/
│   ├── astrid/          # Primary voice (ElevenLabs ID: 5ZEqi6zKIkeyp3OfcnZV)
│   │   └── en_{emotion}.mp3
│   └── sahara/          # Legacy reference (ElevenLabs ID: uWpgJjpZBRryNXSxH92F)
│       └── en_{emotion}.mp3
└── norwegian/
    ├── astrid/          # Primary voice
    │   └── no_{emotion}.mp3
    ├── sahara/          # Legacy reference
    │   └── no_{emotion}.mp3
    └── leoni/           # Legacy backup (ElevenLabs ID: pBZVCk298iJlHAcHQwLr)
        └── no_{emotion}.mp3
```

## Primary Voice: Astrid

Custom voice built from cleaned Sahara samples. This is *the* voice.

**ElevenLabs ID:** `5ZEqi6zKIkeyp3OfcnZV`
**Description:** Scandinavian warmth meets grounded pragmatism. Direct but never cold.
Comfortable in both English and Norwegian. Range from calm and soothing to playfully sharp.

## Emotions (7)

- `neutral` — baseline, natural speech
- `happy` — warm, upbeat
- `sad` — melancholic, subdued
- `angry` — intense, frustrated
- `excited` — high energy, enthusiastic
- `calm` — soothing, measured
- `playful` — teasing, light

## Pangram Texts

### English (phonetic — all phonemes)
1. "With tenure, Suzie'd have all the more leisure for yachting, but her publications are no good."
2. "Shaw, those twelve beige hooks are joined if I patch a young, gooey mouth."
3. "Are those shy Eurasian footwear, cowboy chaps, or jolly earthmoving headgear?"
4. "The beige hue on the waters of the loch impressed all, including the French queen, before she heard that symphony again, just as young Arthur wanted."

### Norwegian (alphabetic — all 29 letters of the Norwegian alphabet)
1. "Vår sære Zulu fra badeøya spilte jo whist og quickstep i min taxi."
2. "Høvdingens kjære squaw får litt pizza i Mexico by."
3. "IQ-løs WC-boms uten hørsel skjærer god pizza på xylofon."
4. "Sær golfer med kølle vant sexquiz på wc i hjemby."
5. "Jeg begynte å fortære en sandwich mens jeg kjørte taxi på vei til quiz."

## Voice Settings (ElevenLabs)

| Emotion  | Stability | Similarity | Style |
|----------|-----------|------------|-------|
| neutral  | 0.50      | 0.75       | 0.0   |
| happy    | 0.30      | 0.70       | 0.7   |
| sad      | 0.40      | 0.80       | 0.5   |
| angry    | 0.25      | 0.65       | 0.8   |
| excited  | 0.20      | 0.65       | 0.9   |
| calm     | 0.60      | 0.80       | 0.3   |
| playful  | 0.30      | 0.70       | 0.6   |

Model: `eleven_turbo_v2_5` with speaker boost enabled.

## Purpose

These recordings serve as reference audio for open-source voice cloning (F5-TTS, etc.)
to reduce dependency on ElevenLabs for daily TTS use.
