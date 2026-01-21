# 🛡️ Admin Feature Module

**Version:** 2.0.0  
**Letzte Aktualisierung:** 6. Dezember 2025  
**Status:** Production Ready ✅

---

## 📋 Übersicht

Das Admin-Feature ermöglicht Administratoren den Zugriff auf eine dedizierte **Coming Soon Page**, auf der die Projekt-Roadmap, Vision, Meilensteine und kommende Features verwaltet werden können.

---

## 📂 Struktur

```
admin/
├── components/          # React Admin Components
│   ├── AdminButton.tsx       # ✅ Header-Button für Admin-Zugriff
│   ├── ComingSoonPage.tsx    # ✅ Haupt-Roadmap-Verwaltung
│   ├── AccessControlDemo.tsx # ✅ Access-Demo-Component
│   └── index.ts              # ✅ Barrel Export
├── hooks/              # Custom Hooks
│   └── useAdmin.ts     # TODO
├── services/           # API Services
│   └── adminService.ts # TODO
├── types/              # TypeScript Types
│   └── admin.types.ts  # TODO
└── utils/              # Utility Functions
    └── adminHelper.ts  # TODO
```

---

## 🎯 Features

### ✅ Implementiert (Version 2.0.0)

1. **Coming Soon Page** (`/admin/coming-soon`)

   - Vollständige Roadmap-Verwaltung
   - Vision & Projekt-Beschreibung bearbeitbar
   - Meilensteine mit Status-Tracking (completed, in-progress, planned)
   - Kommende Features-Liste
   - Live-Präsentations-Informationen
   - Bearbeitungsmodus für Admins
   - Responsive Design mit Tailwind CSS

2. **Admin Button** (Header)

   - Sichtbar nur für User mit `role: "ADMIN"`
   - Gradient-Design (Purple → Pink)
   - Direkter Link zur Coming Soon Page
   - Hover-Effekte mit Shadow

3. **API Route** (`/api/admin/coming-soon`)

   - GET: Lädt Coming Soon Daten
   - PUT: Aktualisiert Coming Soon Daten
   - NextAuth Session-basierte Authentifizierung
   - 403 Forbidden bei nicht-authorisierten Zugriffen

4. **Access Control Demo** (AccessControlDemo)
   - Zeigt User-Zugriffsrechte in 3D-Umgebung
   - Live-Status-Anzeige

---

## 🚀 Verwendung

### Admin-Zugriff einrichten

```sql
-- 1. User-Rolle auf ADMIN setzen
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-admin@email.com';
```

### Coming Soon Page öffnen

1. **Als Admin einloggen**
2. **"🚀 Coming Soon" Button** im Header klicken
3. Oder direkt: `http://localhost:3000/admin/coming-soon`

### Inhalte bearbeiten

1. Klick auf **"✏️ Bearbeiten"**
2. Vision-Text bearbeiten
3. Milestone-Status ändern (Dropdown)
4. Klick auf **"💾 Speichern"**

---

## 🔑 Admin Features Details

### Coming Soon Page

**Route:** `/admin/coming-soon`  
**Komponente:** `ComingSoonPage`  
**Zugriff:** Nur Admin

**Funktionen:**

- ✅ Vision bearbeiten
- ✅ Meilensteine-Status ändern
- ✅ Live-Präsentations-Info anzeigen
- ⏳ Features hinzufügen/löschen (TODO)
- ⏳ Neue Meilensteine erstellen (TODO)

**State:**

```typescript
interface ComingSoonData {
  vision: string;
  features: string[];
  milestones: Milestone[];
  upcomingFeatures: string[];
}
```

### Admin Button

**Komponente:** `AdminButton`  
**Location:** Header (nur für Admins sichtbar)

```tsx
import { AdminButton } from "@/features/admin/components";

// In Header:
<AdminButton />;
```

---

## 🛠️ API Endpoints

### GET `/api/admin/coming-soon`

**Auth:** Required (Admin)  
**Response:**

```json
{
  "vision": "Metal3DCore Platform revolutioniert...",
  "features": ["Feature 1", "Feature 2"],
  "milestones": [
    {
      "id": "1",
      "title": "Foundation",
      "description": "Next.js Setup...",
      "status": "completed",
      "date": "November 2025"
    }
  ],
  "upcomingFeatures": ["VR-Support", "NFT-Integration"]
}
```

### PUT `/api/admin/coming-soon`

**Auth:** Required (Admin)  
**Body:** Same structure as GET  
**Response:** Updated data

---

## 🎨 Design System

### Colors

- **Background:** Gradient (black → gray-900 → black)
- **Primary:** Red → Orange → Yellow
- **Sections:** Gray-800/50 mit Backdrop Blur

### Status Indicators

- ✅ **Completed:** Green (border-green-500)
- 🔄 **In Progress:** Blue (border-blue-500)
- 📅 **Planned:** Gray (border-gray-500)

---

## ✅ TODO

### Phase 1 - Basis (✅ Abgeschlossen)

- [x] Coming Soon Page Component
- [x] Admin Button Component
- [x] API Route (GET/PUT)
- [x] Zugriffskontrolle
- [x] Dokumentation

### Phase 2 - Erweiterung (⏳ In Planung)

- [ ] Features bearbeitbar machen
- [ ] Neue Meilensteine hinzufügen
- [ ] Meilensteine löschen
- [ ] Datenbank-Persistenz (Prisma Model)
- [ ] Markdown-Support

### Phase 3 - Advanced (📋 Geplant)

- [ ] Rich Text Editor
- [ ] Bild-Upload
- [ ] Versionierung / History
- [ ] Multi-Admin-Support
- [ ] Export als PDF

---

## 📊 Statistiken

**Version 2.0.0:**

- **Komponenten:** 3 (AdminButton, ComingSoonPage, AccessControlDemo)
- **API Routes:** 1 (/api/admin/coming-soon)
- **Page Routes:** 1 (/admin/coming-soon)
- **Code-Zeilen:** ~400
- **Dependencies:** 0 neue (nutzt bestehende)

---

## 🔐 Sicherheit

### Client-Side Protection

```typescript
// useSession() prüft User-Role
if (!session || session.user.role !== "ADMIN") {
  router.push("/");
  return;
}
```

### Server-Side Protection

```typescript
// getServerSession() in API Route
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

---

## 📝 Changelog

### Version 2.0.0 (6. Dezember 2025)

- ✅ Coming Soon Page vollständig implementiert
- ✅ Admin Button im Header integriert
- ✅ API Route für GET/PUT erstellt
- ✅ Dokumentation aktualisiert
- ✅ TypeScript-Fehler behoben
- ✅ Build erfolgreich getestet

### Version 1.0.0 (November 2025)

- ✅ Initial Module Setup
- ✅ AccessControlDemo Component

---

## 👨‍💻 Entwickler-Notizen

### Bekannte Limitationen

1. **In-Memory Storage** - Daten gehen bei Neustart verloren
2. **Features nicht editierbar** - Nur Vision & Milestone-Status
3. **Keine Versionierung** - Kein Change-Tracking

### Performance

- Initial Load: ~50ms
- Save Operation: ~20ms
- Page Size: ~4KB (gzipped)

---

**Entwickelt für:** Metal3DCore Platform (M3DC)  
**Präsentation:** 14. Februar 2025  
**GitHub:** https://github.com/steffenvolbeat/Test_3DFinal_Projekt-Fullstack
