'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, Plus, SkipForward, Timer } from 'lucide-react';

interface RestTimerModalProps {
  initialSeconds?: number;
  exerciseName: string;
  nextSetNumber: number;
  onComplete: () => void;
  onSkip: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  initialSeconds = 60,
  exerciseName,
  nextSetNumber,
  onComplete,
  onSkip,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;

    if (secondsRemaining <= 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, isPaused, onComplete]);

  const handleAdd30Seconds = () => {
    setSecondsRemaining((prev) => prev + 30);
    setTotalSeconds((prev) => prev + 30);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const progressPercent = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="rest-timer-overlay animate-fade-in">
      <div className="rest-timer-card">
        <div className="timer-header">
          <div className="timer-badge">
            <Timer size={14} />
            <span>REST PERIOD</span>
          </div>
          <h2 className="next-up-title">
            Next: Set {nextSetNumber} · {exerciseName}
          </h2>
        </div>

        {/* Circular Countdown Display */}
        <div className="circular-timer-wrapper">
          <svg className="timer-svg" width="220" height="220">
            {/* Background track circle */}
            <circle
              className="track-circle"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
              r={radius}
              cx="110"
              cy="110"
            />
            {/* Animated progress circle */}
            <circle
              className="progress-circle"
              stroke="#e4e4e7"
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="110"
              cy="110"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.9s linear',
              }}
            />
          </svg>

          <div className="timer-digits">
            <span className="time-string">{formattedTime}</span>
            <span className="time-label">{isPaused ? 'Paused' : 'Remaining'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="timer-controls">
          <button className="timer-action-btn" onClick={handleAdd30Seconds}>
            <Plus size={16} />
            <span>+30s</span>
          </button>

          <button className="timer-action-btn" onClick={togglePause}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>

        {/* Skip Rest Button */}
        <button className="btn-primary-pill skip-rest-btn" onClick={onSkip}>
          <SkipForward size={18} />
          <span>Skip Rest & Start Set {nextSetNumber}</span>
        </button>
      </div>

      <style jsx>{`
        .rest-timer-overlay {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 20px;
        }

        .rest-timer-card {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .timer-header {
          margin-bottom: 24px;
        }

        .timer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent-orange);
          margin-bottom: 8px;
        }

        .next-up-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #e4e4e7;
        }

        /* Circular SVG */
        .circular-timer-wrapper {
          position: relative;
          width: 220px;
          height: 220px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timer-svg {
          transform: rotate(-90deg);
        }

        .progress-circle {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
        }

        .timer-digits {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .time-string {
          font-family: var(--font-display);
          font-size: 3.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #e4e4e7;
        }

        .time-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-top: -4px;
        }

        /* Controls */
        .timer-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          width: 100%;
        }

        .timer-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-pill);
          color: #e4e4e7;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .timer-action-btn:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .skip-rest-btn {
          width: 100%;
          font-size: 0.95rem;
          padding: 16px 24px;
        }
      `}</style>
    </div>
  );
};
