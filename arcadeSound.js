class ArcadeSoundEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.tracks = [];
        this.currentTrack = null;
        this.masterGain = null;
        this.gameSpeed = 1.0;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
        }
    }

    // Create a simple retro arcade melody
    createMainTheme() {
        const melody = [
            {note: 'C4', duration: 0.2},
            {note: 'E4', duration: 0.2},
            {note: 'G4', duration: 0.2},
            {note: 'C5', duration: 0.4},
            {note: 'G4', duration: 0.2},
            {note: 'E4', duration: 0.2},
            {note: 'C4', duration: 0.2},
            {note: 'D4', duration: 0.3},
            {note: 'F4', duration: 0.3},
            {note: 'A4', duration: 0.3},
            {note: 'D5', duration: 0.4},
            {note: 'A4', duration: 0.2},
            {note: 'F4', duration: 0.2},
            {note: 'D4', duration: 0.2}
        ];

        return this.playMelody(melody, 120, true);
    }

    // Create action music for gameplay
    createActionMusic() {
        const bassLine = [
            {note: 'C2', duration: 0.25},
            {note: 'G1', duration: 0.25},
            {note: 'C2', duration: 0.25},
            {note: 'F1', duration: 0.25}
        ];

        const melody = [
            {note: 'E4', duration: 0.15},
            {note: 'G4', duration: 0.15},
            {note: 'C5', duration: 0.3},
            {note: 'D4', duration: 0.15},
            {note: 'F4', duration: 0.15},
            {note: 'A4', duration: 0.3}
        ];

        return this.playActionTheme(bassLine, melody, 140, true);
    }

    playMelody(notes, tempo, loop = false) {
        this.init();
        if (this.currentTrack) {
            this.stopCurrentTrack();
        }

        const track = {
            oscillators: [],
            gains: [],
            isPlaying: true,
            loop: loop,
            notes: notes,
            tempo: tempo,
            currentIndex: 0
        };

        const playNote = (noteData) => {
            if (!track.isPlaying) return;

            const freq = this.getFrequency(noteData.note);
            
            // Main oscillator
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            // ADSR envelope
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + noteData.duration * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + noteData.duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + noteData.duration);
            
            track.oscillators.push(osc);
            track.gains.push(gain);
        };

        const playSequence = () => {
            if (!track.isPlaying) return;
            
            if (track.currentIndex >= track.notes.length) {
                if (track.loop) {
                    track.currentIndex = 0;
                } else {
                    this.stopCurrentTrack();
                    return;
                }
            }

            const noteData = track.notes[track.currentIndex];
            playNote(noteData);
            
            track.currentIndex++;
            const nextNoteTime = 60 / tempo;
            setTimeout(playSequence, nextNoteTime * 1000 / this.gameSpeed);
        };

        this.currentTrack = track;
        playSequence();

        return track;
    }

    playActionTheme(bassLine, melody, tempo, loop = false) {
        this.init();
        if (this.currentTrack) {
            this.stopCurrentTrack();
        }

        const track = {
            oscillators: [],
            gains: [],
            isPlaying: true,
            loop: loop,
            bassLine: bassLine,
            melody: melody,
            tempo: tempo,
            bassIndex: 0,
            melodyIndex: 0
        };

        const playNote = (noteData, type = 'square', octave = 0) => {
            if (!track.isPlaying) return;

            const freq = this.getFrequency(noteData.note) * Math.pow(2, octave);
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = type;
            osc.frequency.value = freq;
            
            const volume = type === 'square' ? 0.2 : 0.1;
            const duration = noteData.duration;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + duration);
            
            track.oscillators.push(osc);
            track.gains.push(gain);
        };

        const playSequence = () => {
            if (!track.isPlaying) return;
            
            // Play bass note
            if (track.bassIndex < track.bassLine.length) {
                playNote(track.bassLine[track.bassIndex], 'square', -1);
                track.bassIndex++;
            } else {
                track.bassIndex = 0;
            }
            
            // Play melody note (every other beat)
            if (track.melodyIndex < track.melody.length) {
                playNote(track.melody[track.melodyIndex], 'square', 0);
                track.melodyIndex++;
            } else {
                track.melodyIndex = 0;
            }
            
            const beatTime = 60 / tempo;
            setTimeout(playSequence, beatTime * 500 / this.gameSpeed);
        };

        this.currentTrack = track;
        playSequence();

        return track;
    }

    getFrequency(note) {
        const frequencies = {
            'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25,
            'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50,
            'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00,
            'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
            'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99,
            'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00
        };
        return frequencies[note] || 440;
    }

    // Sound effects
    playJumpSound() {
        this.init();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playCollectSound() {
        this.init();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.50, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playHurtSound() {
        this.init();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playLevelCompleteSound() {
        this.init();
        
        const notes = [
            {note: 'C4', duration: 0.2},
            {note: 'E4', duration: 0.2},
            {note: 'G4', duration: 0.2},
            {note: 'C5', duration: 0.4}
        ];
        
        let startTime = this.audioContext.currentTime;
        notes.forEach((noteData, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = this.getFrequency(noteData.note);
            
            const noteStartTime = startTime + (index * 0.1);
            gain.gain.setValueAtTime(0, noteStartTime);
            gain.gain.linearRampToValueAtTime(0.2, noteStartTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, noteStartTime + noteData.duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(noteStartTime);
            osc.stop(noteStartTime + noteData.duration);
        });
    }

    setGameSpeed(speed) {
        this.gameSpeed = Math.max(0.5, Math.min(speed, 2.0));
    }

    stopCurrentTrack() {
        if (this.currentTrack) {
            this.currentTrack.isPlaying = false;
            this.currentTrack = null;
        }
    }

    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(volume, 1));
        }
    }

    toggleMute() {
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterGain.gain.value > 0 ? 0 : 0.3;
        }
    }
}

// Create global sound engine
const arcadeSound = new ArcadeSoundEngine();