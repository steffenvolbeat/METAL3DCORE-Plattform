"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AudioSystemProps {
  isPlaying: boolean;
  onBeatDetected: (
    beat: boolean,
    intensity: number,
    frequencies: number[]
  ) => void;
  onAudioReady: () => void;
}

export default function AudioSystem({
  isPlaying,
  onBeatDetected,
  onAudioReady,
}: AudioSystemProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);

  // Beat detection variables
  const beatThreshold = 0.15;
  const lastBeatTime = useRef(0);
  const beatCooldown = 300; // ms

  const createSynthesizedTrack = useCallback(async () => {
    if (!audioContextRef.current) return;

    // Create a buffer with synthesized metal-like sounds
    const context = audioContextRef.current;
    const bufferLength = context.sampleRate * 30; // 30 seconds
    const buffer = context.createBuffer(2, bufferLength, context.sampleRate);

    // Generate metal-like waveform with distortion and rhythm
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);

      for (let i = 0; i < bufferLength; i++) {
        const time = i / context.sampleRate;

        // Base frequency (low metal riff)
        const baseFreq = 80 + Math.sin(time * 0.5) * 20;
        const bass = Math.sin(2 * Math.PI * baseFreq * time) * 0.6;

        // Distorted guitar-like harmonics
        const guitar1 = Math.sin(2 * Math.PI * (baseFreq * 2) * time) * 0.3;
        const guitar2 = Math.sin(2 * Math.PI * (baseFreq * 3) * time) * 0.2;

        // Drum-like beats (kick pattern)
        const beatTime = time % 2.4; // 2.4 second pattern
        const kick =
          beatTime < 0.1 ? Math.sin(2 * Math.PI * 60 * time) * 0.8 : 0;
        const snare =
          beatTime > 1.2 && beatTime < 1.3 ? Math.random() * 0.4 : 0;

        // Hi-hat simulation
        const hihat = Math.random() * 0.1 * (Math.sin(time * 8) > 0.7 ? 1 : 0);

        // Combine all elements
        let sample = bass + guitar1 + guitar2 + kick + snare + hihat;

        // Add some distortion
        sample = Math.tanh(sample * 1.5);

        // Volume envelope for dynamics
        const envelope = 0.8 + 0.2 * Math.sin(time * 0.3);

        channelData[i] = sample * envelope * 0.6;
      }
    }

    // Create buffer source and connect to analyser
    const bufferSource = context.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;

    bufferSource.connect(analyserRef.current!);
    analyserRef.current!.connect(context.destination);

    // Store reference for control
    sourceRef.current = bufferSource;

    return bufferSource;
  }, []);

  const startSimulatedBeats = useCallback(() => {
    const metalBeatPattern = [1, 0, 0.7, 0, 1, 0, 0.5, 0.8];
    let patternIndex = 0;

    const interval = setInterval(() => {
      const intensity = metalBeatPattern[patternIndex % metalBeatPattern.length];
      if (intensity > 0) {
        const frequencies = Array.from({ length: 128 }, (_, i) => {
          const baseIntensity = intensity * 255;
          const freq = i / 128;

          if (freq < 0.2 || (freq > 0.6 && freq < 1.0)) {
            return baseIntensity * (0.8 + Math.random() * 0.4);
          }
          return baseIntensity * 0.3 * Math.random();
        });

        onBeatDetected(true, intensity, frequencies);

        setTimeout(() => {
          onBeatDetected(
            false,
            intensity * 0.3,
            frequencies.map((f) => f * 0.3)
          );
        }, 150);
      }
      patternIndex++;
    }, 600);

    setTimeout(() => clearInterval(interval), 30000);
  }, [onBeatDetected]);

  const setupAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;

      await createSynthesizedTrack();

      setIsReady(true);
      onAudioReady();
    } catch (error) {
      console.error("Audio setup failed:", error);
      startSimulatedBeats();
    }
  }, [createSynthesizedTrack, onAudioReady, startSimulatedBeats]);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const frequencyData = Array.from(dataArray).map((val) => val / 255);

    const bassRange = frequencyData.slice(0, 10);
    const bassEnergy = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;

    const midRange = frequencyData.slice(10, 40);
    const midEnergy = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;

    const totalEnergy = bassEnergy + midEnergy;
    const currentTime = Date.now();

    if (totalEnergy > beatThreshold && currentTime - lastBeatTime.current > beatCooldown) {
      lastBeatTime.current = currentTime;
      onBeatDetected(true, totalEnergy, frequencyData);

      setTimeout(() => {
        onBeatDetected(false, totalEnergy * 0.3, frequencyData.map((f) => f * 0.5));
      }, 100);
    } else {
      onBeatDetected(false, totalEnergy * 0.5, frequencyData.map((f) => f * 0.7));
    }

    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [isPlaying, onBeatDetected]);

  useEffect(() => {
    if (isPlaying && !isReady) {
      setupAudio();
    }
  }, [isPlaying, isReady, setupAudio]);

  useEffect(() => {
    if (isPlaying && isReady && analyserRef.current) {
      if (sourceRef.current && audioContextRef.current) {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
        try {
          sourceRef.current.start();
        } catch (e) {
          // already started
        }
      }

      analyzeAudio();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyzeAudio, isPlaying, isReady]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 rounded-lg p-3 backdrop-blur-sm border border-orange-500/30">
      <div className="flex items-center space-x-3">
        <div className="text-orange-400">{isReady ? "🎵" : "⏳"}</div>
        <div className="text-white text-sm">
          <div>Audio: {isReady ? "Ready" : "Loading..."}</div>
          <div>Status: {isPlaying ? "Playing" : "Stopped"}</div>
        </div>
      </div>
    </div>
  );
}
