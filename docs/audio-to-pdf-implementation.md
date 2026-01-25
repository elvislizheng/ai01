# Audio to Sheet Music PDF - Implementation Guide

## Overview
Complete implementation of audio file (WAV/MP3) to professional sheet music PDF conversion using AI-powered note detection.

### Key Features
- 🎹 **Two-Track Output:** Automatically splits audio into treble (right hand) and bass (left hand) tracks
- 🎵 **AI-Powered:** Spotify Basic Pitch for polyphonic note detection
- 📝 **Professional Notation:** OSMD-rendered sheet music with grand staff
- 📄 **PDF Export:** High-quality multi-page PDFs with proper formatting
- ✏️ **Editable:** Each track can be edited independently in the piano roll

## Technology Stack

### Audio Processing
- **@spotify/basic-pitch** (v1.0.1) - Polyphonic audio-to-MIDI transcription
- **@tensorflow/tfjs** (v4.22.0) - Machine learning framework
- **Web Audio API** - Audio decoding and resampling

### MIDI Processing
- **midi-player-js** (v2.0.16) - Enhanced MIDI event parsing and extraction
- **@tonejs/midi** (v2.0.28) - MIDI data parsing and structuring
- Custom MIDI data types and utilities

### Sheet Music Rendering
- **opensheetmusicdisplay** (v1.9.4) - Professional sheet music rendering
- **musicxml-interfaces** (v0.0.21) - MusicXML type definitions
- Custom MIDI to MusicXML converter

### PDF Export
- **jsPDF** (v4.0.0) - PDF generation
- **html2canvas** (v1.4.1) - Capture rendered sheet music as image

## Architecture Flow

```
┌─────────────────┐
│  Upload Audio   │ WAV/MP3 file
│   (WAV/MP3)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Basic Pitch AI │ Polyphonic note detection
│   Transcription │ • Onset threshold: 0.35
└────────┬────────┘ • Frame threshold: 0.25
         │          • Min duration: 3 frames
         ▼
┌─────────────────┐
│   MIDI Data     │ Internal representation
│   Structure     │ • Tempo, time signature
└────────┬────────┘ • TWO TRACKS: Treble + Bass
         │          • Split at middle C (MIDI 60)
         │          • Notes with pitch, timing, velocity
         ▼
┌─────────────────┐
│ MidiPlayerJS    │ Event extraction
│   + @tonejs     │ • Tempo & time signature
└────────┬────────┘ • MIDI event parsing
         │          • Better quantization
         │          • Chord detection
         ▼
┌─────────────────┐
│    MusicXML     │ Standard music notation format
│   Generation    │ • Grand staff (treble + bass)
└────────┬────────┘ • Uses pre-split tracks
         │          • Proper note values & rests
         ▼
┌─────────────────┐
│      OSMD       │ Professional rendering
│   Rendering     │ • SVG-based sheet music
└────────┬────────┘ • High quality output
         │
         ▼
┌─────────────────┐
│  html2canvas    │ Capture as image
│   Capture       │ • 2x scale for quality
└────────┬────────┘ • White background
         │
         ▼
┌─────────────────┐
│     jsPDF       │ Multi-page PDF
│  PDF Export     │ • A4 format
└─────────────────┘ • Auto page breaks
```

## Key Files

### Core Libraries

#### `/lib/audio-to-midi.ts`
**Purpose:** Convert audio files to MIDI data using Basic Pitch AI

**Key Functions:**
- `audioToMidi(file, options)` - Main conversion function
  - Decodes audio file
  - Resamples to 22050 Hz (required by Basic Pitch)
  - Runs AI inference
  - **Splits notes into TWO tracks:**
    - **Track 0:** Right Hand (Treble) - notes >= middle C (MIDI 60)
    - **Track 1:** Left Hand (Bass) - notes < middle C (MIDI 60)
  - Uses @tonejs/midi for better structuring
  - Each track has separate MIDI channel

**Parameters:**
- `onsetThreshold` (default 0.35) - Lower = more notes detected
- `minimumNoteDuration` (default 3 frames) - Filter very short notes
- `velocitySensitivity` (default 0.7) - Dynamic range control

#### `/lib/midi-to-musicxml.ts`
**Purpose:** Convert MIDI data to MusicXML format

**Key Features:**
- **Uses MidiPlayerJS for enhanced MIDI event parsing**
  - Extracts comprehensive MIDI events and metadata
  - Better tempo and time signature detection
  - More accurate timing information
- Uses @tonejs/midi for MIDI data structuring
- Generates grand staff (treble + bass clefs)
- **Intelligent track handling:**
  - Detects if tracks are pre-split (by name: "treble/right" or "bass/left")
  - Uses existing track split when available
  - Falls back to pitch-based split at middle C (MIDI 60)
- Intelligent chord detection (threshold: 1/16th beat)
- Duration quantization to standard note values
- Proper rest handling with gap threshold

**Functions:**
- `midiToMusicXML(data)` - Main conversion
- `parseMidiWithPlayer(buffer)` - Parse MIDI using MidiPlayerJS for enhanced event data
- `generateStaffNotes()` - Per-staff note generation with quantization and beaming
- `midiToNoteParts()` - MIDI note to pitch/octave/accidental
- `quantizeDuration()` - Snap to nearest standard note value
- `midiDataToToneMidi()` - Convert to Tone.js format
- `detectChord(notes)` - Detect chord types from note intervals
- `isBeamable()` - Determine if note type should be beamed
- `getBeatPosition()` - Calculate beat position for beam grouping

#### `/lib/pdf-export.ts`
**Purpose:** Export MIDI data as PDF sheet music

**Process:**
1. Convert MIDI → MusicXML
2. Create hidden DOM container (210mm width for A4)
3. Initialize OSMD with configuration
4. Load and render MusicXML
5. Wait 500ms for complete rendering
6. Capture with html2canvas (scale: 2)
7. Generate PDF with jsPDF
8. Handle multi-page content automatically
9. Clean up DOM container

**Configuration:**
- Format: A4 portrait
- Margins: 10mm all sides
- Quality: 2x scale
- Auto page breaks for long pieces

#### `/lib/musicxml-export.ts` ⭐ NEW
**Purpose:** Export MIDI data as MusicXML file

**Key Functions:**
- `exportToMusicXML(midiData)` - Convert MIDI data to MusicXML string
- `downloadMusicXML(xmlContent, filename)` - Download MusicXML as .musicxml file

**Process:**
1. Convert MIDI data to MusicXML using `midiToMusicXML()`
2. Create Blob with MIME type `application/vnd.recordare.musicxml+xml`
3. Generate download link
4. Trigger browser download
5. Clean up resources

**File Format:**
- Extension: .musicxml
- Standard: MusicXML 3.1
- Compatibility: MuseScore, Finale, Sibelius, Dorico, and other notation software

### UI Components

#### `/components/midi-editor/AudioUploader.tsx`
- Drag-and-drop audio file upload
- File validation (WAV/MP3, max 50MB)
- Visual feedback

#### `/components/midi-editor/ConversionOptionsPanel.tsx`
- Parameter adjustment sliders
- Real-time value display
- Preset defaults (optimized for detection)

#### `/components/midi-editor/AudioProcessingModal.tsx`
- Progress bar (0-100%)
- Status updates during conversion
- Processing stages displayed

#### `/components/midi-editor/SheetMusicPreview.tsx` ⭐ NEW
**Purpose:** Real-time sheet music preview using OpenSheetMusicDisplay

**Key Features:**
- Live rendering of piano grand staff notation
- Automatic MusicXML conversion from MIDI data
- Professional sheet music display with:
  - Treble and bass clefs (grand staff)
  - Chord symbols above the staff
  - Tempo markings
  - Proper note values and rests
- Responsive SVG-based rendering
- Error handling with user-friendly messages
- Loading states with progress indicator

**Usage:**
```tsx
<SheetMusicPreview midiData={midiData} className="h-full" />
```

The component automatically re-renders when MIDI data changes, providing instant visual feedback as users edit notes in the piano roll.

### Page Integration

#### `/app/midi-editor/page.tsx`
Integrated workflow with dual-view mode:
1. Upload audio file
2. Adjust conversion parameters
3. Convert to MIDI (with progress modal)
4. **Toggle between two view modes:**
   - **Piano Roll View:** Edit notes graphically with timeline
   - **Sheet Music View:** Preview professional notation in real-time ⭐
5. Edit in piano roll (optional)
6. Export to PDF or MIDI

**View Mode Toggle:**
- Seamless switching between Piano Roll and Sheet Music views
- Piano Roll: Full editing capabilities with toolbar
- Sheet Music: Live preview of what the PDF will look like
- Playback controls available in both modes

## Audio Processing Details

### Basic Pitch Configuration
```typescript
{
  onsetThreshold: 0.35,      // More sensitive detection
  frameThreshold: 0.25,      // Lower frame threshold
  minimumNoteDuration: 3,    // Shorter minimum (frames)
  velocitySensitivity: 0.7   // Dynamic range
}
```

### Sample Rate Handling
- Basic Pitch requires 22050 Hz
- Automatic resampling using OfflineAudioContext
- Supports any input sample rate

### Note Detection
- Polyphonic (detects chords)
- **Two-track output:** Automatically splits into treble and bass
  - **Right Hand (Treble):** MIDI notes 60+ (middle C and above)
  - **Left Hand (Bass):** MIDI notes below 60
  - Each track editable independently in piano roll
  - Separate MIDI channels (0 and 1)
- Pitch bend support
- Amplitude-based velocity calculation
- Configurable sensitivity

## MidiPlayerJS Integration

### Benefits
The integration of **MidiPlayerJS** provides enhanced MIDI parsing capabilities:

1. **Better Event Extraction**: MidiPlayerJS parses MIDI files into detailed JSON events with precise timing
2. **Accurate Metadata**: Direct extraction of tempo changes and time signature from MIDI meta events
3. **Comprehensive Event Data**: Access to all MIDI events including control changes, program changes, and meta events
4. **Improved Timing**: Better tick-based timing information for precise note placement
5. **Standard Compliance**: Handles MIDI file format specifications correctly including "running status"

### Usage
```typescript
// Parse MIDI file using MidiPlayerJS
const midiData = parseMidiWithPlayer(arrayBuffer);
// Returns: { events, tempo, timeSignature, division }

// MidiPlayerJS extracts:
// - All MIDI events with timing
// - Tempo from Set Tempo meta events
// - Time signature from Time Signature meta events
// - Division (ticks per quarter note / PPQ)
```

### Event Types Supported
- **Note Events**: Note On, Note Off with velocity and timing
- **Meta Events**: Tempo changes, time signatures, key signatures
- **Control Events**: Program changes, control changes
- **Timing**: Precise tick-based timing for all events

## MusicXML Generation

### Grand Staff Structure
```xml
<score-partwise>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>480</divisions>  <!-- PPQN -->
        <staves>2</staves>          <!-- Two staves -->
        <clef number="1">           <!-- Treble clef -->
        <clef number="2">           <!-- Bass clef -->
      </attributes>
      <!-- Treble staff notes -->
      <!-- Backup to measure start -->
      <!-- Bass staff notes -->
    </measure>
  </part>
</score-partwise>
```

### Note Split Logic
- **Treble staff:** MIDI notes >= 60 (middle C and above)
- **Bass staff:** MIDI notes < 60 (below middle C)

### Quantization
Durations snap to nearest standard value:
- Whole note (4 beats)
- Dotted half (3 beats)
- Half note (2 beats)
- Dotted quarter (1.5 beats)
- Quarter note (1 beat)
- Dotted eighth (0.75 beats)
- Eighth note (0.5 beats)
- Sixteenth note (0.25 beats)
- Thirty-second note (0.125 beats)

### Chord Detection
- Notes within 1/16th beat are grouped as chords
- Sorted by pitch (low to high)
- Uses `<chord/>` element for simultaneous notes

### Note Beaming
- Consecutive notes shorter than quarter notes are beamed together
- Beat-based grouping (beams don't cross beat boundaries)
- Beam states: `begin`, `continue`, `end`
- Applies to eighth, sixteenth, 32nd, and 64th notes
- Only first note in a chord gets beam element
- Follows standard music notation engraving rules

### Rest Handling
- Automatic gap filling
- Threshold: 1/32nd beat (ignores tiny gaps)
- Quantized to standard rest values
- Full measure rests when no notes

## Sheet Music Rendering with OpenSheetMusicDisplay

### Overview
**OpenSheetMusicDisplay (OSMD)** is the gold standard for rendering MusicXML to web canvas. It provides professional-quality sheet music notation with SVG-based rendering.

### Two Rendering Contexts

#### 1. Live Preview (Sheet Music View)
**Component:** [SheetMusicPreview.tsx](components/midi-editor/SheetMusicPreview.tsx)

Real-time sheet music display in the MIDI editor with:
- Automatic re-rendering on MIDI data changes
- Full-page scrollable view
- Professional notation with grand staff
- Chord symbols and tempo markings

**Configuration:**
```typescript
new OpenSheetMusicDisplay(container, {
  autoResize: true,              // Responsive to container size
  backend: 'svg',                 // Vector graphics for crisp rendering
  drawTitle: true,
  drawMetronomeMarks: true,
  drawingParameters: 'default',  // Optimal spacing for preview
  followCursor: false,
  renderSingleHorizontalStaffline: false
})
```

#### 2. PDF Export (High-Quality Output)
**File:** [pdf-export.ts](lib/pdf-export.ts)

Optimized for print-quality PDF generation:
- Fixed container dimensions (793px = A4 width at 96 DPI)
- 3x scale capture via html2canvas
- Multi-page support with automatic page breaks

## PDF Rendering

### OSMD Configuration
```typescript
{
  autoResize: false,
  backend: 'svg',           // Vector graphics
  drawTitle: true,
  drawComposer: false,
  drawCredits: false,
  drawPartNames: true
}
```

### Canvas Capture
```typescript
{
  scale: 2,                 // 2x for high quality
  backgroundColor: '#ffffff',
  logging: false,
  useCORS: true
}
```

### PDF Layout
- **Format:** A4 (210mm × 297mm)
- **Margins:** 10mm all sides
- **Content width:** 190mm
- **Auto pagination:** Based on content height

## User Experience

### Conversion Flow
1. **Select tab** - "Audio File" in uploader
2. **Upload file** - Drag-and-drop or browse
3. **Adjust parameters** (optional)
   - Note detection sensitivity
   - Minimum note duration
   - Velocity sensitivity
4. **Convert** - Click "Convert to Notation"
5. **Processing** - Progress modal shows:
   - Decoding audio... (0-20%)
   - Loading AI model... (20-30%)
   - Analyzing audio... (30-70%)
   - Converting to notes... (70-90%)
   - Generating notation... (90-100%)
6. **View & Edit** - Two view modes available:
   - **Piano Roll View:** Edit notes graphically
   - **Sheet Music View:** Preview professional notation ⭐
7. **Edit** (optional) - Use piano roll tools to refine notes
8. **Preview** - Switch to Sheet Music view to see final result
9. **Export** - Click "Export" → "PDF"

### View Mode Features

**Piano Roll View:**
- Timeline-based note editor
- Full toolbar with editing tools (select, draw, erase)
- Track list sidebar
- Note quantization controls
- Zoom controls
- Undo/redo functionality

**Sheet Music View:** ⭐
- Real-time rendering of piano grand staff
- Professional notation with:
  - Treble clef (right hand) and bass clef (left hand)
  - Chord symbols above the staff
  - Tempo markings (♩ = 120 BPM)
  - Proper note values, rests, and accidentals
- Live updates as you edit in Piano Roll
- Scrollable full-page view
- Powered by OpenSheetMusicDisplay

**Both Views Include:**
- Playback controls (play, pause, stop, seek)
- Tempo adjustment
- Track information display

### Error Handling
- File validation (type, size)
- Browser compatibility checks
- Graceful degradation with fallback PDF
- Console logging for debugging
- User-friendly error messages

## Performance Considerations

### Audio Processing
- Large files (>10MB) show warning
- Max file size: 50MB
- Processing time: ~10-30 seconds per file
- Progress updates every 10%

### Memory Management
- Model cached after first load
- Audio buffer cleaned after processing
- Temporary DOM elements removed
- Canvas memory freed after capture

### Optimization Tips
- Use shorter audio clips for faster processing
- Lower onset threshold increases processing time
- PDF generation is near-instant after conversion

## Browser Compatibility

### Required Features
- ✅ Web Audio API
- ✅ WebAssembly (for Basic Pitch)
- ✅ Canvas API
- ✅ FileReader API
- ✅ Blob/URL APIs

### Tested Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Dependencies

```json
{
  "dependencies": {
    "@spotify/basic-pitch": "^1.0.1",
    "@tensorflow/tfjs": "^4.22.0",
    "@tonejs/midi": "^2.0.28",
    "midi-player-js": "^2.0.16",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.0.0",
    "musicxml-interfaces": "^0.0.21",
    "opensheetmusicdisplay": "^1.9.4"
  }
}
```

## Future Enhancements

### Potential Improvements
- [ ] Tempo detection from audio
- [ ] Multiple instrument support
- [ ] Key signature detection
- [ ] Rhythm quantization options
- [x] Note editing before export ✅
- [x] MusicXML direct export ✅
- [ ] Lyrics support
- [ ] Dynamics detection
- [ ] Articulation marks

### Advanced Features
- [ ] Cloud-based processing for large files
- [ ] Batch processing multiple files
- [ ] MIDI playback preview
- [ ] Export to other formats (MuseScore, Finale)
- [ ] Share/collaborate on transcriptions

## Troubleshooting

### Common Issues

**"Failed to convert audio"**
- Check file format (WAV/MP3 only)
- Ensure file size < 50MB
- Verify browser compatibility

**"No notes detected"**
- Audio may be too quiet or noisy
- Try lowering onset threshold
- Check if audio contains musical notes

**"PDF is blank"**
- Check browser console for errors
- Verify MusicXML generation
- Ensure OSMD loaded correctly

**"Processing takes too long"**
- Large files take longer
- Close other browser tabs
- Use a more powerful device

## Support

For issues or questions:
1. Check browser console for detailed errors
2. Verify all dependencies installed
3. Test with sample audio files
4. Review MusicXML output for validity

## Credits

- **Spotify Basic Pitch** - Open-source audio-to-MIDI transcription
- **OpenSheetMusicDisplay** - Sheet music rendering engine
- **Tone.js** - MIDI parsing and utilities
- **jsPDF** - PDF generation library
