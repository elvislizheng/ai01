"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, Music, FileMusic } from 'lucide-react';
import { parseMidiFile, createEmptyMidiData } from '@/lib/midi-parser';
import { parseMusicXMLFile } from '@/lib/musicxml-parser';
import type { MidiData } from '@/lib/midi-types';
import AudioUploader from './AudioUploader';

interface MidiUploaderProps {
  onLoad: (data: MidiData) => void;
  onAudioFileSelected?: (file: File) => void;
}

export default function MidiUploader({ onLoad, onAudioFileSelected }: MidiUploaderProps) {
  const [activeTab, setActiveTab] = useState<'midi' | 'audio'>('midi');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const isMidi = file.name.match(/\.(mid|midi)$/i);
    const isMusicXML = file.name.match(/\.(musicxml|xml)$/i);

    if (!isMidi && !isMusicXML) {
      setError('Please upload a valid MIDI (.mid, .midi) or MusicXML (.musicxml, .xml) file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let data: MidiData;
      if (isMusicXML) {
        data = await parseMusicXMLFile(file);
      } else {
        data = await parseMidiFile(file);
      }
      onLoad(data);
    } catch (err) {
      console.error('Failed to parse file:', err);
      setError(`Failed to parse ${isMusicXML ? 'MusicXML' : 'MIDI'} file. Please try a different file.`);
    } finally {
      setIsLoading(false);
    }
  }, [onLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleCreateNew = useCallback(() => {
    onLoad(createEmptyMidiData('New Composition'));
  }, [onLoad]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border-2 border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => setActiveTab('midi')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'midi'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            MIDI File
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Audio File
          </button>
        </div>
      </div>

      {/* Conditional content based on active tab */}
      {activeTab === 'midi' ? (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <Music className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">MIDI Editor</h2>
            <p className="text-gray-600">Upload a MIDI or MusicXML file to edit or create a new composition</p>
          </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi,.musicxml,.xml"
          onChange={handleInputChange}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />

        {isLoading ? (
          <p className="text-gray-600">Loading file...</p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your MIDI or MusicXML file here
            </p>
            <p className="text-sm text-gray-500">
              or click to browse
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-gray-500 mb-4">or</p>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-indigo-300 hover:bg-gray-50 transition-colors"
        >
          <FileMusic className="w-5 h-5" />
          Create New Composition
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Supported formats: .mid, .midi, .musicxml, .xml</p>
      </div>
        </>
      ) : (
        <AudioUploader onFileSelected={onAudioFileSelected || (() => {})} />
      )}
    </div>
  );
}
