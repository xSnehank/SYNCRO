/**
 * Voice Assistance Service for Turn-by-Turn Navigation
 * Uses Web Speech API (window.speechSynthesis) - 100% Free, Zero API Keys, Zero Latency.
 */

export interface VoiceOptions {
  language?: 'en-IN' | 'ta-IN' | 'en-US';
  rate?: number; // 0.8 - 1.2
  pitch?: number;
  volume?: number;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export const isVoiceSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

/**
 * Whether a navigation announcement is currently being spoken.
 */
export const isSpeechActive = (): boolean => activeUtterance !== null;

/**
 * Clean up text for natural navigation speech pronunciation
 */
function sanitizeNavigationSpeech(text: string): string {
  return text
    .replace(/(\d+)\s*km/gi, '$1 kilometers')
    .replace(/(\d+)\s*m\b/gi, '$1 meters')
    .replace(/(\d+)\s*mins?/gi, '$1 minutes')
    .replace(/₹(\d+)/gi, '$1 Rupees')
    .replace(/OMR/gi, 'O M R')
    .replace(/ECR/gi, 'E C R')
    .replace(/MTC/gi, 'M T C')
    .replace(/CO2/gi, 'C O 2')
    .replace(/PM2\.5/gi, 'P M 2.5');
}

/**
 * Speak navigation maneuver / voice announcement
 */
export function speakManeuver(
  text: string,
  options: VoiceOptions = {},
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (!isVoiceSupported()) {
    console.warn('Web Speech API is not supported in this browser environment.');
    return false;
  }

  try {
    // Cancel previous utterance to avoid queuing delays
    window.speechSynthesis.cancel();

    const cleanText = sanitizeNavigationSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    const lang = options.language || 'en-IN';
    utterance.lang = lang;

    // Find best matching voice for Indian English or Tamil if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice = voices.find(
        (v) => v.lang.toLowerCase().includes(lang.toLowerCase().replace('_', '-')) || v.lang.startsWith(lang.split('-')[0])
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    if (onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Failed to synthesize speech:', err);
    return false;
  }
}

/**
 * Stop active navigation speech
 */
export function stopVoiceSpeech(): void {
  if (isVoiceSupported()) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch (err) {
      console.warn('Failed to stop speech synthesis:', err);
    }
  }
}

/**
 * Generate natural voice prompt for navigation maneuvers
 */
export function getManeuverSpeechPrompt(
  instruction: string,
  distanceKm: number,
  mode: string,
  isFirstStep = false,
  isLastStep = false
): string {
  if (isFirstStep) {
    return `Starting navigation. ${instruction}. Continue for ${
      distanceKm < 1 ? Math.round(distanceKm * 1000) + ' meters' : distanceKm + ' kilometers'
    }.`;
  }

  if (isLastStep) {
    return `In ${
      distanceKm < 1 ? Math.round(distanceKm * 1000) + ' meters' : distanceKm + ' kilometers'
    }, ${instruction}. You will arrive at your destination.`;
  }

  if (mode === 'CHENNAI_METRO') {
    return `Board the Chennai Metro. ${instruction}. Fast grade-separated transit for ${distanceKm} kilometers.`;
  }

  if (mode === 'MTC_BUS') {
    return `Board MTC Bus. ${instruction}. Journey is ${distanceKm} kilometers.`;
  }

  const distText = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} meters` : `${distanceKm} kilometers`;
  return `In ${distText}, ${instruction}.`;
}
