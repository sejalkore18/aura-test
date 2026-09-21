'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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
        position: 'absolute',
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
            <span className="status-text">INITIALIZING</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .splash-backdrop {
          position: absolute;
          inset: 0;
          z-index: 9999;
          background-color: #08080a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
          transition:
            opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            filter 0.4s ease;
        }

        .splash-backdrop.exiting {
          opacity: 0;
          transform: scale(1.03);
          filter: blur(4px);
          pointer-events: none;
        }

        /* Center Content Group */
        .splash-center {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: contentEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Emblem wrapper */
        .emblem-wrapper {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .emblem-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .ring-outer {
          inset: -10px;
          border: 1px solid transparent;
          border-top-color: rgba(0, 229, 255, 0.4);
          border-right-color: rgba(168, 85, 247, 0.35);
          animation: rotateClockwise 14s linear infinite;
        }

        .ring-inner {
          inset: -3px;
          border: 1px solid transparent;
          border-bottom-color: rgba(217, 70, 239, 0.4);
          border-left-color: rgba(56, 189, 248, 0.3);
          animation: rotateCounter 10s linear infinite;
        }

        .emblem-card {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(18, 18, 24, 0.88) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 16px 36px -8px rgba(0, 210, 255, 0.22),
            0 0 24px rgba(168, 85, 247, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(16px);
          animation: emblemFloat 3s ease-in-out infinite alternate;
        }

        :global(.splash-logo-img) {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 14px rgba(0, 210, 255, 0.4)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.3));
          animation: logoSheen 2.5s ease-in-out infinite;
        }

        /* Typography */
        .text-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 38px;
        }

        .brand-title {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 2.3rem;
          font-weight: 800;
          letter-spacing: 0.28em;
          margin-right: -0.28em; /* Offset trailing letter-spacing */
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 35%, #93c5fd 65%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
        }

        .brand-tagline {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.24em;
          margin-right: -0.24em;
          color: #94a3b8;
          text-transform: uppercase;
        }

        /* Cosmic Spectrum Loader */
        .loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 140px;
        }

        .progress-track {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00e5ff 0%, #38bdf8 35%, #818cf8 70%, #c084fc 100%);
          border-radius: 9999px;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.8), 0 0 20px rgba(168, 85, 247, 0.5);
          transition: width 0.08s ease-out;
        }

        .loader-status {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .status-text {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #64748b;
        }

        /* Keyframe animations */
        @keyframes contentEntrance {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes floatGlowOne {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate(-46%, -53%) scale(1.15);
          }
        }

        @keyframes floatGlowTwo {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0.95;
            transform: translate(-54%, -47%) scale(0.9);
          }
        }

        @keyframes emblemFloat {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-4px);
          }
        }

        @keyframes rotateClockwise {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateCounter {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes glowPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes logoSheen {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(0, 210, 255, 0.4)) drop-shadow(0 0 18px rgba(168, 85, 247, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(0, 210, 255, 0.65)) drop-shadow(0 0 26px rgba(168, 85, 247, 0.5));
          }
        }

        @keyframes dotBlink {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }
      `}</style>
    </div>
  );
};
