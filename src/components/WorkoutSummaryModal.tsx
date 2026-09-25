'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';

interface WorkoutSummaryModalProps {
  log: WorkoutLog;
  activeUser?: UserProfile;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  log,
  activeUser,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    const updatePortalTarget = () => {
      const isMobile = window.innerWidth <= 640;
      const container = isMobile
        ? document.body
        : document.querySelector('.app-container') || document.body;
      setPortalTarget(container);
    };

    updatePortalTarget();
    window.addEventListener('resize', updatePortalTarget);
    return () => window.removeEventListener('resize', updatePortalTarget);
  }, []);

  useEffect(() => {
    let myConfetti: confetti.CreateTypes | null = null;

    if (canvasRef.current) {
      try {
        myConfetti = confetti.create(canvasRef.current, {
          resize: true,
          useWorker: false,
        });
      } catch {
        myConfetti = null;
      }
    }

    const fire = (opts: confetti.Options) => {
      try {
        if (myConfetti) {
          myConfetti({
            zIndex: 99999,
            ...opts,
          });
        } else {
          confetti({
            zIndex: 99999,
            ...opts,
          });
        }
      } catch {
        // ignore
      }
    };

    // Trigger celebratory poppers directly on this modal
    const frameId = requestAnimationFrame(() => {
      // 1. Initial burst around center
      fire({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.5, y: 0.45 },
        colors: ['#30d158', '#e4e4e7', '#0a84ff', '#ff9f0a', '#ffd700'],
      });

      // 2. Dual cannon pops from sides
      const timeout1 = setTimeout(() => {
        fire({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.7 },
          colors: ['#30d158', '#0a84ff', '#ff9f0a', '#ffd700'],
        });
        fire({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.7 },
          colors: ['#30d158', '#0a84ff', '#ff9f0a', '#ffd700'],
        });
      }, 250);

      // 3. Gentle golden shower
      const timeout2 = setTimeout(() => {
        fire({
          particleCount: 40,
          spread: 90,
          origin: { x: 0.5, y: 0.2 },
          colors: ['#ffd700', '#ffb703', '#ffffff'],
          gravity: 0.8,
          scalar: 0.9,
        });
      }, 500);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (myConfetti) {
        try {
          myConfetti.reset();
        } catch {
          // ignore
        }
      }
    };
  }, [portalTarget]);

  const formattedDate = log.createdAt
    ? new Date(log.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const modalContent = (
    <div
      className="summary-backdrop animate-fade-in"
      style={{ position: portalTarget === document.body ? 'fixed' : 'absolute' }}
      onClick={onClose}
    >
      {/* Celebration Popper Canvas on the Modal */}
      <canvas ref={canvasRef} className="confetti-canvas" />

      <div className="summary-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="trophy-badge">
          <Trophy size={46} className="trophy-icon" />
        </div>

        <h1 className="summary-title">Crushed It!</h1>
        <p className="summary-subtitle">{log.workoutTitle}</p>
        <span className="summary-date">{formattedDate}</span>

        {/* Duration Stat */}
        <span className="duration-val">{log.durationMinutes}m</span>

        {/* Done Action */}
        <button className="btn-primary-pill finish-btn" onClick={onClose}>
          <span>Go to Home</span>
        </button>
      </div>

      <style jsx>{`
        .summary-backdrop {
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }

        .confetti-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 25;
        }

        .summary-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 380px;
          background: #141418;
          border: 1px solid var(--border-active);
          border-radius: 28px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95);
        }

        .trophy-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        :global(.trophy-icon) {
          color: #ffdf00;
        }

        .summary-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #e4e4e7;
          margin-bottom: 10px;
        }

        .summary-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .summary-date {
          display: inline-block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .duration-val {
          display: inline-block;
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 800;
          color: #e4e4e7;
          margin-bottom: 28px;
          letter-spacing: -0.02em;
        }

        .finish-btn {
          width: 100%;
          box-shadow: none !important;
        }

        .finish-btn:hover {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );

  if (portalTarget) {
    return createPortal(modalContent, portalTarget);
  }

  return modalContent;
};
