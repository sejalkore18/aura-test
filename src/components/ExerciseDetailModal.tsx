'use client';

import React from 'react';
import { X, Sparkles, Dumbbell, ShieldCheck, Flame } from 'lucide-react';
import { Exercise } from '@/types/workout';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  onStartExerciseNow?: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onStartExerciseNow,
}) => {
  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="title-group">
            <span className="category-pill">{exercise.category.toUpperCase()}</span>
            <h2 className="modal-title">{exercise.name}</h2>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Guide">
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <div className="video-wrapper">
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

        <div className="modal-body">
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

        {/* Footer */}
        <div className="modal-footer">
          {onStartExerciseNow && (
            <button
              className="btn-primary-pill start-now-btn"
              onClick={() => {
                onClose();
                onStartExerciseNow();
              }}
            >
              Start This Exercise
            </button>
          )}
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .modal-sheet {
          width: 100%;
          max-width: 440px;
          height: 90vh;
          max-height: 800px;
          background: #121217;
          border-top: 1px solid var(--border-active);
          border-left: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.9);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 18px 20px 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .category-pill {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent-blue);
          display: inline-block;
          margin-bottom: 4px;
        }

        .modal-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: 240px;
          background: #000000;
          flex-shrink: 0;
        }

        .detail-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Pro Tip Card */
        .pro-tip-card {
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
          color: #f4f4f5;
        }

        /* Section Block */
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .steps-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
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
          color: #ffffff;
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
          background: rgba(48, 209, 88, 0.15);
          color: var(--accent-green);
          border: 1px solid rgba(48, 209, 88, 0.3);
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
          color: #ffffff;
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
        .modal-footer {
          padding: 14px 20px 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #121217;
        }

        .done-btn {
          width: 100%;
          padding: 12px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .done-btn:hover {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};
