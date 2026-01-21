"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { WebcamUser } from "../types/webcam.types";

interface StadiumWebcamDisplayProps {
  webcamUsers: any[];
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
}

// Zeigt nur einen kleinen Status-Hinweis zur Webcam-Anzahl
export default function StadiumWebcamDisplay({ webcamUsers }: StadiumWebcamDisplayProps) {
  if (!webcamUsers) return null;

  return (
    <Html position={[0, 18, -36]} center distanceFactor={10}>
      <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-xs border border-white/10 shadow-lg">
        Webcam-Teilnehmer: {webcamUsers.length}
      </div>
    </Html>
  );
}
