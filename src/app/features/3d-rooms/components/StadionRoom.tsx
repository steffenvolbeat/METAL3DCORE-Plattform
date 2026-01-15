"use client";
import React, { JSX } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Cylinder,
  Plane,
  Environment,
  Sphere,
  MeshReflectorMaterial,
  ContactShadows,
  RoundedBox,
  Cone,
  Sparkles,
  Stars,
  Float,
  Html,
} from "@react-three/drei";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group, Color } from "three";
import * as THREE from "three";
import { div } from "three/tsl";
//import {FPSControls} from "@/shared/component/3d";
//import StageLight from "@/shared/component/3d/StageLight";
//import{LiveWebcamIntegration} from "./LiveWebcamIntegration";
//import { LiveStadiumWebcamIntegration } from "./LiveStadiumWebcamIntegration";
//import { RoomAccessControl } from "./RoomAccessControl";

interface StadionRoomProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

// HallenStadion Zürich 3D Room Component
export default function StadionRoom({ onRoomChange, isFullscreen = false, onExitFullscreen }: StadionRoomProps) {
  return (
    <div className="min-h-[320px] flex items-center justify-center rounded-3xl border border-theme-secondary bg-black/40 p-10 text-center">
      <div className="space-y-3">
        <div className="text-4xl">🏟️</div>
        <h2 className="text-2xl font-semibold text-theme-primary">Stadion Arena </h2>
        <p className="text-theme-secondary">Wird Schritweise implementiert.</p>
      </div>
    </div>
  );
}
