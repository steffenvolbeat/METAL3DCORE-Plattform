// 🎸 useFPSControls Hook
// Custom Hook für FPS Controls in 3D Räumen

import { useState, useCallback } from "react";
import type { FPSControlsConfig } from "../types/room.types";

interface UseFPSControlsReturn {
  config: FPSControlsConfig;
  updateConfig: (partial: Partial<FPSControlsConfig>) => void;
  toggleEnabled: () => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: FPSControlsConfig = {
  moveSpeed: 5,
  lookSpeed: 0.002,
  enabled: true,
  lockPointer: false,
};

export function useFPSControls(
  initialConfig?: Partial<FPSControlsConfig>
): UseFPSControlsReturn {
  const [config, setConfig] = useState<FPSControlsConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const updateConfig = useCallback((partial: Partial<FPSControlsConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG, ...initialConfig });
  }, [initialConfig]);

  return {
    config,
    updateConfig,
    toggleEnabled,
    resetConfig,
  };
}
