'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Layers, Flame, CheckCircle, ArrowRight } from 'lucide-react';
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
          <Trophy size={36} className="trophy-icon" />
        </div>

        <h1 className="summary-title">
          {activeUser ? `${activeUser.name} Crushed It!` : 'Workout Crushed!'}
        </h1>
        <p className="summary-subtitle">{log.routineTitle}</p>
        <span className="summary-date">{log.date}</span>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon-wrapper">
              <Clock size={16} />
            </div>
            <span className="stat-val">{log.durationMinutes}m</span>
            <span className="stat-lbl">Duration</span>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper">
              <Layers size={16} />
            </div>
            <span className="stat-val">{log.totalSets}</span>
            <span className="stat-lbl">Sets Done</span>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper">
              <CheckCircle size={16} />
            </div>
            <span className="stat-val">{log.totalReps}</span>
            <span className="stat-lbl">Total Reps</span>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper">
              <Flame size={16} />
            </div>
            <span className="stat-val">{Math.round(log.totalVolumeKg)}</span>
            <span className="stat-lbl">Volume (kg)</span>
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="breakdown-section">
          <h2 className="breakdown-title">Completed Exercises</h2>
          <div className="breakdown-list">
            {log.completedExercises.map((ex, index) => (
              <div key={index} className="breakdown-item">
                <span className="item-name">{ex.name}</span>
                <span className="item-sets">{ex.sets.length} sets logged</span>
              </div>
            ))}
          </div>
        </div>

        {/* Done Action */}
        <button className="btn-primary-pill finish-btn" onClick={onClose}>
          <span>Save & Return Home</span>
          <ArrowRight size={18} />
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
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 0 28px rgba(255, 255, 255, 0.2);
        }

        :global(.trophy-icon) {
          color: #ffdf00;
          filter: drop-shadow(0 0 10px rgba(255, 223, 0, 0.6));
        }

        .summary-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #e4e4e7;
          margin-bottom: 4px;
        }

        .summary-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .summary-date {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          margin-bottom: 20px;
        }

        .stat-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-icon-wrapper {
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .stat-val {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: #e4e4e7;
        }

        .stat-lbl {
          font-size: 0.72rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .breakdown-section {
          width: 100%;
          margin-bottom: 24px;
          text-align: left;
        }

        .breakdown-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 120px;
          overflow-y: auto;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
        }

        .item-name {
          color: #e4e4e7;
          font-weight: 500;
        }

        .item-sets {
          color: var(--accent-green);
          font-weight: 600;
        }

        .finish-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
