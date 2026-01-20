"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Home,
} from "lucide-react";

// Note definitions
const NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;

// Staff line positions for treble clef (from bottom line E4 to top)
const TREBLE_CLEF_POSITIONS: Record<string, number> = {
  C4: 10, // Middle C - ledger line below
  D4: 9,
  E4: 8, // Bottom line
  F4: 7,
  G4: 6, // Second line
  A4: 5,
  B4: 4,
  C5: 3, // Third line
  D5: 2,
  E5: 1, // Fourth line
  F5: 0,
  G5: -1, // Top line
  A5: -2,
  B5: -3,
  C6: -4, // Ledger line above
  D6: -5,
  E6: -6,
  F6: -7,
  G6: -8,
  A6: -9,
  B6: -10,
};

// Difficulty ranges
const DIFFICULTY_RANGES = {
  beginner: {
    minOctave: 4,
    maxOctave: 4,
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"],
  },
  intermediate: {
    minOctave: 4,
    maxOctave: 5,
    notes: [
      "C4",
      "D4",
      "E4",
      "F4",
      "G4",
      "A4",
      "B4",
      "C5",
      "D5",
      "E5",
      "F5",
      "G5",
    ],
  },
  advanced: {
    minOctave: 4,
    maxOctave: 6,
    notes: [
      "C4",
      "D4",
      "E4",
      "F4",
      "G4",
      "A4",
      "B4",
      "C5",
      "D5",
      "E5",
      "F5",
      "G5",
      "A5",
      "B5",
      "C6",
      "D6",
      "E6",
      "F6",
      "G6",
      "A6",
      "B6",
    ],
  },
};

type Difficulty = keyof typeof DIFFICULTY_RANGES;

// Piano key frequencies (A4 = 440Hz)
const getFrequency = (note: string, octave: number): number => {
  const noteIndex = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ].indexOf(note);
  const a4Index = 9; // A is at index 9
  const a4Octave = 4;
  const semitonesDiff = (octave - a4Octave) * 12 + (noteIndex - a4Index);
  return 440 * Math.pow(2, semitonesDiff / 12);
};

export default function ReadNotesPage() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "summary">(
    "menu",
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [exerciseLength, setExerciseLength] = useState(10);
  const [showLabels, setShowLabels] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [feedbackTones, setFeedbackTones] = useState(true);

  // Game state
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [exerciseNotes, setExerciseNotes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - gentle nudge, don't penalize
            return 15; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, gameState]);

  const playNote = useCallback(
    async (note: string, octave: number) => {
      if (!soundEnabled) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // iOS requires resuming the audio context after user interaction
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Create a more piano-like sound with multiple oscillators
      const freq = getFrequency(note, octave);
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      oscillator.type = "triangle";

      // Piano-like envelope
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1.5);
    },
    [soundEnabled],
  );

  const generateExercise = useCallback(() => {
    const range = DIFFICULTY_RANGES[difficulty];
    const notes: string[] = [];
    for (let i = 0; i < exerciseLength; i++) {
      const randomNote =
        range.notes[Math.floor(Math.random() * range.notes.length)];
      notes.push(randomNote);
    }
    return notes;
  }, [difficulty, exerciseLength]);

  const startGame = () => {
    const notes = generateExercise();
    setExerciseNotes(notes);
    setCurrentNoteIndex(0);
    setScore(0);
    setAttempts(0);
    setFeedback(null);
    setTimeRemaining(15);
    setTimerActive(true);
    setGameState("playing");
  };

  const handleKeyPress = (keyNote: string) => {
    if (gameState !== "playing") return;

    const currentNote = exerciseNotes[currentNoteIndex];

    // Play the pressed key sound
    playNote(keyNote.replace(/\d/, ""), parseInt(keyNote.slice(-1)));

    setAttempts((prev) => prev + 1);

    if (keyNote === currentNote) {
      // Correct!
      setScore((prev) => prev + 1);
      setFeedback("correct");
      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
        setFeedback(null);

        if (currentNoteIndex + 1 >= exerciseLength) {
          // Exercise complete
          setTimerActive(false);
          setGameState("summary");
        } else {
          setCurrentNoteIndex((prev) => prev + 1);
          setTimeRemaining(15);
        }
      }, 800);
    } else {
      // Incorrect - gentle encouragement
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const getCurrentOctaveRange = (): number[] => {
    if (gameState !== "playing" || exerciseNotes.length === 0) {
      return [4]; // Default to middle octave
    }

    // Show context-dependent octave(s)
    if (difficulty === "beginner") {
      return [4];
    } else if (difficulty === "intermediate") {
      return [4, 5];
    } else {
      return [4, 5, 6];
    }
  };

  const renderStaff = () => {
    if (exerciseNotes.length === 0) return null;

    const currentNote = exerciseNotes[currentNoteIndex];
    const position = TREBLE_CLEF_POSITIONS[currentNote] ?? 5;

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="relative h-40 flex items-center justify-center">
          {/* Staff lines */}
          <svg viewBox="0 0 300 100" className="w-full max-w-md h-32">
            {/* Treble clef symbol */}
            <text x="20" y="60" fontSize="48" fontFamily="serif" fill="#374151">
              𝄞
            </text>

            {/* Five staff lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="60"
                y1={30 + i * 10}
                x2="280"
                y2={30 + i * 10}
                stroke="#374151"
                strokeWidth="3"
              />
            ))}

            {/* Ledger lines if needed */}
            {position >= 10 && (
              <line
                x1="140"
                y1={30 + 5 * 10}
                x2="180"
                y2={30 + 5 * 10}
                stroke="#374151"
                strokeWidth="3"
              />
            )}
            {position <= -4 && position > -6 && (
              <line
                x1="140"
                y1={30 - 1 * 10}
                x2="180"
                y2={30 - 1 * 10}
                stroke="#374151"
                strokeWidth="3"
              />
            )}
            {position <= -6 && position > -8 && (
              <line
                x1="140"
                y1={30 - 2 * 10}
                x2="180"
                y2={30 - 2 * 10}
                stroke="#374151"
                strokeWidth="3"
              />
            )}
            {position <= -8 && position > -10 && (
              <line
                x1="140"
                y1={30 - 3 * 10}
                x2="180"
                y2={30 - 3 * 10}
                stroke="#374151"
                strokeWidth="3"
              />
            )}
            {position <= -10 && (
              <line
                x1="140"
                y1={30 - 4 * 10}
                x2="180"
                y2={30 - 4 * 10}
                stroke="#374151"
                strokeWidth="3"
              />
            )}

            {/* Note */}
            <ellipse
              cx="160"
              cy={30 + position * 5}
              rx="8"
              ry="6"
              fill="#1e40af"
              className={`transition-all duration-200 ${feedback === "correct" ? "fill-green-500" : feedback === "incorrect" ? "fill-red-400" : ""}`}
            />
            {/* Note stem */}
            <line
              x1="168"
              y1={30 + position * 5}
              x2="168"
              y2={30 + position * 5 - 30}
              stroke="#1e40af"
              strokeWidth="2"
              className={`transition-all duration-200 ${feedback === "correct" ? "stroke-green-500" : feedback === "incorrect" ? "stroke-red-400" : ""}`}
            />
          </svg>

          {/* Celebration animation */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-6xl animate-bounce">✨</div>
            </div>
          )}
        </div>

        {/* Feedback message */}
        <div
          className={`text-center mt-2 font-medium min-h-6 ${feedback === "correct" ? "text-green-600" : feedback === "incorrect" ? "text-orange-500" : "text-transparent"}`}
        >
          {feedback === "correct"
            ? "Correct! Well done!"
            : feedback === "incorrect"
              ? "Try again - you can do it!"
              : "\u00A0"}
        </div>
      </div>
    );
  };

  const renderPianoKey = (
    note: string,
    octave: number,
    isBlack: boolean = false,
  ) => {
    const keyId = `${note}${octave}`;
    const isCurrentTarget =
      gameState === "playing" && exerciseNotes[currentNoteIndex] === keyId;

    if (isBlack) {
      return (
        <button
          key={keyId}
          onClick={() => handleKeyPress(keyId)}
          className={`
            absolute w-8 h-24 bg-gray-900 hover:bg-gray-700
            rounded-b-md shadow-lg z-10 transform -translate-x-1/2
            transition-all duration-100 active:scale-95
            ${feedback === "correct" && isCurrentTarget ? "bg-green-600" : ""}
          `}
          style={{ top: 0 }}
        >
          {showLabels && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white font-medium">
              {note}
            </span>
          )}
        </button>
      );
    }

    return (
      <button
        key={keyId}
        onClick={() => handleKeyPress(keyId)}
        className={`
          relative w-12 h-36 bg-white hover:bg-gray-100
          border border-gray-300 rounded-b-md shadow-md
          transition-all duration-100 active:scale-95 active:bg-gray-200
          ${feedback === "correct" && isCurrentTarget ? "bg-green-200 border-green-400" : ""}
        `}
      >
        {showLabels && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-gray-900 font-semibold">
            {note}
          </span>
        )}
      </button>
    );
  };

  const renderPiano = () => {
    const octaves = getCurrentOctaveRange();

    return (
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 shadow-xl overflow-x-auto">
        <div className="flex justify-center">
          {octaves.map((octave) => (
            <div key={octave} className="relative flex">
              {NOTES.map((note) => (
                <div key={`${note}${octave}`} className="relative">
                  {renderPianoKey(note, octave)}
                  {["C", "D", "F", "G", "A"].includes(note) && (
                    <div
                      className="absolute"
                      style={{ left: "calc(100% - 16px)", top: 0 }}
                    >
                      {renderPianoKey(`${note}#`, octave, true)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Read Music Notes
          </h1>
          <p className="text-gray-600">Learn to identify notes on the staff</p>
        </div>

        {/* Difficulty Selection */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Difficulty
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {(["beginner", "intermediate", "advanced"] as const).map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    difficulty === level
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-indigo-300 text-gray-900"
                  }
                `}
                >
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {level === "beginner" && "Middle octave"}
                    {level === "intermediate" && "Two octaves"}
                    {level === "advanced" && "Full range"}
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Exercise Length */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Number of Notes
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[5, 10, 20].map((length) => (
              <button
                key={length}
                onClick={() => setExerciseLength(length)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    exerciseLength === length
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-indigo-300 text-gray-900"
                  }
                `}
              >
                <div className="text-2xl font-bold">{length}</div>
                <div className="text-sm text-gray-500">notes</div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                ${showLabels ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-900"}
              `}
            >
              {showLabels ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
              <span>Note Labels</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                ${soundEnabled ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-900"}
              `}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              <span>Sound</span>
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-indigo-300 text-gray-900 transition-all"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6" />
          Start Exercise
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Play
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">1.</span>
                <span>A note will appear on the music staff</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <span>Find and click the matching key on the piano</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">3.</span>
                <span>
                  Take your time - there&apos;s no penalty for being slow
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">4.</span>
                <span>Toggle note labels on/off as you improve</span>
              </li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlaying = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setTimerActive(false);
              setGameState("menu");
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit
          </button>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="text-lg font-medium text-gray-700">
              {currentNoteIndex + 1} / {exerciseLength}
            </div>

            {/* Timer */}
            <div
              className={`text-lg font-medium ${timeRemaining <= 5 ? "text-orange-500" : "text-gray-600"}`}
            >
              {timeRemaining}s
            </div>

            {/* Settings toggles */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded-lg transition-all ${showLabels ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"}`}
            >
              {showLabels ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-all ${soundEnabled ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"}`}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(currentNoteIndex / exerciseLength) * 100}%` }}
          />
        </div>

        {/* Staff */}
        {renderStaff()}

        {/* Piano */}
        {renderPiano()}

        {/* Score */}
        <div className="mt-6 text-center">
          <span className="text-lg text-gray-600">
            Score: <span className="font-bold text-indigo-600">{score}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">
              {accuracy >= 90 ? "🌟" : accuracy >= 70 ? "👏" : "💪"}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {accuracy >= 90
                ? "Excellent!"
                : accuracy >= 70
                  ? "Great Job!"
                  : "Good Effort!"}
            </h2>
            <p className="text-gray-600 mb-6">You completed the exercise!</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-indigo-600">
                  {score}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startGame}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {gameState === "menu" && renderMenu()}
      {gameState === "playing" && renderPlaying()}
      {gameState === "summary" && renderSummary()}
    </>
  );
}
