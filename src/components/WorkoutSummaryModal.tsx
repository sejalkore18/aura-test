'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';
import '@/styles/WorkoutSummaryModal.css';

interface WorkoutSummaryModalProps {
  log: WorkoutLog;
  activeUser?: UserProfile;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  log,
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
    </div>
  );

  if (portalTarget) {
    return createPortal(modalContent, portalTarget);
  }

  return modalContent;
};
