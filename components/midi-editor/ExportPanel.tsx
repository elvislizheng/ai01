"use client";

import { useState } from 'react';
import { Download, FileMusic, FileText, FileCode, X } from 'lucide-react';
import type { MidiData } from '@/lib/midi-types';
import { exportToMidi, downloadMidi } from '@/lib/midi-export';
import { exportToPdf } from '@/lib/pdf-export';
import { exportToMusicXML, downloadMusicXML } from '@/lib/musicxml-export';

interface ExportPanelProps {
  midiData: MidiData;
  onClose: () => void;
}

export default function ExportPanel({ midiData, onClose }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'midi' | 'pdf' | 'musicxml'>('midi');
  const [filename, setFilename] = useState(midiData.name);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (exportType === 'midi') {
        const data = exportToMidi(midiData);
        downloadMidi(data, filename);
      } else if (exportType === 'musicxml') {
        const xmlContent = exportToMusicXML(midiData);
        downloadMusicXML(xmlContent, filename);
      } else {
        await exportToPdf(midiData, {
          filename,
          title: midiData.name,
        });
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter filename"
            />
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportType('midi')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  ${exportType === 'midi'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <FileMusic className={`w-8 h-8 ${
                  exportType === 'midi' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  exportType === 'midi' ? 'text-indigo-600' : 'text-gray-700'
                }`}>
                  MIDI
                </span>
                <span className="text-xs text-gray-500">.mid file</span>
              </button>

              <button
                onClick={() => setExportType('musicxml')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  ${exportType === 'musicxml'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <FileCode className={`w-8 h-8 ${
                  exportType === 'musicxml' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  exportType === 'musicxml' ? 'text-indigo-600' : 'text-gray-700'
                }`}>
                  MusicXML
                </span>
                <span className="text-xs text-gray-500">.musicxml</span>
              </button>

              <button
                onClick={() => setExportType('pdf')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  ${exportType === 'pdf'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <FileText className={`w-8 h-8 ${
                  exportType === 'pdf' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  exportType === 'pdf' ? 'text-indigo-600' : 'text-gray-700'
                }`}>
                  PDF
                </span>
                <span className="text-xs text-gray-500">Sheet music</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className={`
              inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
              ${isExporting || !filename.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }
            `}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
