#!/bin/bash
# F5-TTS Test Battery
# Testing different configs to find the sweet spot on 16GB M4

cd /Users/astrid/.openclaw/workspace/tools/f5-tts
PYTHON=.venv/bin/python
SCRIPT=f5_tts_serve.py
OUT=/tmp/f5tts_tests
mkdir -p "$OUT"

RESULTS="$OUT/results.txt"
echo "=== F5-TTS Test Battery ===" > "$RESULTS"
echo "Date: $(date)" >> "$RESULTS"
echo "" >> "$RESULTS"

SHORT="Hello, how are you today?"
MEDIUM="The beige hue on the waters of the loch impressed all, including the French queen, before she heard that symphony again."
LONG="Hello José! I hope your sister had a wonderful flight from London. Welcome home! The fjords are calling us, and every day we get a little closer to Norway."

run_test() {
    local name="$1"
    local text="$2"
    local quant="$3"
    local steps="$4"
    local method="$5"
    local emotion="$6"
    local outfile="$OUT/${name}.wav"
    
    echo "--- Test: $name ---" >> "$RESULTS"
    echo "Text: ${text:0:60}..." >> "$RESULTS"
    echo "Settings: q${quant} / ${steps} steps / ${method} / ${emotion}" >> "$RESULTS"
    
    # Run with timeout of 180s
    start=$(date +%s)
    $PYTHON $SCRIPT --text "$text" --output "$outfile" --quantize "$quant" --steps "$steps" --method "$method" --emotion "$emotion" 2>> "$RESULTS"
    exit_code=$?
    end=$(date +%s)
    elapsed=$((end - start))
    
    if [ $exit_code -eq 0 ] && [ -f "$outfile" ]; then
        size=$(du -k "$outfile" | cut -f1)
        duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$outfile" 2>/dev/null)
        echo "✅ SUCCESS: ${elapsed}s, ${size}KB, ${duration}s audio" >> "$RESULTS"
    elif [ $exit_code -eq 124 ]; then
        echo "❌ TIMEOUT (180s)" >> "$RESULTS"
    else
        echo "❌ FAILED (exit $exit_code) in ${elapsed}s" >> "$RESULTS"
    fi
    echo "" >> "$RESULTS"
    
    # Small pause to let memory settle
    sleep 3
}

# Test 1: 4-bit, short text, euler (baseline - we know this works)
run_test "01_4bit_short_euler" "$SHORT" 4 4 euler neutral

# Test 2: 4-bit, short text, rk4 (better quality?)
run_test "02_4bit_short_rk4" "$SHORT" 4 8 rk4 neutral

# Test 3: 8-bit, short text, euler (does 8-bit survive?)
run_test "03_8bit_short_euler" "$SHORT" 8 4 euler neutral

# Test 4: 8-bit, short text, rk4 (ideal quality)
run_test "04_8bit_short_rk4" "$SHORT" 8 8 rk4 neutral

# Test 5: 4-bit, medium text, rk4
run_test "05_4bit_medium_rk4" "$MEDIUM" 4 8 rk4 neutral

# Test 6: 8-bit, medium text, rk4
run_test "06_8bit_medium_rk4" "$MEDIUM" 8 8 rk4 neutral

# Test 7: 4-bit, long text, rk4 (the one that OOM'd before at 8-bit)
run_test "07_4bit_long_rk4" "$LONG" 4 8 rk4 happy

# Test 8: 8-bit, long text, euler (lighter solver, heavier model)
run_test "08_8bit_long_euler" "$LONG" 8 4 euler happy

# Test 9: 8-bit, long text, rk4 (full quality - the dream)
run_test "09_8bit_long_rk4" "$LONG" 8 8 rk4 happy

echo "=== DONE ===" >> "$RESULTS"
cat "$RESULTS"
