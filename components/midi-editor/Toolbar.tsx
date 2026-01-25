"use client";

import { MousePointer2, Pencil, Eraser, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';

interface ToolbarProps {
  currentTool: 'select' | 'pencil' | 'eraser';
  quantization: number;
  zoom: { x: number; y: number };
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: 'select' | 'pencil' | 'eraser') => void;
  onQuantizationChange: (value: number) => void;
  onZoomChange: (zoom: { x: number; y: number }) => void;
  onUndo: () => void;
  onRedo: () => void;
}

const QUANTIZATION_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '1/2' },
  { value: 4, label: '1/4' },
  { value: 8, label: '1/8' },
  { value: 16, label: '1/16' },
];

export default function Toolbar({
  currentTool,
  quantization,
  zoom,
  canUndo,
  canRedo,
  onToolChange,
  onQuantizationChange,
  onZoomChange,
  onUndo,
  onRedo,
}: ToolbarProps) {
  const toolButtonClass = (tool: string) => `
    p-2 rounded-lg transition-colors
    ${currentTool === tool
      ? 'bg-indigo-600 text-white'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }
  `;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-lg">
      {/* Tool selection */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
        <button
          onClick={() => onToolChange('select')}
          className={toolButtonClass('select')}
          title="Select (V)"
        >
          <MousePointer2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolChange('pencil')}
          className={toolButtonClass('pencil')}
          title="Pencil (P)"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolChange('eraser')}
          className={toolButtonClass('eraser')}
          title="Eraser (E)"
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${
            canRedo
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      {/* Quantization */}
      <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
        <span className="text-sm text-gray-600">Grid:</span>
        <select
          value={quantization}
          onChange={(e) => onQuantizationChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {QUANTIZATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onZoomChange({ x: Math.max(0.5, zoom.x - 0.25), y: zoom.y })}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600 min-w-[40px] text-center">
          {Math.round(zoom.x * 100)}%
        </span>
        <button
          onClick={() => onZoomChange({ x: Math.min(3, zoom.x + 0.25), y: zoom.y })}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
