# ⚡ Aura Health

<p align="center">
  <strong>Smart, elegant, mobile-first workout tracking & routine management.</strong>
  <br />
  Built with Next.js 16, React 19, TypeScript, Vanilla CSS, and MongoDB Atlas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-20232a?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/PWA-Ready-f05032?style=for-the-badge&logo=pwa" alt="PWA Ready" />
</p>

---

## 📖 Overview

**Aura** is a modern, high-performance fitness web application and Progressive Web App (PWA) designed to replace clunky gym notebooks and ad-cluttered tracking apps. Inspired by sleek mobile experiences, Aura provides real-time set logging, rich looping 3D exercise demonstrations and  workload-based calorie burnt calculations.

With a cosmic dark design system optimized for OLED mobile displays, Aura works seamlessly on any mobile phone as an installed PWA or on desktop via a centered mobile preview frame.

---

## ✨ Key Features

### 🏋️‍♂️ 1. Active Workout Player
- **Set-by-Set Logging**: Track target vs. actual reps and weights with one-tap completion toggles..
- **Workout Completion**: Celebratory confetti animation (`canvas-confetti`) with instant transition to a comprehensive performance summary.

### 📅 2. Interactive Calendar & Routine Scheduler
- **Weekly Glance Strip**: Dynamic horizontal date selector showing completion badges, today's indicators, and workout tags.
- **Month Calendar Modal**: Full monthly view for reviewing past workout consistency, active streaks, and rest days.

### 🎥 3. High-Definition Exercise Library
- **3D Looping Video Guides**: Embedded high-resolution demonstration loops for all major lifts and accessory exercises.
- **Comprehensive Database**: Exercises cataloged across **Chest**, **Triceps**, **Back**, **Biceps**, **Legs**, **Shoulders**, **Core**, and **Full-Body**.
- **Detailed Form Coaching**: Step-by-step instructions ("How To"), pro tips, target muscle breakdowns (primary and secondary), and equipment requirements.
- **Search & Category Filtering**: Instantly search movements or filter by target muscle group.

### 👥 4. Multi-User Profile Isolation
- **Sejal & Bhaumik Profiles**: Quick user-switching from the dashboard and profile views.

### 📊 5. Scientific Calorie & Volume Analytics
- **Workload-Based Burn Engine**: Calculates caloric expenditure using actual lifted volume, weight multipliers, and rep volume rather than blunt duration guesses.
- **Lifetime Tonnage & Stats**: Tracks lifetime volume lifted (kg), total workouts finished, unique attendance days, and consistency metrics.
- **Attendance Filtering**: Review workout volume and frequency filtered by **This Month**, **Past Month**, or **Lifetime**.

### 📱 6. Local-First Architecture with Cloud Sync
- **Instant Offline Access**: Every action writes to `localStorage` immediately for zero latency at the gym, even with poor cellular reception.
- **MongoDB Atlas Cloud Sync**: Automatically persists and fetches updates via Next.js server API routes in the background.
- **Swipe-to-Delete History**: Interactive touch gestures on past workout cards for effortless log cleanup.

### 📱 7. Installable PWA & Cosmic Aesthetics
- **Install on iOS & Android**: Configured with a web app manifest, maskable app icons, and standalone viewport settings.

---

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | [Next.js 16 (Turbopack, App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | Modular Vanilla CSS (Design Tokens, Glassmorphism, CSS Modules) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Runtime / Package Manager** | [Bun](https://bun.sh/) / [npm](https://www.npmjs.com/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+) or [Bun](https://bun.sh/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection URI

### 1. Clone the Repository

```bash
git clone https://github.com/sejalkore18/aura-test.git
cd aura-test
```

### 2. Install Dependencies

Using **Bun**:
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your MongoDB connection string:

```env
MONGODB_URI=
```

### 4. Run the Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile Installation (PWA)

Aura is built to feel like a native mobile app on your phone:

### iOS (Safari)
1. Open the deployed application URL in **Safari**.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Launch **Aura** directly from your home screen for full-screen immersive tracking.

### Android (Chrome)
1. Open the application URL in **Google Chrome**.
2. Tap the three-dot menu icon in the top right.
3. Select **Install app** or **Add to Home screen**.
4. Launch **Aura** from your app drawer.

---

## 🧪 Build & Verification

To verify TypeScript types and generate an optimized production bundle:

```bash
bun run build
# or
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
