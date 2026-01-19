#!/bin/bash

# Script to download piano sound samples from University of Iowa
# Downloads notes from C4 to G6 (including black keys) in mezzo-forte (mf) dynamics

BASE_URL="https://theremin.music.uiowa.edu/sound%20files/MIS/Piano_Other/piano"
OUTPUT_DIR="../public/sounds/piano"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Define the notes we need (C4 to G6, including sharps)
NOTES=(
  # Octave 4
  "Piano.mf.C4.aiff"
  "Piano.mf.Db4.aiff"
  "Piano.mf.D4.aiff"
  "Piano.mf.Eb4.aiff"
  "Piano.mf.E4.aiff"
  "Piano.mf.F4.aiff"
  "Piano.mf.Gb4.aiff"
  "Piano.mf.G4.aiff"
  "Piano.mf.Ab4.aiff"
  "Piano.mf.A4.aiff"
  "Piano.mf.Bb4.aiff"
  "Piano.mf.B4.aiff"

  # Octave 5
  "Piano.mf.C5.aiff"
  "Piano.mf.Db5.aiff"
  "Piano.mf.D5.aiff"
  "Piano.mf.Eb5.aiff"
  "Piano.mf.E5.aiff"
  "Piano.mf.F5.aiff"
  "Piano.mf.Gb5.aiff"
  "Piano.mf.G5.aiff"
  "Piano.mf.Ab5.aiff"
  "Piano.mf.A5.aiff"
  "Piano.mf.Bb5.aiff"
  "Piano.mf.B5.aiff"

  # Octave 6
  "Piano.mf.C6.aiff"
  "Piano.mf.Db6.aiff"
  "Piano.mf.D6.aiff"
  "Piano.mf.Eb6.aiff"
  "Piano.mf.E6.aiff"
  "Piano.mf.F6.aiff"
  "Piano.mf.Gb6.aiff"
  "Piano.mf.G6.aiff"
  "Piano.mf.Ab6.aiff"
  "Piano.mf.A6.aiff"
  "Piano.mf.Bb6.aiff"
  "Piano.mf.B6.aiff"
)

echo "Downloading piano sound samples..."
echo "Output directory: $OUTPUT_DIR"
echo ""

# Download each file
for note in "${NOTES[@]}"; do
  echo "Downloading $note..."
  curl -L -o "$OUTPUT_DIR/$note" "$BASE_URL/$note"

  if [ $? -eq 0 ]; then
    echo "✓ Downloaded $note"
  else
    echo "✗ Failed to download $note"
  fi
  echo ""
done

echo "Download complete!"
echo ""
echo "Converting AIFF files to MP3 for web compatibility..."

# Check if ffmpeg is installed
if command -v ffmpeg &> /dev/null; then
  for aiff_file in "$OUTPUT_DIR"/*.aiff; do
    if [ -f "$aiff_file" ]; then
      base_name=$(basename "$aiff_file" .aiff)
      mp3_file="$OUTPUT_DIR/$base_name.mp3"
      echo "Converting $base_name.aiff to MP3..."
      ffmpeg -i "$aiff_file" -acodec libmp3lame -b:a 128k "$mp3_file" -y 2>&1 | grep -v "^frame="
      if [ $? -eq 0 ]; then
        echo "✓ Converted $base_name.mp3"
        rm "$aiff_file"  # Remove AIFF file after successful conversion
      else
        echo "✗ Failed to convert $base_name"
      fi
    fi
  done
  echo ""
  echo "Conversion complete! AIFF files have been removed."
else
  echo "ffmpeg not found. Please install ffmpeg to convert AIFF to MP3."
  echo "On macOS: brew install ffmpeg"
  echo "Files are saved as AIFF format."
fi

echo ""
echo "All done! Sound files are in: $OUTPUT_DIR"
