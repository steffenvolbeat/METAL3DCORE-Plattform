// Types for Live Webcam Integration Feature

// src/app/features/3d-rooms/types/webcam.types.ts

import React from "react";

export interface WebcamUser {
  id: string;
  name: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  position: { x: number; y: number; z: number };
  isActive: boolean;
}

export interface LiveConcertWebcamProps {
  isInStadium: boolean;
  onWebcamUsersUpdate: (users: WebcamUser[]) => void;
}

export interface StadiumWebcamDisplayProps {
  webcamUsers: WebcamUser[];
  scene: any | null; // THREE.Scene
  camera: any | null; // THREE.Camera
  renderer: any | null; // THREE.WebGLRenderer
}

export interface WebcamStreamConfig {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    frameRate: { ideal: number };
  };
  audio: boolean;
}

export const DEFAULT_WEBCAM_CONFIG: WebcamStreamConfig = {
  video: {
    width: { ideal: 320 },
    height: { ideal: 240 },
    frameRate: { ideal: 15 },
  },
  audio: false,
};
