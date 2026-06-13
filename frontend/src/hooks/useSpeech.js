import { useState, useRef } from 'react';
import { API_BASE } from '../utils/api';

export function useSpeech() {
  const [isPlayingSlide, setIsPlayingSlide] = useState(false);
  const slideAudioRef = useRef(null);

  const stopSlideSpeech = () => {
    if (slideAudioRef.current) {
      try {
        slideAudioRef.current.pause();
        slideAudioRef.current.src = "";
      } catch (err) {
        console.error("Failed to stop slide audio:", err);
      }
      slideAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSlideSpeech = (text) => {
    stopSlideSpeech();
    setIsPlayingSlide(true);

    // Attempt to use Xunfei TTS from backend
    const audioUrl = `${API_BASE}/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(audioUrl);
    slideAudioRef.current = audio;

    audio.onended = () => {
      setIsPlayingSlide(false);
      slideAudioRef.current = null;
    };

    audio.onerror = (e) => {
      console.warn("Xunfei TTS backend failed, falling back to browser speechSynthesis:", e);
      fallbackSpeechSynthesis(text);
    };

    audio.play().catch(err => {
      console.warn("Xunfei TTS playback failed, falling back to browser speechSynthesis:", err);
      fallbackSpeechSynthesis(text);
    });
  };

  const fallbackSpeechSynthesis = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setIsPlayingSlide(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingSlide(false);
    }
  };

  return {
    isPlayingSlide,
    setIsPlayingSlide,
    slideAudioRef,
    stopSlideSpeech,
    handleSlideSpeech
  };
}
