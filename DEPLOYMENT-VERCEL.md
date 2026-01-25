# 🚀 METAL3DCORE-PLATTFORM Vercel Deployment Guide

## 📋 Übersicht

Diese Anleitung führt dich durch den kompletten Deployment-Prozess der METAL3DCORE-Plattform auf Vercel.com mit PostgreSQL-Datenbank und Stripe-Integration.

### 🎯 Was wird deployed:

- **Frontend**: Next.js 15.5.9 App mit React 19
- **Backend**: API Routes mit NextAuth.js Authentication
- **Datenbank**: PostgreSQL via Vercel Postgres (oder Neon DB)
- **Payments**: Stripe Integration (Test & Production Mode)
- **3D Features**: React Three Fiber Komponenten
- **File Uploads**: Öffentliche Assets via Vercel

---

## 🛠 Voraussetzungen

### 1. Accounts erstellen

- ✅ **Vercel Account**: [vercel.com](https://vercel.com)
- ✅ **GitHub Repository**: Push dein Projekt zu GitHub
- ✅ **Stripe Account**: [stripe.com](https://stripe.com) (bereits vorhanden)
- ✅ **Vercel Postgres** oder **Neon DB** für die Datenbank

### 2. Lokale Vorbereitung

```bash
# 1. Stelle sicher, dass alles committed ist
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main

# 2. Production Build testen
npm run build
npm run start

# 3. Dependencies prüfen
npm audit fix
```

---

## 🗄 1. Datenbank Setup (Vercel Postgres)

### Option A: Vercel Postgres (Empfohlen)

1. **Gehe zu deinem Vercel Dashboard**
   - Wähle dein Projekt oder erstelle eins
   - Gehe zu `Storage` → `Create Database`
   - Wähle `Postgres` → `Continue`

2. **Database Setup**

   ```
   Database Name: metal3dcore-prod
   Region: Frankfurt, Germany (fra1) - für niedrige Latenz
   ```

3. **Verbindungs-URLs kopieren**
   - `POSTGRES_PRISMA_URL` (für Prisma Client)
   - `POSTGRES_PRISMA_URL_NON_POOLING` (für Migrations)
   - `POSTGRES_URL` (direkter Zugang)

### Option B: Neon DB (Alternative)

1. **Neon Account erstellen**: [neon.tech](https://neon.tech)
2. **Neue Datenbank erstellen**
   ```
   Project Name: metal3dcore-production
   Database: metal3dcore_prod
   Region: Europe (Frankfurt)
   ```

---

## ⚙️ 2. Environment Variables Setup

### 2.1 Vercel Environment Variables hinzufügen

Gehe zu deinem Vercel Projekt → `Settings` → `Environment Variables`

#### 🔐 Database & Auth

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/metal3dcore_prod?sslmode=require
SHADOW_DATABASE_URL=postgresql://username:password@host:5432/metal3dcore_prod?sslmode=require

# NextAuth
NEXTAUTH_URL=https://dein-projekt.vercel.app
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxx
```

**⚠️ NEXTAUTH_SECRET generieren:**

```bash
openssl rand -base64 32
```

#### 💳 Stripe Configuration

**Test Mode (für Staging):**

```env
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_MODE=test
```

**Production Mode (für Live):**

```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_MODE=live
```

#### 🌍 Runtime Environment

```env
NODE_ENV=production
```

### 2.2 Stripe Webhook Setup

1. **Stripe Dashboard** → `Developers` → `Webhooks`
2. **Add endpoint**: `https://dein-projekt.vercel.app/api/webhooks/stripe`
3. **Events auswählen**:
   ```
   checkout.session.completed
   payment_intent.succeeded
   payment_intent.payment_failed
   invoice.payment_succeeded
   customer.subscription.updated
   ```
4. **Webhook Secret kopieren** → `STRIPE_WEBHOOK_SECRET`

---

## 🚀 3. Vercel Deployment

### 3.1 GitHub Integration

1. **Vercel Dashboard** → `New Project`
2. **Import Git Repository** → Dein GitHub Repository wählen
3. **Configure Project**:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: next build
   Output Directory: .next (automatisch)
   Install Command: npm install
   ```

### 3.2 Build Settings optimieren

**Erstelle `vercel.json` im Root:**

```json
{
  "buildCommand": "next build",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["fra1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3.3 Advanced Build Configuration

**`next.config.ts` erweitern:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {},
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  // Optimierungen für Vercel
  images: {
    domains: ["localhost", "vercel.app"],
    formats: ["image/avif", "image/webp"],
  },
  // Webpack Optimierungen für 3D Components
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

---

## 🔄 4. Prisma Migration auf Production

### 4.1 Migration Scripts erstellen

**Erstelle `scripts/deploy-db.sh`:**

```bash
#!/bin/bash
echo "🔄 Starting database deployment..."

# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to production database
npx prisma db push --accept-data-loss

# 3. Seed database if needed
npx prisma db seed

echo "✅ Database deployment complete!"
```

### 4.2 Vercel Build Hook für DB

**In `package.json` Scripts erweitern:**

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "postbuild": "npx prisma generate",
    "db:deploy": "npx prisma db push",
    "db:seed": "npx prisma db seed"
  }
}
```

### 4.3 Prisma Schema Production-ready machen

**`prisma/schema.prisma` prüfen:**

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

---

## 🔧 5. Production Optimierungen

### 5.1 Error Handling erweitern

**`src/lib/error-handling.ts` erstellen:**

```typescript
import { NextResponse } from "next/server";

export function handleDeploymentError(error: unknown, context: string) {
  console.error(`[${context}] Production Error:`, error);

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
}
```

### 5.2 Performance Monitoring

**`src/lib/monitoring.ts` erstellen:**

```typescript
export function trackDeploymentMetrics(action: string, duration: number) {
  if (process.env.NODE_ENV === "production") {
    console.log(`[METRICS] ${action}: ${duration}ms`);
    // Hier kannst du Analytics Services integrieren
  }
}
```

### 5.3 CDN Optimierung für 3D Assets

**`public/` Struktur optimieren:**

```
public/
├── gallery/          # Komprimierte Bilder
├── models/          # 3D Models (optimiert)
├── textures/        # Komprimierte Texturen
└── icons/           # SVG Icons
```

---

## 🌐 6. Domain & SSL Setup

### 6.1 Custom Domain

1. **Vercel Dashboard** → `Settings` → `Domains`
2. **Add Domain**: `metal3d-platform.com`
3. **DNS Setup** bei deinem Provider:

   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 6.2 SSL & Security Headers

Vercel aktiviert automatisch SSL. **Security Headers prüfen:**

```typescript
// next.config.ts bereits optimiert (siehe oben)
```

---

## 📊 7. Monitoring & Logging

### 7.1 Vercel Analytics aktivieren

1. **Vercel Dashboard** → `Analytics` → `Enable`
2. **Package installieren:**

   ```bash
   npm install @vercel/analytics
   ```

3. **`src/app/layout.tsx` erweitern:**

   ```tsx
   import { Analytics } from "@vercel/analytics/react";

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### 7.2 Error Tracking

**Sentry Integration (optional):**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🧪 8. Deployment Verification

### 8.1 Pre-Deployment Checklist

- [ ] ✅ Alle Environment Variables gesetzt
- [ ] ✅ Database Connection erfolgreich
- [ ] ✅ Stripe Webhooks konfiguriert
- [ ] ✅ Build lokal erfolgreich (`npm run build`)
- [ ] ✅ Tests bestanden (`npm test`)
- [ ] ✅ Git Repository aktuell

### 8.2 Post-Deployment Tests

**Automatische Tests nach Deployment:**

```bash
# API Health Check
curl https://dein-projekt.vercel.app/api/health

# Database Connection Test
curl https://dein-projekt.vercel.app/api/db-status

# Stripe Integration Test
curl https://dein-projekt.vercel.app/api/stripe-status
```

### 8.3 Manual Testing

1. **🔐 Authentication Flow**
   - Registration funktional
   - Login/Logout erfolgreich
   - Session persistence

2. **💳 Stripe Integration**
   - Ticket Purchase Flow
   - Webhook Verarbeitung
   - Payment Status Updates

3. **🎮 3D Features**
   - Band Gallery lädt
   - 3D Models rendern
   - Performance acceptable

---

## 🚨 9. Troubleshooting

### Häufige Deployment Fehler

#### 9.1 Database Connection Issues

```
Error: Can't reach database server
```

**Lösung:**

- Environment Variables prüfen
- Database URL Format: `postgresql://user:pass@host:5432/db?sslmode=require`
- IP Restrictions in Database Provider prüfen

#### 9.2 Prisma Client Generation

```
Error: Prisma Client not found
```

**Lösung:**

```bash
# In package.json postbuild script
"postbuild": "npx prisma generate"
```

#### 9.3 Stripe Webhook 401/403

```
Webhook signature verification failed
```

**Lösung:**

- `STRIPE_WEBHOOK_SECRET` korrekt gesetzt
- Endpoint URL: `https://domain.com/api/webhooks/stripe`
- Content-Type: `application/json`

#### 9.4 Build Memory Issues

```
JavaScript heap out of memory
```

**Lösung in `package.json`:**

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
  }
}
```

### 9.5 Debug Commands

```bash
# Vercel Logs checken
vercel logs your-project-url

# Local Production Build
npm run build && npm run start

# Database Connection Test
npx prisma db pull --preview-feature
```

---

## 🔄 10. CI/CD & Updates

### 10.1 Automatic Deployments

**Vercel** deployed automatisch bei:

- ✅ Push zu `main` branch → Production
- ✅ Push zu `develop` branch → Preview
- ✅ Pull Requests → Preview Deployments

### 10.2 Deployment Branches

```bash
# Production Deployment
git checkout main
git merge develop
git push origin main

# Preview Deployment
git checkout develop
git push origin develop
```

### 10.3 Database Schema Updates

```bash
# 1. Lokale Änderungen
npx prisma db push

# 2. Migration erstellen
npx prisma migrate dev --name feature-update

# 3. Production Update
# (Automatisch durch postbuild script)
```

---

## 📈 11. Performance Optimization

### 11.1 Next.js Optimierungen

**Bundle Analyzer:**

```bash
npm install --save-dev @next/bundle-analyzer
```

**`next.config.ts` erweitern:**

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

### 11.2 Database Optimierung

**Connection Pooling** (automatisch bei Vercel Postgres)
**Query Optimierung** in Prisma:

```typescript
// Efficient queries with select
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
  where: { active: true },
});
```

---

## 🎯 12. Go-Live Checklist

### Pre-Launch

- [ ] ✅ Domain DNS propagated (24-48h)
- [ ] ✅ SSL Certificate active
- [ ] ✅ All environment variables production-ready
- [ ] ✅ Stripe Live Mode activated
- [ ] ✅ Database backups configured
- [ ] ✅ Error monitoring active

### Launch Day

- [ ] ✅ Deployment successful
- [ ] ✅ Health checks passing
- [ ] ✅ Analytics tracking
- [ ] ✅ Performance metrics baseline
- [ ] ✅ Support documentation ready

### Post-Launch

- [ ] ✅ Monitor logs for 24h
- [ ] ✅ User acceptance testing
- [ ] ✅ Performance optimization
- [ ] ✅ Feedback collection

---

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Prisma Production**: [prisma.io/docs/guides/deployment](https://prisma.io/docs/guides/deployment)
- **Stripe Integration**: [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)

---

## 🎉 Deployment Commands Summary

```bash
# 1. Final Preparation
git add .
git commit -m "Production deployment ready"
git push origin main

# 2. Database Deploy (nach Vercel Deployment)
npx prisma db push
npx prisma db seed

# 3. Verify Deployment
curl https://dein-projekt.vercel.app/api/health

# 4. Monitor
vercel logs dein-projekt-url --follow
```

---

**🚀 Viel Erfolg mit dem Deployment der METAL3DCORE-PLATTFORM! 🎸**

Bei Problemen: Logs checken, Environment Variables prüfen, und die Troubleshooting Section konsultieren.
