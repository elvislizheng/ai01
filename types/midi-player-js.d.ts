declare module 'midi-player-js' {
  export interface MidiEvent {
    name: string;
    noteNumber?: number;
    noteName?: string;
    velocity?: number;
    tick?: number;
    track?: number;
    channel?: number;
    byteIndex?: number;
    delta?: number;
    data?: number[];
  }

  export class Player {
    constructor(callback?: (event: MidiEvent) => void);

    // Properties
    division: number;
    tempo: number;
    startTime: number;
    startTick: number;
    isPlaying(): boolean;

    // Methods
    loadFile(path: string): this;
    loadArrayBuffer(buffer: Uint8Array | ArrayBuffer | ArrayLike<number>): this;
    loadDataUri(dataUri: string): this;
    play(): this;
    pause(): this;
    stop(): this;
    skipToTick(tick: number): this;
    skipToSeconds(seconds: number): this;
    skipToPercent(percent: number): this;
    on(eventName: string, callback: (data?: any) => void): this;
    off(eventName: string, callback?: (data?: any) => void): this;
    getSongTime(): number;
    getSongTimeRemaining(): number;
    getSongPercentRemaining(): number;
    getTotalTicks(): number;
    getTotalEvents(): number;
    getEvents(): MidiEvent[];
    setTempo(tempo: number): void;
  }

  export default {
    Player
  };
}
