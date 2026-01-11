/**
 * Text-to-speech utility for AI interviewer voice functionality
 * Uses browser's SpeechSynthesis API for voice output
 */

export const textToSpeech = (text: string, onComplete?: () => void): void => {
  // Check if SpeechSynthesis is supported
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser');
    onComplete?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create new speech utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Configure voice settings
  utterance.rate = 1.0; // Normal speed
  utterance.pitch = 1.0; // Normal pitch
  utterance.volume = 1.0; // Full volume

  // Set up event handlers
  utterance.onstart = () => {
    console.log('Speech started');
  };

  utterance.onend = () => {
    console.log('Speech ended');
    onComplete?.();
  };

  utterance.onerror = (event) => {
    console.error('Speech error:', event.error);
    onComplete?.();
  };

  // Speak the text
  window.speechSynthesis.speak(utterance);
};

// Helper function to check if speech synthesis is available
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// Helper function to get available voices
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) return [];

  // Return empty array if voices not loaded yet
  if (!window.speechSynthesis.getVoices().length) {
    // Try to load voices
    window.speechSynthesis.onvoiceschanged = () => {
      return window.speechSynthesis.getVoices();
    };
    return [];
  }

  return window.speechSynthesis.getVoices();
};