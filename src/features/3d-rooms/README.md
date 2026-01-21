# 🎪 3D Rooms Feature Module

Dieses Modul enthält alle 3D-Raum Komponenten der Metal3DCore Platform.

## 📂 Struktur

```
3d-rooms/
├── components/              # React 3D Room Components
│   ├── WelcomeStage.tsx
│   ├── StadionRoom.tsx
│   ├── BackstageRoom.tsx
│   ├── CommunityRoom.tsx
│   ├── BandGalleryRoom.tsx
│   ├── ContactStage.tsx
│   ├── TicketStage.tsx
│   └── index.ts            # Barrel Export
├── hooks/                  # Custom Hooks für 3D
│   ├── useRoomNavigation.ts
│   └── useFPSControls.ts
├── types/                  # TypeScript Types
│   └── room.types.ts
└── utils/                  # Utility Functions
    └── roomHelper.ts
```

## 🎯 Verwendung

```tsx
import {
  WelcomeStage,
  StadionRoom,
  BackstageRoom,
} from "@/features/3d-rooms/components";
import { useRoomNavigation } from "@/features/3d-rooms/hooks";
```

## 🏟️ Räume

- **WelcomeStage** - Haupteingang
- **StadionRoom** - Großes Konzert-Stadion
- **BackstageRoom** - VIP Backstage-Bereich
- **CommunityRoom** - Community Chat & Social
- **BandGalleryRoom** - Band-Galerie
- **ContactStage** - Kontaktformular
- **TicketStage** - Ticket-Kauf

## ✅ TODO

- [ ] Erstelle useRoomNavigation Hook
- [ ] Erstelle useFPSControls Hook
- [ ] Definiere room.types.ts
- [ ] Erstelle roomHelper utils
