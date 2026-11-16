# 🚀 Free Hosting & Deployment Guide for YOOBIC ONE

This guide outlines how to host the complete **YOOBIC ONE** platform (Web Admin, Backend API, Database, and Mobile Application) **100% free** using standard free tiers, trials, and developer tools.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    subgraph Frontend ["Frontends (Free Tier)"]
        WebAdmin["Admin Portal (Next.js 14)<br/>Hosted on Vercel"]
        MobileAPK["Mobile App (.apk)<br/>Built on EAS Free Tier"]
        MobilePWA["Mobile Web / PWA<br/>Hosted on Vercel / Cloudflare"]
    end

    subgraph BackendServices ["Backend & DB (Free Tier)"]
        BackendAPI["Node.js / Express API<br/>Render.com / Railway / Koyeb"]
        Database["PostgreSQL Database<br/>Neon.tech / Supabase (0.5GB Free)"]
    end

    WebAdmin -->|REST / JSON| BackendAPI
    MobileAPK -->|REST / Offline Sync| BackendAPI
    MobilePWA -->|REST / Offline Sync| BackendAPI
    BackendAPI --> Database
```

---

## 1. Web Administration Portal (`apps/admin-web`)
**Recommended Platform**: **Vercel** (Forever Free Hobby Tier)

### Why Vercel?
* Built by the creators of Next.js: zero-configuration deployment.
* Automatic CI/CD: every push to GitHub triggers automatic build and preview/production deployment.
* Free custom domain with automatic SSL (HTTPS).

### Step-by-Step Deployment:
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Import your repository: `mounirhsairi/YOOBIC_ONE`.
4. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/admin-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-app.onrender.com` (from Step 2)
6. Click **Deploy**. Your Admin Portal is live at `https://yoobic-one-admin.vercel.app`!

---

## 2. Backend REST API (`apps/backend`)
**Recommended Platform**: **Render.com** (Free Web Service) or **Railway.app** (Free Trial Credit)

### Option A: Render.com (100% Free Forever)
Render provides free web services for Node.js applications with free automatic SSL.

1. Sign up at [render.com](https://render.com) using GitHub.
2. Click **"New +"** > **"Web Service"**.
3. Select `mounirhsairi/YOOBIC_ONE`.
4. Configure:
   - **Name**: `yoobic-backend`
   - **Region**: Frankfurt / Oregon (closest to you)
   - **Branch**: `main`
   - **Root Directory**: leave blank or `apps/backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run --workspace=@yoobic/backend build`
   - **Start Command**: `npm run --workspace=@yoobic/backend start`
   - **Instance Type**: **Free** (512 MB RAM, 0.1 CPU)
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `JWT_SECRET`: `your-secure-jwt-secret-key-32-chars`
   - `CORS_ORIGIN`: `https://your-admin.vercel.app` (or `*`)
   - `DATABASE_URL`: Your free Neon/Supabase Postgres connection string (see Step 3)
6. Click **Create Web Service**. Your API will be live at `https://yoobic-backend.onrender.com`.

> [!NOTE]
> On the free tier, Render spins down after 15 minutes of inactivity and takes ~30-50 seconds to wake up on the first request. You can use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping `https://your-backend.onrender.com/health` every 10 minutes to keep it active 24/7.

---

## 3. Production Database (PostgreSQL)
**Recommended Platform**: **Neon.tech** or **Supabase** (Free Tier)

While the local development uses SQLite, for multi-user cloud hosting, a cloud PostgreSQL instance is recommended.

### Neon.tech (Fastest & 100% Free):
1. Sign up at [neon.tech](https://neon.tech).
2. Create a project named `yoobic-one`.
3. Copy the **Connection String** (`postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require`).
4. Paste it as `DATABASE_URL` in your Render backend environment variables.
5. In Sequelize/Backend, our database adapter automatically recognizes `DATABASE_URL` and connects via PostgreSQL.

---

## 4. Mobile Application (`apps/mobile`)
You have two great free options to share and test the mobile app:

### Option A: EAS Build — Generate a Free Standalone Android APK
EAS (Expo Application Services) gives you **30 free cloud builds per month**. You can generate an `.apk` file that anyone can install directly on Android phones without needing Expo Go or a local development PC!

1. Install EAS CLI globally on your PC:
   ```bash
   npm install -g eas-cli
   ```
2. Log into your free Expo account:
   ```bash
   eas login
   ```
3. Inside `c:\YOOBIC_ONE\apps\mobile`, configure EAS:
   ```bash
   eas build:configure
   ```
4. Update `eas.json` to enable APK builds:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         },
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-backend-app.onrender.com"
         }
       }
     }
   }
   ```
5. Trigger the cloud build:
   ```bash
   eas build --platform android --profile preview
   ```
6. When finished (~8-10 minutes), Expo gives you a **direct download link & QR code** for the `.apk`. Send this link to anyone to install on their phone!

---

### Option B: Deploy Mobile as a Web App / PWA on Vercel (Instant & Free)
Expo supports compiling the mobile interface into a Progressive Web App (PWA) with native mobile touch styling.

1. Build mobile web assets:
   ```bash
   cd apps/mobile
   npx expo export -p web
   ```
2. Deploy the generated `dist/` directory directly to Vercel or Netlify.
3. Users can open the URL on mobile Safari or Chrome and tap **"Add to Home Screen"** to use it like an installed app.

---

## 5. Cost Summary Table

| Component | Platform | Free Tier Limits | Cost |
|---|---|---|---|
| **Admin Portal** | Vercel | 100GB bandwidth, unlimited builds | **$0 / month** |
| **Backend API** | Render.com | 750 free hours/month (24/7 with 1 service) | **$0 / month** |
| **Database** | Neon.tech / Supabase | 0.5 GB storage, serverless compute | **$0 / month** |
| **Mobile App (APK)** | Expo EAS Build | 30 Android builds / month | **$0 / month** |
| **Mobile Web (PWA)** | Vercel | Included with Hobby plan | **$0 / month** |
| **Total** | | | **$0.00** |

---

## 🏁 Recommended Deployment Order:
1. **Neon.tech** → Create database & get connection string.
2. **Render.com** → Deploy Backend with the database URL.
3. **Vercel** → Deploy Admin Web pointing to Render backend URL.
4. **EAS Build** → Build Android APK pointing to Render backend URL.
