// 🎸 3D Rooms Feature - TypeScript Types

export interface Room {
  id: string;
  name: string;
  path: string;
  component: string;
  requiresAuth: boolean;
  requiresVIP?: boolean;
  icon?: string;
}

export interface RoomNavigationState {
  activeRoom: string;
  previousRoom: string | null;
  history: string[];
}

export interface FPSControlsConfig {
  moveSpeed: number;
  lookSpeed: number;
  enabled: boolean;
  lockPointer: boolean;
}

export interface Camera3DPosition {
  x: number;
  y: number;
  z: number;
}
