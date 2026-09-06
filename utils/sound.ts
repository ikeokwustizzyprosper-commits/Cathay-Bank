// Web Audio API Sound Synthesizer for Banking Alerts
let audioCtx: AudioContext | null = null;

/**
 * Synthesizes a clean, high-clarity banking chime notification.
 * Uses Web Audio API oscillator nodes to avoid external asset dependency or CORS blocks.
 */
export const playNotificationChime = (type: 'info' | 'success' | 'security' = 'info') => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtx) {
            audioCtx = new AudioContextClass();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (type === 'security') {
            // Urgent security alert tone: F5 -> D6
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(698.46, now);
            osc1.frequency.setValueAtTime(1174.66, now + 0.1);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(698.46, now);
            osc2.frequency.setValueAtTime(1174.66, now + 0.1);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.38);
            osc2.stop(now + 0.38);
        } else {
            // Elegant two-tone banking chime (F5 698Hz -> C6 1046Hz)
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(698.46, now);
            osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(698.46, now);
            osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.5);
            osc2.stop(now + 0.5);
        }
    } catch (e) {
        console.warn("Audio notification chime could not play:", e);
    }
};
