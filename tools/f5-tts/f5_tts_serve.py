#!/usr/bin/env python3
"""
F5-TTS-MLX wrapper for OpenClaw TTS integration.

Generates speech audio from text using F5-TTS (voice cloning) on Apple Silicon.
Uses Astrid's voice reference pangrams for cloning.

Usage:
    python f5_tts_serve.py --text "Hello world" --output /tmp/output.wav
    python f5_tts_serve.py --text "I'm excited!" --emotion excited --output /tmp/output.wav
    echo "Hello world" | python f5_tts_serve.py --output /tmp/output.wav

Emotions: neutral (default), calm, happy, excited, playful
"""

import argparse
import os
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REFERENCES_DIR = os.path.join(SCRIPT_DIR, "references")

# Reference audio text (first ~10 seconds of the pangram spoken in each reference file)
# Trimmed to match the 10-second reference clips.
# Full pangram: "The beige hue on the waters of the loch impressed all,
#   including the French queen, before she heard that symphony again,
#   just as young Arthur wanted."
# At normal speech rate, ~10s covers roughly:
REF_TEXT = (
    "The beige hue on the waters of the loch impressed all, "
    "including the French queen, before she heard that symphony again,"
)

EMOTIONS = {
    "neutral": "astrid_neutral.wav",
    "calm": "astrid_calm.wav",
    "happy": "astrid_happy.wav",
    "excited": "astrid_excited.wav",
    "playful": "astrid_playful.wav",
}

DEFAULT_EMOTION = "neutral"


def get_ref_audio_path(emotion: str) -> str:
    """Get the reference audio path for a given emotion."""
    filename = EMOTIONS.get(emotion, EMOTIONS[DEFAULT_EMOTION])
    path = os.path.join(REFERENCES_DIR, filename)
    if not os.path.exists(path):
        # Fall back to neutral
        path = os.path.join(REFERENCES_DIR, EMOTIONS[DEFAULT_EMOTION])
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Reference audio not found at {path}. "
            f"Run the setup to convert reference pangrams to 24kHz WAV."
        )
    return path


def generate_speech(
    text: str,
    output_path: str,
    emotion: str = DEFAULT_EMOTION,
    steps: int = 8,
    method: str = "rk4",
    cfg_strength: float = 2.0,
    speed: float = 1.0,
    seed: int | None = None,
    quantize: int | None = 8,
) -> str:
    """Generate speech audio from text using F5-TTS-MLX.
    
    Args:
        text: Text to synthesize
        output_path: Path to save the output audio (.wav)
        emotion: Voice emotion variant (neutral, calm, happy, excited, playful)
        steps: Number of ODE solver steps (higher = better quality, slower)
        method: ODE solver method (euler, midpoint, rk4)
        cfg_strength: Classifier-free guidance strength
        speed: Speech speed multiplier
        seed: Random seed for reproducibility
        quantize: Quantization bits (4 or 8, None for full precision)
    
    Returns:
        Path to the generated audio file
    """
    from f5_tts_mlx.generate import generate

    ref_audio_path = get_ref_audio_path(emotion)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    print(f"[f5-tts] Generating speech for: {text[:80]}{'...' if len(text) > 80 else ''}", file=sys.stderr)
    print(f"[f5-tts] Emotion: {emotion}, Steps: {steps}, Method: {method}", file=sys.stderr)
    
    start = time.time()
    
    generate(
        generation_text=text,
        ref_audio_path=ref_audio_path,
        ref_audio_text=REF_TEXT,
        output_path=output_path,
        steps=steps,
        method=method,
        cfg_strength=cfg_strength,
        speed=speed,
        seed=seed,
        quantization_bits=quantize,
        estimate_duration=True,
    )
    
    elapsed = time.time() - start
    
    if os.path.exists(output_path):
        size_kb = os.path.getsize(output_path) / 1024
        print(f"[f5-tts] Done in {elapsed:.1f}s → {output_path} ({size_kb:.0f} KB)", file=sys.stderr)
        return output_path
    else:
        raise RuntimeError("F5-TTS generation failed — no output file created")


def main():
    parser = argparse.ArgumentParser(
        description="Generate speech audio using F5-TTS-MLX (Astrid's voice)"
    )
    parser.add_argument(
        "--text", type=str, default=None,
        help="Text to synthesize (reads stdin if omitted)"
    )
    parser.add_argument(
        "--output", "-o", type=str, required=True,
        help="Output file path (.wav)"
    )
    parser.add_argument(
        "--emotion", type=str, default=DEFAULT_EMOTION,
        choices=list(EMOTIONS.keys()),
        help=f"Voice emotion (default: {DEFAULT_EMOTION})"
    )
    parser.add_argument(
        "--steps", type=int, default=8,
        help="ODE solver steps (default: 8, higher = better quality)"
    )
    parser.add_argument(
        "--method", type=str, default="rk4",
        choices=["euler", "midpoint", "rk4"],
        help="ODE solver method (default: rk4)"
    )
    parser.add_argument(
        "--cfg", type=float, default=2.0,
        help="Classifier-free guidance strength (default: 2.0)"
    )
    parser.add_argument(
        "--speed", type=float, default=1.0,
        help="Speech speed (default: 1.0)"
    )
    parser.add_argument(
        "--seed", type=int, default=None,
        help="Random seed for reproducibility"
    )
    parser.add_argument(
        "--quantize", "-q", type=int, default=8,
        choices=[4, 8],
        help="Quantization bits (4 or 8, default: 8 — required on 16GB Mac)"
    )

    args = parser.parse_args()

    # Get text from args or stdin
    text = args.text
    if text is None:
        if not sys.stdin.isatty():
            text = sys.stdin.read().strip()
        else:
            print("Error: --text required or pipe text via stdin", file=sys.stderr)
            sys.exit(1)
    
    if not text:
        print("Error: empty text", file=sys.stderr)
        sys.exit(1)

    try:
        path = generate_speech(
            text=text,
            output_path=args.output,
            emotion=args.emotion,
            steps=args.steps,
            method=args.method,
            cfg_strength=args.cfg,
            speed=args.speed,
            seed=args.seed,
            quantize=args.quantize,
        )
        # Print the output path to stdout (for piping/scripting)
        print(path)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
