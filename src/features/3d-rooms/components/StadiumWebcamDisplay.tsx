"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { WebcamUser, StadiumWebcamDisplayProps } from "../types/webcam.types";

export function StadiumWebcamDisplay({ webcamUsers, scene, camera, renderer }: StadiumWebcamDisplayProps) {
  const videoTexturesRef = useRef<Map<string, THREE.VideoTexture>>(new Map());
  const videoMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const isReady = Boolean(scene && camera && renderer);

  // 🎥 CREATE VIDEO TEXTURE FROM WEBCAM STREAM
  const createVideoTexture = useCallback((videoElement: HTMLVideoElement): THREE.VideoTexture => {
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    return videoTexture;
  }, []);

  // 🏟️ CREATE 3D VIDEO SCREEN IN STADIUM
  const createWebcamMesh = useCallback(
    (user: WebcamUser, videoTexture: THREE.VideoTexture): THREE.Group => {
      const group = new THREE.Group();

      // Video Screen (like a floating tablet)
      const screenGeometry = new THREE.PlaneGeometry(1.2, 0.9);
      const screenMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);

      // Position screen slightly above ground
      screenMesh.position.set(0, 1.5, 0);
      screenMesh.rotation.x = -0.3; // Tilt slightly for better viewing

      // Frame around the video (metallic border)
      const frameGeometry = new THREE.PlaneGeometry(1.4, 1.1);
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.8,
      });
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      frameMesh.position.set(0, 1.5, -0.01); // Slightly behind screen

      // User Name Label
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = 256;
      canvas.height = 64;

      // Clear canvas
      context.fillStyle = "rgba(0, 0, 0, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Text styling
      context.fillStyle = "#ff6600";
      context.font = "bold 20px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Draw user name
      context.fillText(user.name, canvas.width / 2, canvas.height / 2);

      const nameTexture = new THREE.CanvasTexture(canvas);
      const nameGeometry = new THREE.PlaneGeometry(1.2, 0.3);
      const nameMaterial = new THREE.MeshBasicMaterial({
        map: nameTexture,
        transparent: true,
      });
      const nameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
      nameMesh.position.set(0, 0.8, 0.01); // Below the video screen

      // Glowing effect around the screen
      const glowGeometry = new THREE.PlaneGeometry(1.6, 1.3);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.2,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.set(0, 1.5, -0.02);

      // Add all components to group
      group.add(screenMesh);
      group.add(frameMesh);
      group.add(nameMesh);
      group.add(glowMesh);

      // Position the entire group in stadium
      group.position.set(user.position.x, user.position.y, user.position.z);

      // Make screen always face the camera (billboard effect) - with null check
      if (camera && camera.position) {
        group.lookAt(camera.position);
      }

      return group;
    },
    [camera]
  );

  // 🔄 UPDATE WEBCAM DISPLAYS
  useEffect(() => {
    if (!isReady || !scene || !camera || !renderer) return;

    webcamUsers.forEach(user => {
      if (!user.isActive) return;

      const existingTexture = videoTexturesRef.current.get(user.id);
      const existingMesh = videoMeshesRef.current.get(user.id);

      // Remove old mesh if position changed or user inactive
      if (existingMesh) {
        scene.remove(existingMesh);
        videoMeshesRef.current.delete(user.id);
      }

      // Create new video texture if needed
      if (user.videoRef.current && user.videoRef.current.videoWidth > 0) {
        let videoTexture = existingTexture;

        if (!videoTexture) {
          videoTexture = createVideoTexture(user.videoRef.current);
          videoTexturesRef.current.set(user.id, videoTexture);
        }

        // Create and add new mesh
        const webcamMesh = createWebcamMesh(user, videoTexture);
        videoMeshesRef.current.set(user.id, webcamMesh);
        scene.add(webcamMesh);
      }
    });

    // Remove webcam displays for users who left
    videoMeshesRef.current.forEach((mesh, userId) => {
      const userStillActive = webcamUsers.some(user => user.id === userId && user.isActive);
      if (!userStillActive) {
        scene.remove(mesh);
        videoMeshesRef.current.delete(userId);

        const texture = videoTexturesRef.current.get(userId);
        if (texture) {
          texture.dispose();
          videoTexturesRef.current.delete(userId);
        }
      }
    });
  }, [camera, createVideoTexture, createWebcamMesh, isReady, renderer, scene, webcamUsers]);

  // 🎬 ANIMATION LOOP - Update video textures
  useEffect(() => {
    if (!isReady) return;

    let frameId: number;

    const animate = () => {
      // Update all video textures
      videoTexturesRef.current.forEach(texture => {
        if (texture.image && texture.image.videoWidth > 0) {
          texture.needsUpdate = true;
        }
      });

      // Make webcam screens gently float/bob
      videoMeshesRef.current.forEach(mesh => {
        const time = Date.now() * 0.001;
        mesh.position.y += Math.sin(time + mesh.position.x) * 0.002;
        mesh.rotation.y = Math.sin(time * 0.5) * 0.1;
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isReady]);

  // 🧹 CLEANUP
  useEffect(() => {
    if (!isReady || !scene) return;

    const textures = videoTexturesRef.current;
    const meshes = videoMeshesRef.current;

    return () => {
      textures.forEach(texture => texture.dispose());
      textures.clear();

      meshes.forEach(mesh => scene.remove(mesh));
      meshes.clear();
    };
  }, [isReady, scene]);

  return null; // This component only manages 3D objects, no DOM rendering
}

// 🎸 DEMO SIMULATION FOR DEVELOPMENT
export function createDemoWebcamUsers(): WebcamUser[] {
  return [
    {
      id: "demo-metalhead-1",
      name: "MetalMaster_🤘",
      videoRef: React.createRef(),
      position: { x: -4, y: 0, z: 3 },
      isActive: true,
    },
    {
      id: "demo-rocker-2",
      name: "StadiumRocker",
      videoRef: React.createRef(),
      position: { x: 2, y: 0, z: -5 },
      isActive: true,
    },
    {
      id: "demo-fan-3",
      name: "ConcertFan_2025",
      videoRef: React.createRef(),
      position: { x: -6, y: 0, z: -2 },
      isActive: true,
    },
    {
      id: "demo-headbanger-4",
      name: "HeadBanger_Pro",
      videoRef: React.createRef(),
      position: { x: 5, y: 0, z: 4 },
      isActive: true,
    },
  ];
}
