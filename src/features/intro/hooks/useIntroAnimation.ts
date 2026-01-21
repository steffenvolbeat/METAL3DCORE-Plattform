// 🎸 useIntroAnimation Hook
// Custom Hook für Intro Animation Control

import { useState, useCallback } from "react";

interface UseIntroAnimationReturn {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
}

export function useIntroAnimation(
  onComplete?: () => void
): UseIntroAnimationReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    // Reset animation state
  }, []);

  const skip = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [onComplete]);

  return {
    isPlaying,
    play,
    pause,
    reset,
    skip,
  };
}
