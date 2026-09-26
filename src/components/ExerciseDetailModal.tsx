'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Sparkles, Dumbbell, ShieldCheck, Flame } from 'lucide-react';
import { Exercise } from '@/types/workout';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  onStartExerciseNow?: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
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

  // Lock background window and body scrolling while full-screen exercise guide is open
  useEffect(() => {
    window.scrollTo(0, 0);
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!portalTarget) return null;

  return createPortal(
    <div
      className="exercise-detail-page-view"
      role="dialog"
      aria-modal="true"
      aria-label={`${exercise.name} guide`}
      style={{ position: portalTarget === document.body ? 'fixed' : 'absolute' }}
    >
      {/* Universal Top AppBar */}
      <header className="page-header">
        <div className="left-slot">
          <button
            type="button"
            className="appbar-back-btn ghost-back"
            onClick={onClose}
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">Exercise Guide</h1>
        </div>

      </header>

      {/* Scrollable Page Body */}
      <div className="page-body">
        {/* Video Player */}
        <div className="video-player-wrapper">
          <video
            src={exercise.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="detail-video"
          />
        </div>

        {/* Title and Category Header */}
        <div className="exercise-header-block">
          <span className="category-tag">{exercise.category.toUpperCase()}</span>
          <h2 className="exercise-name">{exercise.name}</h2>
        </div>

        {/* Pro Tip Card (Modeled after FitnessAI) */}
        <div className="pro-tip-card">
          <div className="card-header">
            <Sparkles size={16} className="text-orange" />
            <span className="card-title">PRO TIP</span>
          </div>
          <p className="pro-tip-text">{exercise.proTip}</p>
        </div>

        {/* How To Steps */}
        <div className="section-block">
          <h3 className="section-title">
            <ShieldCheck size={16} />
            <span>How To Perform</span>
          </h3>
          <ol className="steps-list">
            {exercise.howTo.map((step, index) => (
              <li key={index} className="step-item">
                <span className="step-num">{index + 1}</span>
                <span className="step-desc">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Muscle Groups */}
        <div className="section-block">
          <h3 className="section-title">
            <Flame size={16} />
            <span>Targeted Muscle Groups</span>
          </h3>

          <div className="muscle-group-container">
            <div className="muscle-subgroup">
              <span className="subgroup-label">Primary:</span>
              <div className="muscle-tags">
                {exercise.primaryMuscles.map((muscle) => (
                  <span key={muscle} className="muscle-tag primary">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <div className="muscle-subgroup">
                <span className="subgroup-label">Secondary:</span>
                <div className="muscle-tags">
                  {exercise.secondaryMuscles.map((muscle) => (
                    <span key={muscle} className="muscle-tag secondary">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Equipment & Variations */}
        <div className="section-block">
          <h3 className="section-title">
            <Dumbbell size={16} />
            <span>Equipment & Variations</span>
          </h3>
          <div className="meta-info-row">
            <span className="meta-label">Equipment:</span>
            <span className="meta-value">{exercise.equipment}</span>
          </div>
          {exercise.variations && exercise.variations.length > 0 && (
            <div className="variations-container">
              <span className="meta-label">Alternatives:</span>
              <div className="variations-tags">
                {exercise.variations.map((v) => (
                  <span key={v} className="variation-pill">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Bottom Action Footer */}
      <footer className="page-footer">
        <button type="button" className="btn-action-primary" onClick={onClose}>
          <span>Done</span>
        </button>
      </footer>

      <style jsx>{`
        .exercise-detail-page-view {
          position: absolute;
          inset: 0;
          z-index: 10050;
          width: 100%;
          height: 100%;
          background: #08080a;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: pageSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pageSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 640px) {
          .exercise-detail-page-view {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            z-index: 10050 !important;
            overscroll-behavior: none !important;
          }
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 16px;
          background: rgba(8, 8, 10, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 70;
        }

        .left-slot {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .appbar-back-btn.ghost-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: #e4e4e7;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .appbar-back-btn.ghost-back:hover {
          background: transparent;
          transform: translateX(-3px);
          opacity: 0.8;
        }

        .appbar-back-btn.ghost-back:active {
          transform: scale(0.92) translateX(-3px);
          opacity: 0.65;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 1.08rem;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.015em;
          margin: 0;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .page-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .page-body::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .video-player-wrapper {
          position: relative;
          width: 100%;
          height: 250px;
          background: #000000;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .detail-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .exercise-header-block {
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .category-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #60a5fa;
          text-transform: uppercase;
        }

        .exercise-name {
          font-family: var(--font-display);
          font-size: 1.55rem;
          font-weight: 800;
          color: #e4e4e7;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
        }

        /* Pro Tip Card */
        .pro-tip-card {
          margin: 0 20px;
          background: rgba(255, 159, 10, 0.08);
          border: 1px solid rgba(255, 159, 10, 0.25);
          border-radius: var(--radius-md);
          padding: 14px 16px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .text-orange {
          color: var(--accent-orange);
        }

        .card-title {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--accent-orange);
        }

        .pro-tip-text {
          font-size: 0.88rem;
          line-height: 1.45;
          color: #e4e4e7;
          margin: 0;
        }

        /* Section Block */
        .section-block {
          margin: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #e4e4e7;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .steps-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 0;
          padding: 0;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #e4e4e7;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .step-desc {
          font-size: 0.86rem;
          line-height: 1.45;
          color: var(--text-secondary);
        }

        /* Muscle Group Tags */
        .muscle-group-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }

        .muscle-subgroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .subgroup-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .muscle-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .muscle-tag {
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .muscle-tag.primary {
          background: rgba(168, 85, 247, 0.08);
          color: #b8a7dc;
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .muscle-tag.secondary {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
        }

        .meta-info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
        }

        .meta-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .meta-value {
          color: #e4e4e7;
          font-weight: 600;
        }

        .variations-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 6px;
        }

        .variations-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .variation-pill {
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-pill);
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        /* Footer */
        .page-footer {
          position: relative;
          flex-shrink: 0;
          width: 100%;
          padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #0d0d12;
          z-index: 50;
        }

        .btn-action-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          background: #e4e4e7;
          border: none;
          border-radius: 9999px;
          color: #09090b;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: none;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-action-primary:hover {
          background: #d4d4d8;
          transform: translateY(-1px);
        }

        .btn-action-primary:active {
          transform: scale(0.98);
          background: #c8c8cc;
        }
      `}</style>
    </div>,
    portalTarget
  );
};
