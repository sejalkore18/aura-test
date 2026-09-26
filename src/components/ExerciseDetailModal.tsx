'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Sparkles, Dumbbell, ShieldCheck, Flame } from 'lucide-react';
import { Exercise } from '@/types/workout';
import '@/styles/ExerciseDetailModal.css';

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
    </div>,
    portalTarget
  );
};
