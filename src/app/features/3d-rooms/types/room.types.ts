// 🎸 3D Rooms Feature - TypeScript Types
// src/app/features/3d-rooms/types/room.types.ts


export interface Room {
  id: string;
  name: string;
  path: string;
  component: string;
  requiresAuth: boolean;
  requiresVIP: boolean;
  icon?: string;
}

export interface RoomNavigationState {
  activeRoom: string;
  previosusRoom: string | null;
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
