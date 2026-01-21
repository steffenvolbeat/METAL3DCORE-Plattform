# 🔐 Auth Feature Module

Dieses Modul enthält alle Authentication & Authorization Funktionalitäten der Metal3DCore Platform.

## 📂 Struktur

```
auth/
├── components/          # React Components
│   ├── AuthModal.tsx
│   ├── LoginForm.tsx
│   ├── SignUpForm.tsx
│   ├── EnhancedRegistrationForm.tsx
│   ├── UserStatus.tsx
│   ├── UserDashboard.tsx
│   └── index.ts        # Barrel Export
├── hooks/              # Custom Hooks
│   ├── useAuth.ts
│   └── useSession.ts
├── services/           # API Services
│   └── authService.ts
├── types/              # TypeScript Types
│   └── auth.types.ts
└── utils/              # Utility Functions
    └── validation.ts
```

## 🎯 Verwendung

```tsx
import { AuthModal, LoginForm, UserStatus } from "@/features/auth/components";
import { useAuth } from "@/features/auth/hooks";
```

## ✅ TODO

- [ ] Erstelle useAuth Hook
- [ ] Erstelle useSession Hook
- [ ] Extrahiere authService
- [ ] Definiere auth.types.ts
- [ ] Erstelle validation utils
