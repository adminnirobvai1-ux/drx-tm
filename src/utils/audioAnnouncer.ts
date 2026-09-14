/**
 * Cyber Audio Engine for Wingo 30S AI Models
 * Uses Web Audio API for subtle, high-tech chimes only.
 * Voice announcements disabled per user request.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a subtle futuristic cyberpunk UI beep
 */
export function playTechBeep(frequency = 880, type: OscillatorType = 'sine', duration = 0.06) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.3, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if audio is blocked
  }
}

/**
 * Play a subtle victorious VIP chime
 */
export function playVipWinChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.06, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.22);
    });
  } catch {
    // Ignore error
  }
}

/**
 * Voice Announcer using Web Speech API
 * Automatically announces model name, prediction (BIG/SMALL), and target number.
 */
export function speakModelPrediction(modelName?: string, prediction?: string, num?: number | string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Cancel any lingering speech

    const cleanName = (modelName || 'AI Model').replace(/_/g, ' ').trim();
    const predText = (prediction || 'SIGNAL').toUpperCase();
    const targetText = typeof num !== 'undefined' && num !== null ? `, Target number ${num}` : '';
    const textToSpeak = `${cleanName}: Prediction ${predText}${targetText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferred = voices.find(
        (v) =>
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))) ||
          v.lang === 'en-US' ||
          v.lang === 'en-GB'
      );
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback if speech synthesis is not permitted
  }
}

/**
 * Voice Announcer for round winning/losing result
 */
export function speakRoundResult(result: 'WIN' | 'LOSS', prediction?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const textToSpeak = result === 'WIN' ? `Win! ${prediction || ''}` : `Loss. Next round prepare.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback
  }
}

