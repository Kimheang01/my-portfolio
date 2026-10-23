#!/usr/bin/env bash
# Joins one or more video clips (with cross-fades) and exports them as JPG
# frames for the scroll-driven hero animation.
#
#   yarn frames:video ~/Desktop/hero-1.mp4 ~/Desktop/hero-2.mp4 ~/Desktop/hero-3.mp4
#
# Options (environment variables):
#   FRAMES=240   total number of frames to export
#   WIDTH=1280   frame width (height follows 16:9)
#   FADE=0.6     cross-fade length between clips, in seconds
#   CROP_BOTTOM=0  pixels to trim off the bottom (e.g. to remove a watermark)
#   QUALITY=7    JPG quality, 2 (best, biggest) to 31 (worst, smallest)
#
# After running, set heroSequence.frameCount in content/site.ts to FRAMES.
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: yarn frames:video <clip1.mp4> [clip2.mp4 ...]" >&2
  exit 1
fi

FRAMES="${FRAMES:-240}"
WIDTH="${WIDTH:-1280}"
HEIGHT=$((WIDTH * 9 / 16))
FADE="${FADE:-0.6}"
CROP_BOTTOM="${CROP_BOTTOM:-0}"
QUALITY="${QUALITY:-7}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/sequence/hero"

inputs=()
filters=""
total=0
i=0
for clip in "$@"; do
  duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$clip")
  inputs+=(-i "$clip")
  # Trim the watermark area, then scale/crop every clip to the same 16:9 size and frame rate.
  filters+="[$i:v]crop=iw:ih-${CROP_BOTTOM}:0:0,scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=30,setsar=1,format=yuv420p,settb=AVTB[v$i];"
  if [ "$i" -eq 0 ]; then
    total="$duration"
    last="v0"
  else
    offset=$(awk -v t="$total" -v f="$FADE" 'BEGIN { printf "%.3f", t - f }')
    filters+="[$last][v$i]xfade=transition=fade:duration=${FADE}:offset=${offset}[x$i];"
    total=$(awk -v t="$total" -v d="$duration" -v f="$FADE" 'BEGIN { printf "%.3f", t + d - f }')
    last="x$i"
  fi
  i=$((i + 1))
done

rate=$(awk -v n="$FRAMES" -v t="$total" 'BEGIN { printf "%.5f", n / t }')
filters+="[$last]fps=${rate}[out]"

echo "Clips: $#  Total length: ${total}s  Exporting ${FRAMES} frames at ${WIDTH}x${HEIGHT}"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
ffmpeg -v error -stats "${inputs[@]}" -filter_complex "$filters" -map "[out]" \
  -frames:v "$FRAMES" -q:v "$QUALITY" "$OUT_DIR/frame-%03d.jpg"

count=$(ls "$OUT_DIR" | wc -l | tr -d ' ')
echo "Wrote $count frames to public/sequence/hero/ ($(du -sh "$OUT_DIR" | cut -f1))"
