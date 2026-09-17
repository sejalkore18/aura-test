import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Fitness – Daily Workout & Set Tracker',
  description: 'Smart gym workout tracker inspired by FitnessAI with real exercise looping videos, sets, reps, weight logs, and rest timers.',
  keywords: ['fitness tracker', 'gym workout', 'sets and reps', 'chest press', 'push day', 'workout routine'],
  authors: [{ name: 'Aura Fitness' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#08080a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://app.fitnessai.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.prod.website-files.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
