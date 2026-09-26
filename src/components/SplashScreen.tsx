'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import '@/styles/SplashScreen.css';

interface SplashScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 1500,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar fill
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.max(1, (100 - prev) * 0.12);
        return Math.min(100, prev + step);
      });
    }, 20);

    // Trigger exit transition before unmounting
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(durationMs - 400, 800));

    // Full completion callback
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  // Allow clicking anywhere to skip immediately
  const handleDismiss = () => {
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 350);
    }
  };

  return (
    <div
      className={`splash-backdrop ${isExiting ? 'exiting' : ''}`}
      onClick={handleDismiss}
      role="status"
      aria-label="Loading Aura"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#08080a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Center brand presentation */}
      <div className="splash-center">
        {/* Aura Logo Emblem */}
        <div className="emblem-wrapper">
          <div className="emblem-ring ring-outer" />
          <div className="emblem-ring ring-inner" />
            <Image
              src="/logo-cosmic.png"
              alt="Aura Logo"
              width={52}
              height={52}
              priority
              className="splash-logo-img"
            />
        </div>

        {/* Wordmark and Tagline */}
        <div className="text-wrapper">
          <h1 className="brand-title">AURA</h1>
        </div>

        {/* Sleek Progress Indicator in Aura Cosmic Spectrum */}
        <div className="loader-wrapper">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="loader-status">
          </div>
        </div>
      </div>
    </div>
  );
};
