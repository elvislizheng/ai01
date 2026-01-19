# Music Note Learning App - Specification

## Overview

An interactive web-based learning tool to help students understand music notes through sight-reading exercises. The app emphasizes simplicity, musical accuracy, and engagement while avoiding the clutter common in existing piano learning apps.

**Target Audience:** Children and teens ages 4-17
**Distribution:** Free public resource
**Connectivity:** Fully offline after initial load

---

## Core Learning Philosophy

- **Structured learning** - Focus on exercises rather than free play
- **Gentle encouragement** - Soft, supportive feedback for wrong answers
- **Musical accuracy** - Standard notation, realistic sounds, proper music theory
- **Simplicity** - Clean, uncluttered interface

---

## Home Screen

On launch, students see a **difficulty selection screen**:

- **Beginner** - Middle octave notes only
- **Intermediate** - Expanded range (two octaves)
- **Advanced** - Full keyboard range

All exercise content is available from the start (no unlocking required).

---

## Keyboard Display

### Three-Octave Mode (Default)
- Displays **Low / Middle / High** octave sections
- **Context-dependent display** - Automatically shows the octave relevant to the current exercise
- Three octaves visible on mobile screens

### Full 88-Key Mode
- Separate toggle to switch to full piano keyboard view
- Allows exploration of the complete keyboard range

### Key Labels
- Note names (C, D, E, F, G, A, B) toggleable on/off via button
- Uses **letter notation only** (not solfege)

### Visual Design
- **Classic black and white** color scheme
- Traditional piano key appearance
- Clean, professional aesthetic suitable for ages 4-17

---

## Input Method

- **On-screen keyboard only** (no MIDI support)
- Click/tap to play notes
- Works on all devices: phones, tablets, and computers (responsive design)

---

## Sheet Music Display

### Notation Standards
- **Standard music notation** - Accurate music theory representation
- Middle C on ledger line below treble staff (proper positioning)
- **Treble clef first** - Bass clef introduced later in curriculum

### Note Progression
- **Single notes first** - Students master individual note identification
- **Chords later** - 2-3 note chords added as students advance
- **Sharps and flats introduced gradually** - White keys mastered first, then black keys added one at a time

---

## Exercise Types

### 1. Note Identification
- A note appears on the staff
- Student presses the corresponding key on the keyboard
- **Silent presentation** - Sight reading only, no audio preview of the target note

### 2. Key Finding
- Text prompt appears: "Find C" or "Find G"
- Student locates and presses the named key

### 3. Sequence Playing
- Series of notes displayed
- Student plays them in order

---

## Exercise Flow

### Before Exercise
- User selects exercise length: **5, 10, or 20 notes**

### During Exercise
- **Gentle timer** - Soft countdown but no penalty for being slow
- Notes wait for response
- **Gentle encouragement** on wrong answers - soft visual cue, "try again" message

### After Exercise
- **Score summary screen** displaying:
  - Number correct
  - Accuracy percentage
  - Any other relevant stats
- Return to exercise selection

---

## Audio

- **Realistic piano sound** - High-quality sampled piano tones (not synthesized beeps)
- Sound plays when student presses keys
- No audio preview of target notes (sight-reading focus)

---

## Visual Feedback

- **Animations on success** - Sparkles, bouncing notes, or celebratory effects when correct
- Correct key highlights
- Encouraging messaging

---

## Help System

- **Help button** available but not intrusive
- Optional access for confused users
- App should be intuitive enough that most users won't need it

---

## Device Compatibility

- **Responsive design** - Must work equally well on:
  - Phones (smallest screens)
  - Tablets
  - Desktop computers/laptops
- Touch and mouse/click support

---

## Technical Requirements

### Performance
- Fast, responsive keyboard interaction
- No perceptible lag between key press and sound
- Smooth animations that don't impact performance

### Offline Capability
- All functionality works without internet after initial page load
- Piano sounds bundled with app
- No server calls required during use

### Browser Support
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome for Android)

---

## What This App is NOT

- No user accounts or login
- No progress saving across sessions
- No free play mode (exercises only)
- No MIDI keyboard support
- No gamification with lives/points/penalties
- No complex menus or excessive features

---

## Success Criteria

The app succeeds if:
1. A 5-year-old can press keys and hear realistic piano sounds within 30 seconds
2. Students learn to read notes on the treble clef accurately
3. The notation and sounds are musically correct (teacher-approved)
4. The interface is clean and uncluttered
5. Works smoothly on any device without internet

---

## Future Considerations (Not in Initial Scope)

- Bass clef exercises
- Chord recognition
- Interval training
- Multiple instrument sounds
- App naming and branding
