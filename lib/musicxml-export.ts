import type { MidiData } from './midi-types';
import { midiToMusicXML } from './midi-to-musicxml';

/**
 * Export MIDI data as MusicXML file
 */
export function exportToMusicXML(midiData: MidiData): string {
  return midiToMusicXML(midiData);
}

/**
 * Download MusicXML as .musicxml file
 */
export function downloadMusicXML(xmlContent: string, filename: string): void {
  // Ensure filename has .musicxml extension
  const cleanFilename = filename.replace(/\.(mid|midi|pdf|musicxml)$/i, '');
  const finalFilename = `${cleanFilename}.musicxml`;

  // Create blob from XML string
  const blob = new Blob([xmlContent], { type: 'application/vnd.recordare.musicxml+xml' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
