"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Box, Plane, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useSession } from "next-auth/react";
import { FPSControls } from "@/shared/components/3d";
import { RoomAccessControl } from "./RoomAccessControl";

interface Props {
  onRoomChange: (room: string) => void;
  isFullscreen: boolean;
}

// Community Room Environment Component
function CommunityRoomEnvironment() {
  const roomRef = useRef<THREE.Group>(null);

  return (
    <group ref={roomRef}>
      {/* Floor */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
      >
        <meshStandardMaterial color="#2a1810" roughness={0.8} metalness={0.1} />
      </Plane>

      {/* Walls */}
      {/* Back Wall */}
      <Plane args={[20, 8]} position={[0, 2, -10]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Plane>

      {/* Left Wall */}
      <Plane
        args={[20, 8]}
        position={[-10, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Plane>

      {/* Right Wall */}
      <Plane
        args={[20, 8]}
        position={[10, 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Plane>

      {/* Ceiling */}
      <Plane
        args={[20, 20]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 6, 0]}
      >
        <meshStandardMaterial color="#0f0f0f" roughness={0.7} />
      </Plane>

      {/* Furniture - Sofas */}
      <group position={[0, -1.5, 2]}>
        {/* Main Sofa */}
        <Box args={[4, 0.8, 1.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Box>
        <Box args={[4, 1.2, 0.3]} position={[0, 0.5, -0.6]}>
          <meshStandardMaterial color="#654321" roughness={0.8} />
        </Box>

        {/* Side Chairs */}
        <Box args={[1.2, 0.8, 1.2]} position={[-3, 0, -2]}>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Box>
        <Box args={[1.2, 0.8, 1.2]} position={[3, 0, -2]}>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Box>
      </group>

      {/* Coffee Table */}
      <Box args={[2, 0.1, 1]} position={[0, -1.8, 0]}>
        <meshStandardMaterial color="#3a2a1a" roughness={0.3} metalness={0.1} />
      </Box>

      {/* Metal Posters on Back Wall */}
      <group position={[0, 2, -9.8]}>
        <Plane args={[2, 3]} position={[-4, 0, 0]}>
          <meshStandardMaterial color="#ff4500" />
        </Plane>
        <Text
          position={[-4, 0, 0.01]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          METALLICA
        </Text>

        <Plane args={[2, 3]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ff6600" />
        </Plane>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          IRON MAIDEN
        </Text>

        <Plane args={[2, 3]} position={[4, 0, 0]}>
          <meshStandardMaterial color="#cc3300" />
        </Plane>
        <Text
          position={[4, 0, 0.01]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          BLACK SABBATH
        </Text>
      </group>

      {/* Room Navigation Portals */}
      <group position={[0, -1, -8]}>
        <Text
          position={[-6, 1, 0]}
          fontSize={0.5}
          color="#ff6600"
          anchorX="center"
          anchorY="middle"
        >
          ← Welcome Stage
        </Text>

        <Text
          position={[0, 1, 0]}
          fontSize={0.5}
          color="#ff6600"
          anchorX="center"
          anchorY="middle"
        >
          🎤 Backstage →
        </Text>

        <Text
          position={[6, 1, 0]}
          fontSize={0.5}
          color="#ff6600"
          anchorX="center"
          anchorY="middle"
        >
          🎫 Tickets →
        </Text>
      </group>

      {/* Ambient Lighting - VERSTÄRKT */}
      <ambientLight intensity={0.7} color="#FFF8DC" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 10, 5]} intensity={1.5} />

      {/* Warm Room Lighting - VERSTÄRKT */}
      <pointLight
        position={[-3, 5, -3]}
        intensity={1.5}
        color="#ff6600"
        distance={15}
      />
      <pointLight
        position={[3, 5, -3]}
        intensity={1.5}
        color="#ff6600"
        distance={15}
      />
      <pointLight
        position={[0, 5, 2]}
        intensity={2.0}
        color="#ffaa44"
        distance={15}
      />
      <pointLight
        position={[-5, 4, 0]}
        intensity={1.5}
        color="#FFE4B5"
        distance={12}
      />
      <pointLight
        position={[5, 4, 0]}
        intensity={1.5}
        color="#FFE4B5"
        distance={12}
      />
      <pointLight
        position={[0, 5, -5]}
        intensity={1.8}
        color="#F0E68C"
        distance={15}
      />
    </group>
  );
}

// Online Users Component
function OnlineUsers() {
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState([
    { id: "1", name: "MetalFan87", role: "USER", isOnline: true },
    { id: "2", name: "Metallica", role: "BAND_MEMBER", isOnline: true },
    { id: "3", name: "RockGirl23", role: "USER", isOnline: true },
  ]);

  return (
    <div className="absolute left-4 top-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-64 max-h-96 overflow-y-auto">
      <h3 className="text-orange-500 font-bold mb-3 text-lg">
        🌟 Online im Community Room
      </h3>
      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded bg-gray-800/50"
          >
            <div
              className={`w-3 h-3 rounded-full ${
                user.isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {user.role === "BAND_MEMBER" ? "🎤" : "🎸"}
                </span>
                <span
                  className={`text-sm font-medium ${
                    user.role === "BAND_MEMBER"
                      ? "text-purple-400"
                      : "text-white"
                  }`}
                >
                  {user.name}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {user.role === "BAND_MEMBER" ? "Metal Band" : "Metal Fan"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {session && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            Du bist als{" "}
            <span
              className={
                session.user?.role === "BAND_MEMBER"
                  ? "text-purple-400"
                  : "text-orange-400"
              }
            >
              {session.user?.role === "BAND_MEMBER" ? "🎤 Band" : "🎸 Fan"}
            </span>{" "}
            online
          </div>
        </div>
      )}
    </div>
  );
}

// Chat Component
function CommunityChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    {
      id: "1",
      user: "MetalFan87",
      role: "USER",
      message: "Hey Leute! Freue mich auf das nächste Konzert! 🤘",
      timestamp: new Date(),
    },
    {
      id: "2",
      user: "Metallica",
      role: "BAND_MEMBER",
      message: "Danke für euren Support! Neues Album kommt bald 🎸",
      timestamp: new Date(),
    },
    {
      id: "3",
      user: "RockGirl23",
      role: "USER",
      message: "Kann es kaum erwarten! Metallica ist die beste Band ever! 🔥",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim() || !session?.user) return;

    const user = session.user as any;
    const message = {
      id: Date.now().toString(),
      user:
        user.role === "BAND_MEMBER" && user.band
          ? user.band.name
          : user.name || "Unknown",
      role: user.role || "USER",
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="absolute right-4 top-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-80 h-96 flex flex-col">
      <h3 className="text-orange-500 font-bold mb-3 text-lg">
        💬 Community Chat
      </h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-gray-800/50 rounded p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm">
                {msg.role === "BAND_MEMBER" ? "🎤" : "🎸"}
              </span>
              <span
                className={`text-sm font-medium ${
                  msg.role === "BAND_MEMBER"
                    ? "text-purple-400"
                    : "text-orange-400"
                }`}
              >
                {msg.user}
              </span>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-200">{msg.message}</p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      {session ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Nachricht eingeben..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            📤
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-400 text-sm">
          <p>Melde dich an, um zu chatten</p>
        </div>
      )}
    </div>
  );
}

// Main Community Room Component - COMING SOON PAGE
export default function CommunityRoom({ onRoomChange, isFullscreen }: Props) {
  const { data: session } = useSession();
  const [countdown, setCountdown] = useState({
    days: 15,
    hours: 8,
    minutes: 42,
    seconds: 17
  });

  // Countdown Timer Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <RoomAccessControl
      requiredAccess="concert"
      roomName="Community Hub - Coming Soon"
      roomDescription="Der Community Hub kommt bald - hier wirst du mit anderen Metal-Fans chatten können!"
    >
      <div
        className={`relative ${
          isFullscreen ? "h-screen w-screen" : "h-[600px] w-full"
        } bg-gray-900 rounded-lg overflow-hidden`}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 75 }}
          shadows
          className="w-full h-full"
        >
          <CommunityRoomEnvironment />
          <FPSControls boundaries={{ minX: -9, maxX: 9, minZ: -9, maxZ: 9 }} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>

        {/* Coming Soon Interface */}
        <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-md p-6 rounded-xl border border-purple-500 w-96">
          <div className="text-center mb-4">
            <h3 className="text-purple-400 font-bold text-xl mb-2">
              🚧 Community Hub
            </h3>
            <div className="text-yellow-400 font-bold text-lg">
              COMING SOON
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-black/30 p-4 rounded-lg mb-4">
            <div className="text-center text-white mb-3">
              <div className="text-sm text-gray-400 mb-2">Launch Countdown</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.days}</div>
                  <div className="text-xs">Tage</div>
                </div>
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.hours}</div>
                  <div className="text-xs">Std</div>
                </div>
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.minutes}</div>
                  <div className="text-xs">Min</div>
                </div>
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.seconds}</div>
                  <div className="text-xs">Sek</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-3 text-sm">
            <div className="text-center text-purple-300 font-bold mb-3">
              🎯 Kommende Features:
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-green-400">💬</span>
              <span>Live Chat mit anderen Metal-Fans</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-blue-400">🎵</span>
              <span>Gemeinsame Musik Sessions</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-yellow-400">🏆</span>
              <span>Metal Trivia & Competitions</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-red-400">📸</span>
              <span>Fan Photo Sharing</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-purple-400">🎤</span>
              <span>Band Member Q&A Events</span>
            </div>
          </div>

          {/* User Status */}
          {session?.user && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-center">
                <span className="text-gray-400">Bereit für Launch:</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-lg">{session.user.image || "🤘"}</span>
                  <span className="text-purple-300 font-semibold">
                    {session.user.name || "Metal Fan"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-purple-500">
          <div className="space-y-3">
            <button
              onClick={() => onRoomChange("welcome")}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              ← Zurück zur Welcome Stage
            </button>
          </div>
        </div>

        {/* Room Controls */}
        {!isFullscreen && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-white text-sm text-center mb-2">
                🏗️ Community Hub - COMING SOON!
              </p>
              <div className="flex space-x-4 text-xs text-gray-300">
                <span>WASD - Bewegung</span>
                <span>Maus - Umschauen</span>
                <span>Scroll - Zoom</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Hints */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <p className="text-orange-400 text-sm font-medium">
              Klicke auf die Portale im Raum zur Navigation
            </p>
          </div>
        </div>
      </div>
    </RoomAccessControl>
  );
}
