# MIDI Editor

A client-side MIDI editor for uploading, editing, and exporting MIDI files.

## Features

### 1. Upload MIDI File
- Drag-and-drop interface for uploading .mid/.midi files
- Click to browse file system
- Create new empty composition
- Client-side parsing using @tonejs/midi

### 2. Edit MIDI
- **Piano Roll Editor**: Visual grid-based note editing
- **Tools**: Select, Pencil (add notes), Eraser (delete notes)
- **Playback**: Play/Pause/Stop with tempo control
- **Track Management**: Mute/Solo individual tracks
- **Quantization**: Snap notes to grid (1, 1/2, 1/4, 1/8, 1/16)
- **Zoom**: Horizontal zoom for detailed editing
- **Undo/Redo**: Full history support

### 3. Export
- **MIDI Export**: Download as .mid file
- **PDF Export**: Generate sheet music PDF

## Usage

1. Navigate to `/midi-editor`
2. Upload a MIDI file or create a new composition
3. Use the piano roll to edit notes:
   - Select tool: Click notes to select, Shift+click for multi-select
   - Pencil tool: Click to add notes
   - Eraser tool: Click notes to delete
4. Use playback controls to preview
5. Click Export to download as MIDI or PDF

## Technical Details

### Dependencies
- `@tonejs/midi` - MIDI file parsing and export
- `jspdf` - PDF generation
- `vexflow` - Music notation (optional for advanced sheet music)

### File Structure
```
lib/
  midi-types.ts      # TypeScript interfaces
  midi-parser.ts     # MIDI file parsing
  midi-export.ts     # MIDI export
  pdf-export.ts      # PDF sheet music export

contexts/
  MidiEditorContext.tsx  # State management

hooks/
  useMidiPlayback.ts     # Web Audio playback

components/midi-editor/
  MidiUploader.tsx       # File upload UI
  PianoRoll.tsx          # Note editor
  PlaybackControls.tsx   # Transport controls
  Toolbar.tsx            # Edit tools
  TrackList.tsx          # Track management
  ExportPanel.tsx        # Export dialog

app/midi-editor/
  page.tsx               # Main page
```

### Keyboard Shortcuts
- `Delete` / `Backspace`: Delete selected notes
- `V`: Select tool
- `P`: Pencil tool
- `E`: Eraser tool
- `Cmd+Z`: Undo
- `Cmd+Shift+Z`: Redo
