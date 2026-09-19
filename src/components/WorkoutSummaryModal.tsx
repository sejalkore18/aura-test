'use client';

import React, { useEffect } from 'react';
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
  useEffect(() => {
    // Fire festive celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#30d158', '#e4e4e7', '#0a84ff', '#ff9f0a'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="summary-backdrop animate-fade-in" onClick={onClose}>
      <div className="summary-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="trophy-badge">
          <Trophy size={46} className="trophy-icon" />
        </div>

        <h1 className="summary-title">Crushed It!</h1>
        <p className="summary-subtitle">{log.routineTitle}</p>
        <span className="summary-date">{log.date}</span>

        {/* Duration Stat */}
        <span className="duration-val">{log.durationMinutes}m</span>

        {/* Done Action */}
        <button className="btn-primary-pill finish-btn" onClick={onClose}>
          <span>Go to Home</span>
        </button>
      </div>

      <style jsx>{`
        .summary-backdrop {
          position: fixed;
          inset: 0;
          z-index: 210;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .summary-card {
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
};
