// 🎸 useRoomNavigation Hook
// Custom Hook für 3D Room Navigation

import { useState, useCallback } from "react";
import type { RoomNavigationState } from "../types/room.types";

interface UseRoomNavigationReturn extends RoomNavigationState {
  navigateToRoom: (roomId: string) => void;
  goBack: () => void;
  canGoBack: boolean;
}

export function useRoomNavigation(initialRoom: string = "welcome"): UseRoomNavigationReturn {
  const [state, setState] = useState<RoomNavigationState>({
    activeRoom: initialRoom,
    previousRoom: null,
    history: [initialRoom],
  });

  const navigateToRoom = useCallback((roomId: string) => {
    setState(prev => ({
      activeRoom: roomId,
      previousRoom: prev.activeRoom,
      history: [...prev.history, roomId],
    }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.history.length <= 1) return prev;

      const newHistory = [...prev.history];
      newHistory.pop(); // Remove current
      const previousRoom = newHistory[newHistory.length - 1];

      return {
        activeRoom: previousRoom,
        previousRoom: prev.activeRoom,
        history: newHistory,
      };
    });
  }, []);

  return {
    ...state,
    navigateToRoom,
    goBack,
    canGoBack: state.history.length > 1,
  };
}
