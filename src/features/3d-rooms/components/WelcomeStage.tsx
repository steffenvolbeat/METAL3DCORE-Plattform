"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import {
  OrbitControls,
  Text,
  Box,
  Plane,
  Environment,
  PerspectiveCamera,
  Cylinder,
  Stage,
  Center,
  RoundedBox,
  Float,
  Sparkles,
  Html,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3, Color } from "three";
import { useSession } from "next-auth/react";
import { FPSControls } from "@/shared/components/3d";
import { AuthModal } from "@/features/auth/components";

// ECHTER HALLENSTADION ZÜRICH EINGANGSBEREICH - 1:1 Umsetzung
function HallenstadionEntrance({ onRoomChange }: { onRoomChange?: (room: string) => void }) {
  return (
    <group>
      {/* FOTOREALISTISCHER 1:1 GRANIT-BODEN - Echte physikalische Eigenschaften */}
      <Plane args={[300, 180]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color={new Color(0.15, 0.13, 0.11)} // Exakte dunkle Granit-Farbe aus Referenzbild
          roughness={0.95}
          metalness={0.0}
          clearcoat={0.05}
          clearcoatRoughness={0.95}
          reflectivity={0.02}
          envMapIntensity={0.1}
          ior={1.55}
          transmission={0.0}
          thickness={0.0}
          transparent={false}
          opacity={1.0}
          sheen={0.0}
          sheenRoughness={1.0}
        />
      </Plane>

      {/* FOTOREALISTISCHE DECKE - Dunkler wie im Referenzbild */}
      <Plane args={[300, 180]} rotation={[Math.PI / 2, 0, 0]} position={[0, 35, 0]}>
        <meshPhysicalMaterial
          color={new Color(0.78, 0.76, 0.74)} // Dunkleres Grauweiß
          roughness={0.35}
          metalness={0.0}
          clearcoat={0.05}
          clearcoatRoughness={0.4}
        />
      </Plane>

      {/* RüCKWAND - Dunkler nach Referenzbild */}
      <Plane args={[300, 35]} position={[0, 17.5, -90]}>
        <meshPhysicalMaterial
          color={new Color(0.55, 0.52, 0.49)} // Dunkleres Graubeige
          roughness={0.55}
          metalness={0.0}
          clearcoat={0.02}
          clearcoatRoughness={0.9}
        />
      </Plane>

      {/* Seitenwände - Dunkler */}
      <Plane args={[180, 35]} position={[-150, 17.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshPhysicalMaterial
          color={new Color(0.55, 0.52, 0.49)} // Dunkleres Graubeige
          roughness={0.55}
          metalness={0.0}
          clearcoat={0.02}
          clearcoatRoughness={0.9}
        />
      </Plane>

      <Plane args={[180, 35]} position={[150, 17.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshPhysicalMaterial
          color={new Color(0.55, 0.52, 0.49)} // Dunkleres Graubeige
          roughness={0.55}
          metalness={0.0}
          clearcoat={0.02}
          clearcoatRoughness={0.9}
        />
      </Plane>

      {/* ORIGINAL MASSIVE RUNDE BETONSÄULEN - Exakte Positionen */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Cylinder
          key={`main-column-${i}`}
          args={[3.5, 3.5, 35]}
          position={[((i % 4) - 1.5) * 60, 17.5, Math.floor(i / 4) * 40 - 60]}
        >
          <meshPhysicalMaterial
            color={new Color(0.8, 0.78, 0.76)} // Original Säulenfarbe
            roughness={0.45}
            metalness={0.0}
            clearcoat={0.4}
            normalScale={[3, 3]}
          />
        </Cylinder>
      ))}

      {/* MEHREBENEN GALERIE-STRUKTUR - Originalgetreu */}
      {/* Erste Galerie-Ebene bei 12m Höhe - Anthrazit */}
      <Box args={[280, 1.5, 25]} position={[0, 12, -70]}>
        <meshPhysicalMaterial
          color={new Color(0.18, 0.18, 0.2)} // Anthrazit - sehr dunkles Grau
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
        />
      </Box>

      {/* Zweite Galerie-Ebene bei 22m Höhe - Anthrazit */}
      <Box args={[260, 1.5, 22]} position={[0, 22, -67]}>
        <meshPhysicalMaterial
          color={new Color(0.18, 0.18, 0.2)} // Anthrazit - sehr dunkles Grau
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
        />
      </Box>

      {/* GLAS-GELÄNDER wie im Original */}
      {Array.from({ length: 22 }).map((_, i) => (
        <Box key={`railing-${i}`} args={[5, 1.2, 0.15]} position={[(i - 10.5) * 5, 9.2, -24]}>
          <meshPhysicalMaterial
            color={new Color(0.95, 0.97, 1.0)}
            roughness={0.02}
            metalness={0.0}
            transmission={0.95}
            thickness={0.15}
            ior={1.52}
            transparent
            opacity={0.3}
          />
        </Box>
      ))}

      {/* ORIGINAL LED-GITTER-DECKENBELEUCHTUNG - Exakt wie im Foto */}
      {/* Längsstreifen */}
      {Array.from({ length: 18 }).map((_, i) => (
        <Box key={`led-long-${i}`} args={[260, 0.4, 1.8]} position={[0, 34.5, (i - 8.5) * 10]}>
          <meshPhysicalMaterial
            color={new Color(1.0, 1.0, 1.0)}
            emissive={new Color(0.98, 0.99, 1.0)}
            emissiveIntensity={4.0}
            roughness={0.0}
          />
        </Box>
      ))}

      {/* Querstreifen für Gitter-Effekt */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Box key={`led-cross-${i}`} args={[1.8, 0.4, 140]} position={[(i - 5.5) * 22, 34.5, 0]}>
          <meshPhysicalMaterial
            color={new Color(1.0, 1.0, 1.0)}
            emissive={new Color(0.98, 0.99, 1.0)}
            emissiveIntensity={3.5}
            roughness={0.0}
          />
        </Box>
      ))}

      {/* ORIGINAL GROSSES HALLENSTADION-DISPLAY - Zentrale Rückwand */}
      <Box args={[60, 8, 0.8]} position={[0, 18, -89]}>
        <meshPhysicalMaterial
          color={new Color(0.01, 0.05, 0.18)}
          emissive={new Color(0.0, 0.15, 0.75)}
          emissiveIntensity={2.5}
          roughness={0.05}
          metalness={0.1}
          clearcoat={0.95}
        />
      </Box>
      <Html position={[0, 18, -88]} transform occlude>
        <div
          style={{
            backgroundColor: "rgba(0, 30, 120, 0.98)",
            color: "#ffffff",
            padding: "60px 80px",
            borderRadius: "20px",
            fontSize: "72px",
            fontWeight: "bold",
            textAlign: "center",
            width: "1200px",
            fontFamily: "Arial Black, sans-serif",
            textShadow: "6px 6px 12px rgba(0,0,0,0.9)",
            boxShadow: "0 20px 60px rgba(0, 30, 120, 0.7)",
            border: "4px solid rgba(255, 255, 255, 0.5)",
            letterSpacing: "4px",
          }}
        >
          HALLENSTADION ZÜRICH
          <div
            style={{
              fontSize: "32px",
              marginTop: "20px",
              fontWeight: "normal",
              opacity: 0.95,
              letterSpacing: "2px",
            }}
          >
            Willkommen • Welcome • Bienvenue • Benvenuto
          </div>
        </div>
      </Html>

      {/* ORIGINAL GLASGELÄNDER für Galerien */}
      {/* Erste Ebene Geländer */}
      {Array.from({ length: 56 }).map((_, i) => (
        <Box key={`railing-1-${i}`} args={[5, 1.8, 0.25]} position={[(i - 27.5) * 5, 13.5, -57]}>
          <meshPhysicalMaterial
            color={new Color(0.95, 0.98, 1.0)}
            roughness={0.02}
            metalness={0.0}
            transmission={0.85}
            thickness={0.25}
            ior={1.52}
            transparent
            opacity={0.25}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            emissive={new Color(0.1, 0.15, 0.2)}
            emissiveIntensity={0.05}
          />
        </Box>
      ))}

      {/* Zweite Ebene Geländer */}
      {Array.from({ length: 52 }).map((_, i) => (
        <Box key={`railing-2-${i}`} args={[5, 1.8, 0.25]} position={[(i - 25.5) * 5, 23.5, -55]}>
          <meshPhysicalMaterial
            color={new Color(0.95, 0.98, 1.0)}
            roughness={0.02}
            metalness={0.0}
            transmission={0.85}
            thickness={0.25}
            ior={1.52}
            transparent
            opacity={0.25}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            emissive={new Color(0.1, 0.15, 0.2)}
            emissiveIntensity={0.05}
          />
        </Box>
      ))}

      {/* MODERNE SITZBEREICHE - Originalgetrauer Comfort */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={`seating-area-${i}`} position={[(i - 4.5) * 25, 0, 50]}>
          {/* Moderne Sitzbank */}
          <RoundedBox args={[18, 1.2, 4]} radius={0.15} position={[0, 0.6, 0]}>
            <meshPhysicalMaterial
              color={new Color(0.28, 0.32, 0.36)}
              roughness={0.25}
              metalness={0.0}
              clearcoat={0.8}
            />
          </RoundedBox>

          {/* Rückenlehne */}
          <RoundedBox args={[18, 2.5, 0.5]} radius={0.1} position={[0, 2.5, -1.75]}>
            <meshPhysicalMaterial
              color={new Color(0.28, 0.32, 0.36)}
              roughness={0.25}
              metalness={0.0}
              clearcoat={0.8}
            />
          </RoundedBox>
        </group>
      ))}

      {/* GROSSE EINGANGS-GLASFRONT - Original Proportionen */}
      {Array.from({ length: 20 }).map((_, i) => {
        // Mittelbereich frei für Stadium-Eingang
        if (i >= 8 && i <= 11) return null;

        return (
          <Box key={`glass-wall-${i}`} args={[14, 35, 2.0]} position={[(i - 9.5) * 15, 17.5, 85]}>
            <meshPhysicalMaterial
              color={new Color(0.85, 0.92, 0.98)}
              roughness={0.05}
              metalness={0.0}
              transmission={0.75}
              thickness={2.0}
              ior={1.52}
              transparent
              opacity={0.3}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              emissive={new Color(0.1, 0.15, 0.2)}
              emissiveIntensity={0.1}
            />
          </Box>
        );
      })}

      {/* STAHL-RAHMEN für Glasfront */}
      {Array.from({ length: 21 }).map((_, i) => (
        <Box key={`steel-frame-${i}`} args={[1.5, 35, 2.5]} position={[(i - 10) * 15, 17.5, 85]}>
          <meshPhysicalMaterial
            color={new Color(0.12, 0.12, 0.15)}
            roughness={0.08}
            metalness={0.95}
            clearcoat={0.95}
          />
        </Box>
      ))}

      {/* PROFESSIONELLE ATMOSPHÄRE-BELEUCHTUNG */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 32, 0]} intensity={3.5} color="#ffffff" distance={200} />

      {/* LED-Gitter Beleuchtungseffekte */}
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight
          key={`ceiling-light-${i}`}
          position={[(i - 3.5) * 35, 33, 0]}
          intensity={2.8}
          color="#f5f8ff"
          distance={90}
        />
      ))}

      {/* Warme Akzentbeleuchtung für Sitzbereiche */}
      <pointLight position={[0, 12, 55]} intensity={2.2} color="#fff8e1" distance={100} />

      {/* Blaue Display-Beleuchtung */}
      <pointLight position={[0, 20, -80]} intensity={4.0} color="#0040dd" distance={120} />

      {/* BACKSTAGE VIP BEREICH - EXIT TÜR */}
      <group position={[-70, 0, 25]}>
        {/* BackStage VIP Eingangstür */}
        <Box
          args={[4, 12, 8]}
          position={[0, 6, 0]}
          onClick={() => onRoomChange?.("backstage")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.8, 0.6, 0.2)}
            roughness={0.05}
            metalness={0.3}
            transmission={0.7}
            thickness={0.6}
            ior={1.5}
            transparent
            emissive={new Color(0.8, 0.4, 0.1)}
            emissiveIntensity={0.5}
            clearcoat={0.9}
          />
        </Box>

        {/* BACKSTAGE VIP SCHILD */}
        <Box args={[6, 2, 0.3]} position={[0, 14, 0]}>
          <meshPhysicalMaterial
            color={new Color(0.1, 0.1, 0.1)}
            emissive={new Color(0.8, 0.4, 0.0)}
            emissiveIntensity={1.2}
            roughness={0.05}
            metalness={0.8}
            clearcoat={0.95}
          />
        </Box>

        {/* BACKSTAGE VIP TEXT */}
        <Html position={[0, 14, 0.4]} transform occlude>
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              color: "#ff8800",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(255, 136, 0, 0.4)",
              border: "2px solid rgba(255, 136, 0, 0.6)",
            }}
          >
            🎸 BACKSTAGE VIP
          </div>
        </Html>

        {/* BACKSTAGE VIP TEXT - RÜCKSEITE */}
        <Html position={[0, 14, -0.4]} transform occlude rotation={[0, Math.PI, 0]}>
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              color: "#ff8800",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(255, 136, 0, 0.4)",
              border: "2px solid rgba(255, 136, 0, 0.6)",
            }}
          >
            🎸 BACKSTAGE VIP
          </div>
        </Html>

        {/* BackStage Türgriff */}
        <Box args={[0.4, 1.0, 0.8]} position={[1.8, 6, 0.6]}>
          <meshPhysicalMaterial color={new Color(0.9, 0.7, 0.3)} roughness={0.05} metalness={0.98} clearcoat={1.0} />
        </Box>
      </group>

      {/* TICKET ARENA BEREICH - EXIT TÜR */}
      <group position={[70, 0, 25]}>
        {/* TicketArena Eingangstür */}
        <Box
          args={[4, 12, 8]}
          position={[0, 6, 0]}
          onClick={() => onRoomChange?.("tickets")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.2, 0.6, 0.8)}
            roughness={0.08}
            metalness={0.2}
            transmission={0.75}
            thickness={0.6}
            ior={1.5}
            transparent
            emissive={new Color(0.1, 0.4, 0.8)}
            emissiveIntensity={0.4}
            clearcoat={0.9}
          />
        </Box>

        {/* TICKET ARENA SCHILD */}
        <Box args={[6, 2, 0.3]} position={[0, 14, 0]}>
          <meshPhysicalMaterial
            color={new Color(0.0, 0.2, 0.4)}
            emissive={new Color(0.0, 0.4, 0.9)}
            emissiveIntensity={1.0}
            roughness={0.05}
            metalness={0.8}
            clearcoat={0.95}
          />
        </Box>

        {/* TICKET ARENA TEXT */}
        <Html position={[0, 14, 0.4]} transform occlude>
          <div
            style={{
              backgroundColor: "rgba(0, 40, 80, 0.9)",
              color: "#00aaff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(0, 170, 255, 0.4)",
              border: "2px solid rgba(0, 170, 255, 0.6)",
            }}
          >
            🎫 TICKET ARENA
          </div>
        </Html>

        {/* TICKET ARENA TEXT - RÜCKSEITE */}
        <Html position={[0, 14, -0.4]} transform occlude rotation={[0, Math.PI, 0]}>
          <div
            style={{
              backgroundColor: "rgba(0, 40, 80, 0.9)",
              color: "#00aaff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(0, 170, 255, 0.4)",
              border: "2px solid rgba(0, 170, 255, 0.6)",
            }}
          >
            🎫 TICKET ARENA
          </div>
        </Html>

        {/* TicketArena Türgriff */}
        <Box args={[0.4, 1.0, 0.8]} position={[1.8, 6, 0.6]}>
          <meshPhysicalMaterial color={new Color(0.3, 0.7, 0.9)} roughness={0.05} metalness={0.98} clearcoat={1.0} />
        </Box>
      </group>
    </group>
  );
}

// FOTOREALISTISCHE HALLENSTADION-NAVIGATION
function StadionNavigationGates({ onRoomChange }: { onRoomChange?: (room: string) => void }) {
  return (
    <group>
      {" "}
      {/*group  muss immer mit einem Großbuchastaben beginnen "Group"*/}
      {/* HAUPTEINGANG ZUM STADIUM - Massive Glastüren VOR DER GLASFRONT */}
      <group position={[0, 0, -28]}>
        {/* Linke Glastür - GRÖSSER UND SICHTBARER */}
        <Box
          args={[8, 15, 0.8]}
          position={[-4.5, 7.5, 0]}
          onClick={() => onRoomChange?.("stadium")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.8, 0.9, 1.0)}
            roughness={0.05}
            metalness={0.0}
            transmission={0.65}
            thickness={0.8}
            ior={1.5}
            transparent
            opacity={0.4}
            emissive={new Color(0.2, 0.4, 0.8)}
            emissiveIntensity={0.4}
          />
        </Box>

        {/* Rechte Glastür - GRÖSSER UND SICHTBARER */}
        <Box
          args={[8, 15, 0.8]}
          position={[4.5, 7.5, 0]}
          onClick={() => onRoomChange?.("stadium")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.8, 0.9, 1.0)}
            roughness={0.05}
            metalness={0.0}
            transmission={0.65}
            thickness={0.8}
            ior={1.5}
            transparent
            opacity={0.4}
            emissive={new Color(0.2, 0.4, 0.8)}
            emissiveIntensity={0.4}
          />
        </Box>

        {/* Türrahmen - GRÖSSER */}
        <Box args={[10, 1.2, 1]} position={[0, 15, 0]}>
          <meshPhysicalMaterial color={new Color(0.3, 0.3, 0.35)} roughness={0.2} metalness={0.9} clearcoat={0.8} />
        </Box>
      </group>
      {/* SEITENEINGANG GALLERY - EXIT TÜREN */}
      <group position={[-35, 0, 0]}>
        {/* Gallery Eingangstür */}
        <Box
          args={[3, 10, 8]}
          position={[0, 5, 0]}
          onClick={() => onRoomChange?.("gallery")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.7, 0.8, 0.9)}
            roughness={0.1}
            metalness={0.0}
            transmission={0.85}
            thickness={0.5}
            ior={1.5}
            transparent
            emissive={new Color(0.3, 0.1, 0.4)}
            emissiveIntensity={0.3}
          />
        </Box>

        {/* GALLERY EXIT SCHILD MIT TEXT */}
        <Box args={[4, 1.5, 0.2]} position={[0, 12, 0]}>
          <meshPhysicalMaterial
            color={new Color(0.8, 0.1, 0.1)}
            emissive={new Color(0.9, 0.2, 0.2)}
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.3}
          />
        </Box>

        {/* GALLERY TEXT - HTML OVERLAY (BEIDSEITIG) */}
        <Html position={[0, 12, 0.4]} transform occlude>
          <div
            style={{
              backgroundColor: "rgba(0, 40, 80, 0.9)",
              color: "#00aaff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(0, 170, 255, 0.4)",
              border: "2px solid rgba(0, 170, 255, 0.6)",
            }}
          >
            🖼️ GALLERY
          </div>
        </Html>

        {/* GALLERY TEXT - RÜCKSEITE */}
        <Html position={[0, 12, -0.4]} transform occlude rotation={[0, Math.PI, 0]}>
          <div
            style={{
              backgroundColor: "rgba(0, 40, 80, 0.9)",
              color: "#00aaff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(0, 170, 255, 0.4)",
              border: "2px solid rgba(0, 170, 255, 0.6)",
            }}
          >
            🖼️ GALLERY
          </div>
        </Html>

        {/* Gallery Türgriff */}
        <Box args={[0.3, 0.8, 0.6]} position={[1.2, 5, 0.5]}>
          <meshPhysicalMaterial color={new Color(0.7, 0.7, 0.75)} roughness={0.1} metalness={0.95} clearcoat={1.0} />
        </Box>
      </group>
      {/* COMMUNITY BEREICH - EXIT TÜREN */}
      <group position={[35, 0, 0]}>
        {/* Community Eingangstür */}
        <Box
          args={[3, 10, 8]}
          position={[0, 5, 0]}
          onClick={() => console.log("Community - Coming Soon!")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.7, 0.8, 0.9)}
            roughness={0.1}
            metalness={0.0}
            transmission={0.65}
            thickness={0.5}
            ior={1.5}
            transparent
            opacity={0.4}
            emissive={new Color(0.1, 0.3, 0.2)}
            emissiveIntensity={0.2}
          />
        </Box>

        {/* COMMUNITY COMING SOON SCHILD MIT TEXT */}
        <Box args={[5, 1.5, 0.2]} position={[0, 12, 0]}>
          <meshPhysicalMaterial
            color={new Color(0.9, 0.6, 0.1)}
            emissive={new Color(0.9, 0.5, 0.1)}
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.3}
          />
        </Box>

        {/* COMMUNITY TEXT - HTML OVERLAY (BEIDSEITIG) */}
        <Html position={[0, 12, 0.4]} transform occlude>
          <div
            style={{
              backgroundColor: "rgba(0, 40, 80, 0.9)",
              color: "#00aaff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(0, 170, 255, 0.4)",
              border: "2px solid rgba(0, 170, 255, 0.6)",
            }}
          >
            💬 COMMUNITY
          </div>
        </Html>

        {/* COMMUNITY TEXT - RÜCKSEITE */}
        <Html position={[0, 12, -0.4]} transform occlude rotation={[0, Math.PI, 0]}>
          <div
            style={{
              backgroundColor: "rgba(0, 40, 80, 0.9)",
              color: "#00aaff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              width: "180px",
              fontFamily: "Arial, sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              boxShadow: "0 4px 20px rgba(0, 170, 255, 0.4)",
              border: "2px solid rgba(0, 170, 255, 0.6)",
            }}
          >
            💬 COMMUNITY
          </div>
        </Html>

        {/* Community Türgriff */}
        <Box args={[0.3, 0.8, 0.6]} position={[1.2, 5, 0.5]}>
          <meshPhysicalMaterial color={new Color(0.7, 0.7, 0.75)} roughness={0.1} metalness={0.95} clearcoat={1.0} />
        </Box>
      </group>
      {/* SEITENEINGANG GALLERY - Eleganter VIP-Bereich */}
      <group position={[-35, 0, 0]}>
        <Box
          args={[3, 10, 8]}
          position={[0, 5, 0]}
          onClick={() => onRoomChange?.("gallery")}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.4, 0.2, 0.6)}
            roughness={0.1}
            metalness={0.8}
            clearcoat={1.0}
            emissive={new Color(0.3, 0.1, 0.4)}
            emissiveIntensity={0.3}
          />
        </Box>

        {/* VIP Gallery Schild */}
        <Box args={[4, 1.5, 0.2]} position={[0, 12, 0]}>
          <meshPhysicalMaterial
            color={new Color(0.1, 0.1, 0.12)}
            roughness={0.2}
            metalness={0.9}
            emissive={new Color(0.6, 0.3, 0.8)}
            emissiveIntensity={0.5}
          />
        </Box>
      </group>
      {/* COMMUNITY BEREICH - Moderná Lounge */}
      <group position={[35, 0, 0]}>
        <Box
          args={[3, 10, 8]}
          position={[0, 5, 0]}
          onPointerOver={e => (document.body.style.cursor = "pointer")}
          onPointerOut={e => (document.body.style.cursor = "auto")}
        >
          <meshPhysicalMaterial
            color={new Color(0.2, 0.5, 0.3)}
            roughness={0.1}
            metalness={0.8}
            clearcoat={1.0}
            emissive={new Color(0.1, 0.3, 0.2)}
            emissiveIntensity={0.2}
            opacity={0.8}
            transparent
          />
        </Box>

        {/* Coming Soon Schild */}
        <Box args={[5, 1.5, 0.2]} position={[0, 12, 0]}>
          <meshPhysicalMaterial
            color={new Color(0.1, 0.1, 0.12)}
            roughness={0.2}
            metalness={0.9}
            emissive={new Color(0.3, 0.6, 0.4)}
            emissiveIntensity={0.4}
          />
        </Box>
      </group>
    </group>
  );
}

// PROFESSIONELLE HALLENSTADION-BELEUCHTUNG
function HallenstadionLighting() {
  return (
    <group>
      {/* HAUPTBELEUCHTUNG - Realistische Stadionbeleuchtung */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.sin(angle) * 35;
        const z = Math.cos(angle) * 35;
        return (
          <spotLight
            key={`stadium-light-${i}`}
            position={[x, 25, z]}
            angle={Math.PI / 6}
            penumbra={0.3}
            intensity={2.5}
            color="#ffffff"
            castShadow
            target-position={[0, 0, 0]}
          />
        );
      })}

      {/* EINGANGS-AKZENTBELEUCHTUNG */}
      <spotLight
        position={[0, 20, -15]}
        angle={Math.PI / 3}
        penumbra={0.4}
        intensity={3}
        color="#4a90e2"
        castShadow
        target-position={[0, 0, -20]}
      />

      {/* SEITLICHE ARCHITEKTURBELEUCHTUNG */}
      <spotLight
        position={[-30, 15, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={2}
        color="#9333ea"
        castShadow
        target-position={[-35, 5, 0]}
      />

      <spotLight
        position={[30, 15, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={2}
        color="#059669"
        castShadow
        target-position={[35, 5, 0]}
      />

      {/* AMBIENTE UND GRUNDBELEUCHTUNG */}
      <ambientLight intensity={0.3} color="#e8e8f0" />

      {/* HAUPTLICHT für realistische Schatten */}
      <directionalLight
        position={[0, 30, 10]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
    </group>
  );
}

// WebGL Availability Check Component
function WebGLAvailabilityChecker({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  useEffect(() => {
    // Check WebGL availability (permissive for iOS Safari)
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2", { antialias: false }) ||
        canvas.getContext("webgl", { antialias: false }) ||
        canvas.getContext("experimental-webgl", { antialias: false });

      if (!gl) {
        console.warn("WebGL not available - using fallback");
        setWebglAvailable(false);
      }
    } catch (e) {
      console.warn("WebGL check failed:", e);
      setWebglAvailable(false);
    }
  }, []);

  return webglAvailable ? <>{children}</> : <>{fallback}</>;
}

// Fallback Component for when WebGL is not available
function WebGLFallback({
  onRoomChange,
  isFullscreen,
}: {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
}) {
  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-linear-to-b from-gray-900 to-black"
          : "w-full h-64 sm:h-80 lg:h-96 bg-linear-to-b from-gray-900 to-black rounded-lg overflow-hidden flex items-center justify-center"
      }
    >
      <div className="text-center space-y-6 p-8 max-w-md mx-auto">
        <div className="text-6xl mb-4">🏟️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Hallenstadion Zürich</h2>
        <p className="text-gray-300 mb-6">3D-Navigation ist auf diesem System nicht verfügbar</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <button
            onClick={() => onRoomChange?.("stadium")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            🏟️ Stadium
          </button>
          <button
            onClick={() => onRoomChange?.("gallery")}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
          >
            🖼️ Gallery
          </button>
          <button
            onClick={() => onRoomChange?.("tickets")}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            🎫 Tickets
          </button>
          <button
            onClick={() => onRoomChange?.("backstage")}
            className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors"
          >
            🎸 Backstage
          </button>
        </div>

        <div className="text-xs text-gray-400 mt-6">
          <p>💡 Tipp: Für die beste Erfahrung verwenden Sie einen Browser mit WebGL-Unterstützung</p>
        </div>
      </div>
    </div>
  );
}

interface WelcomeStageProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
  onOpenAuth?: (mode: "login" | "signup") => void;
  onFullscreen?: () => void;
}

export default function WelcomeStage({
  onRoomChange,
  isFullscreen = false,
  onOpenAuth,
  onFullscreen,
}: WelcomeStageProps) {
  const [controlMode, setControlMode] = useState<"fps" | "orbit">("fps");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { data: session } = useSession();

  // Auth Modal State - now handled internally
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "signup";
  }>({ isOpen: false, mode: "login" });

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: authModal.mode });
  };

  useEffect(() => {
    const touch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(!!touch);
    if (touch) setControlMode("orbit");
  }, []);

  // Debug: Log ob onOpenAuth korrekt übergeben wurde
  console.log("WelcomeStage Props:", {
    onRoomChange: !!onRoomChange,
    onOpenAuth: !!onOpenAuth,
    session: !!session,
  });

  return (
    <WebGLAvailabilityChecker fallback={<WebGLFallback onRoomChange={onRoomChange} isFullscreen={isFullscreen} />}>
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 bg-black"
            : "relative w-full max-w-6xl mx-auto aspect-video max-h-[80vh] bg-black rounded-lg overflow-hidden"
        }
        style={isFullscreen ? undefined : { minHeight: "360px" }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 2, 5], fov: 75 }}
          style={{ background: "linear-gradient(to bottom, #0a0a0a, #1a1a1a)", touchAction: "none" }}
          onCreated={state => {
            // Zusätzliche WebGL Verfügbarkeitsprüfung nach Canvas-Erstellung
            console.log("Canvas created successfully with WebGL context");
          }}
        >
          {/*Enviroment für realistische Reflektionen*/}
          <Environment preset="warehouse" />
          {/* Beleuchtung */}
          <HallenstadionLighting />

          {/* Bewegungssteuerung */}
          {!isTouchDevice && controlMode === "fps" ? (
            <FPSControls
              movementSpeed={12}
              lookSpeed={0.002}
              boundaries={{ minX: -85, maxX: 85, minZ: -50, maxZ: 50 }}
            />
          ) : (
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              maxDistance={80}
              minDistance={5}
              maxPolarAngle={Math.PI / 2}
            />
          )}

          {/* FOTOREALISTISCHER HALLENSTADION EINGANGSBEREICH */}
          <HallenstadionEntrance onRoomChange={onRoomChange} />

          {/* PROFESSIONELLE NAVIGATION */}
          <StadionNavigationGates onRoomChange={onRoomChange} />

          {/* Sparkles Effekt */}
          <Sparkles count={100} scale={[20, 20, 20]} size={3} speed={0.3} color="#ff6b35" />

          {/*HALLENSTADION ZÜRICH WELCOME - WEITER VORNE, NICHT VERDECKT*/}
          <Text
            position={[0, 18, -5]}
            fontSize={2.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.1}
            outlineColor="#4a90e2"
          >
            HALLENSTADION ZÜRICH
          </Text>

          <Text position={[0, 15, -5]} fontSize={1.2} color="#4a90e2" anchorX="center" anchorY="middle">
            Metal3DCore Plattform (M3DC)
          </Text>

          <Text position={[0, 13, -5]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle">
            WASD Bewegung • Maus Umschauen • Klicke Eingänge für Navigation
          </Text>

          {/* Control Mode Toggle UI - ATTACHED TO COLUMN */}
          <Html position={[-25, 10, -20]} center distanceFactor={2} zIndexRange={[100, 0]}>
            <div
              data-testid="room-selector"
              className="bg-black/95 backdrop-blur-md rounded-xl p-12 text-center shadow-2xl border-4 border-orange-500/80 animate-pulse"
              style={{
                zIndex: 1000,
                position: "relative",
                minWidth: "600px",
                minHeight: "400px",
                fontSize: "32px",
                boxShadow: "0 0 50px rgba(249, 115, 22, 0.8)",
                transform: "scale(8)",
              }}
            >
              <h3 className="text-white font-bold mb-4 text-center text-2xl">🧭 Navigation Mode</h3>

              <div className="mb-6 text-white text-base">
                <p className="mb-3">
                  📋 <strong>Steuerung Anweisungen:</strong>
                </p>
                <div className="text-left space-y-2 text-sm">
                  <p>
                    • <strong>FPS Mode:</strong> WASD = Bewegen, Maus = Umschauen
                  </p>
                  <p>
                    • <strong>Orbit Mode:</strong> Maus ziehen = Kamera drehen
                  </p>
                  <p>
                    • <strong>ESC Taste:</strong> Mauszeiger freigeben / Steuerung pausieren
                  </p>
                  <p>
                    • <strong>Türen:</strong> Anklicken für Raumwechsel
                  </p>
                  <p>
                    • <strong>Vollbild:</strong> Für beste Erfahrung empfohlen
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-6 justify-center">
                <button
                  data-testid="control-fps"
                  onClick={() => setControlMode("fps")}
                  className={`px-6 py-3 rounded text-base font-bold ${
                    controlMode === "fps" ? "bg-orange-500 text-white" : "bg-gray-600 text-gray-300"
                  }`}
                >
                  🎮 FPS (WASD)
                </button>
                <button
                  data-testid="control-orbit"
                  onClick={() => setControlMode("orbit")}
                  className={`px-6 py-3 rounded text-base font-bold ${
                    controlMode === "orbit" ? "bg-orange-500 text-white" : "bg-gray-600 text-gray-300"
                  }`}
                >
                  🖱️ Orbit
                </button>
              </div>
              {onFullscreen && (
                <button
                  data-testid="fullscreen-toggle"
                  onClick={onFullscreen}
                  className="px-6 py-3 rounded text-base bg-blue-600 hover:bg-blue-700 text-white w-full mx-auto block font-bold"
                  title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
                >
                  {isFullscreen ? "📱 Normal" : "🖥️ Vollbild"}
                </button>
              )}
            </div>
          </Html>

          {/* 🔥 REGISTRATION WELCOME PANEL - Nur für neue User */}
          {!session && !authModal.isOpen && (
            <Html position={[25, 8, -15]} center distanceFactor={12} zIndexRange={[100, 0]}>
              <div
                data-testid="welcome-registration-panel"
                style={{ zIndex: 1001, position: "relative" }}
                className="bg-linear-to-r from-orange-500 to-red-600 p-6 rounded-xl shadow-2xl text-center max-w-sm border-2 border-orange-400 backdrop-blur-md"
              >
                <div className="mb-4">
                  <span className="text-4xl mb-2 block animate-bounce">🎸</span>
                  <h3 className="text-white font-black text-lg mb-2 tracking-tight">Willkommen bei Metal3DCore!</h3>
                  <p className="text-orange-100 text-sm mb-4 leading-relaxed">
                    Erstelle dein Account und erlebe die ultimative Metal-Plattform
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={e => {
                      console.log("Band Registration clicked!", e);
                      e.preventDefault();
                      e.stopPropagation();
                      openAuthModal("signup");
                    }}
                    onPointerDown={e => e.stopPropagation()}
                    className="group relative overflow-hidden px-6 py-3 bg-black/80 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-orange-300 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <span className="text-lg">🎤</span>
                      <span>Registrieren als Band</span>
                    </span>
                  </button>

                  <button
                    onClick={e => {
                      console.log("Fan Registration clicked!", e);
                      e.preventDefault();
                      e.stopPropagation();
                      openAuthModal("signup");
                    }}
                    onPointerDown={e => e.stopPropagation()}
                    className="group relative overflow-hidden px-6 py-3 bg-white/90 hover:bg-white text-gray-900 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-orange-500/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <span className="text-lg">🤘</span>
                      <span>Registrieren als Fan</span>
                    </span>
                  </button>

                  <button
                    onClick={e => {
                      console.log("Login clicked!", e);
                      e.preventDefault();
                      e.stopPropagation();
                      openAuthModal("login");
                    }}
                    onPointerDown={e => e.stopPropagation()}
                    className="px-4 py-2 text-orange-100 hover:text-white font-medium transition-colors text-sm underline decoration-2 underline-offset-2 hover:decoration-white cursor-pointer"
                  >
                    Bereits registriert? → Login
                  </button>
                </div>
              </div>
            </Html>
          )}

          {/* 🎸 USER WELCOME PANEL - Für angemeldete User */}
          {session && (
            <Html position={[25, 8, -15]} center distanceFactor={12} zIndexRange={[100, 0]}>
              <div
                data-testid="welcome-user-panel"
                className="bg-linear-to-r from-green-600 to-blue-600 p-6 rounded-xl shadow-2xl text-center max-w-sm border-2 border-green-400 backdrop-blur-md"
                style={{ zIndex: 1002, position: "relative" }}
              >
                <div className="mb-4">
                  <span className="text-4xl mb-2 block">👋</span>
                  <h3 className="text-white font-black text-lg mb-2">Willkommen zurück!</h3>
                  <p className="text-green-100 text-sm mb-2">
                    Hallo <strong>{session.user?.name}</strong>
                  </p>
                  <p className="text-green-100 text-xs">
                    {session.user?.role === "BAND" ? "🎤 Band Account" : "🤘 Fan Account"}
                  </p>
                </div>

                <div className="text-xs text-green-200 mt-3">
                  <p>Erkunde die Räume und erlebe Metal3DCore!</p>
                </div>
              </div>
            </Html>
          )}
        </Canvas>

        {/* Fullscreen Exit Button */}
        {isFullscreen && (
          <button
            data-testid="exit-fullscreen"
            onClick={() => onRoomChange?.("welcome")}
            className="absolute top-4 right-4 z-60 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
          >
            ✕ Exit Fullscreen
          </button>
        )}

        {/* AuthModal - now integrated in WelcomeStage */}
        <AuthModal isOpen={authModal.isOpen} onClose={closeAuthModal} initialMode={authModal.mode} />
      </div>
    </WebGLAvailabilityChecker>
  );
}
