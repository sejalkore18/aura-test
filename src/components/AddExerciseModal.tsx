'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Search, Dumbbell } from 'lucide-react';
import { Exercise, RoutineExercise } from '@/types/workout';
import { EXERCISE_LIBRARY } from '@/data/exercises';

interface AddExerciseModalProps {
  onClose: () => void;
  onAddExercise: (routineEx: RoutineExercise) => void;
  existingExerciseIds: string[];
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  onClose,
  onAddExercise,
  existingExerciseIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [targetSets, setTargetSets] = useState<number>(3);
  const [targetReps, setTargetReps] = useState<number>(10);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(0);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
  ];

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (ex: Exercise) => {
    setSelectedExercise(ex);
    setTargetSets(ex.defaultSets);
    setTargetReps(ex.defaultReps);
    setTargetWeightKg(ex.defaultWeightKg || 0);
  };

  const handleConfirmAdd = () => {
    if (!selectedExercise) return;

    const sets = Array.from({ length: targetSets }, (_, i) => ({
      setNumber: i + 1,
      targetReps: targetReps,
      actualReps: targetReps,
      weightKg: targetWeightKg,
      completed: false,
    }));

    const routineEx: RoutineExercise = {
      exerciseId: selectedExercise.id,
      targetSets,
      targetReps,
      targetWeightKg,
      sets,
    };

    onAddExercise(routineEx);
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {selectedExercise ? 'Configure Exercise' : 'Add Exercise'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!selectedExercise ? (
          <>
            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search exercises by name or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="category-pills-row">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`category-pill ${selectedCategory === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="exercises-list">
              {filteredExercises.map((ex) => {
                const isAlreadyInWorkout = existingExerciseIds.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`exercise-row ${isAlreadyInWorkout ? 'already-added' : ''}`}
                    onClick={() => handleSelect(ex)}
                  >
                    <Image
                      src={ex.thumbnailUrl}
                      alt={ex.name}
                      width={64}
                      height={46}
                      className="thumbnail"
                      unoptimized
                    />
                    <div className="ex-details">
                      <h3 className="ex-name">{ex.name}</h3>
                      <span className="ex-meta">
                        {ex.equipment} · {ex.category.toUpperCase()}
                      </span>
                    </div>
                    <button className="add-action-btn">
                      {isAlreadyInWorkout ? 'In Routine' : <Plus size={18} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Configure Target Sets & Reps */
          <div className="configure-view">
            <div className="selected-ex-header">
              <Image
                src={selectedExercise.thumbnailUrl}
                alt={selectedExercise.name}
                width={80}
                height={56}
                className="config-thumbnail"
                unoptimized
              />
              <div>
                <h3 className="config-name">{selectedExercise.name}</h3>
                <span className="config-equipment">{selectedExercise.equipment}</span>
              </div>
            </div>

            <div className="config-controls">
              {/* Sets */}
              <div className="control-card">
                <span className="control-label">Target Sets</span>
                <div className="counter-row">
                  <button
                    className="step-btn"
                    onClick={() => setTargetSets(Math.max(1, targetSets - 1))}
                  >
                    -
                  </button>
                  <span className="counter-val">{targetSets}</span>
                  <button
                    className="step-btn"
                    onClick={() => setTargetSets(targetSets + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reps */}
              <div className="control-card">
                <span className="control-label">Target Reps</span>
                <div className="counter-row">
                  <button
                    className="step-btn"
                    onClick={() => setTargetReps(Math.max(1, targetReps - 1))}
                  >
                    -
                  </button>
                  <span className="counter-val">{targetReps}</span>
                  <button
                    className="step-btn"
                    onClick={() => setTargetReps(targetReps + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Weight */}
              <div className="control-card">
                <span className="control-label">Initial Weight (kg)</span>
                <div className="counter-row">
                  <button
                    className="step-btn"
                    onClick={() => setTargetWeightKg(Math.max(0, targetWeightKg - 2.5))}
                  >
                    -
                  </button>
                  <span className="counter-val">
                    {targetWeightKg === 0 ? 'BW' : `${targetWeightKg}kg`}
                  </span>
                  <button
                    className="step-btn"
                    onClick={() => setTargetWeightKg(targetWeightKg + 2.5)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="configure-actions">
              <button
                className="back-choose-btn"
                onClick={() => setSelectedExercise(null)}
              >
                Choose Different
              </button>
              <button
                className="btn-primary-pill confirm-btn"
                onClick={handleConfirmAdd}
              >
                Add to Routine
              </button>
            </div>
          </div>
        )}
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
          height: 85vh;
          max-height: 750px;
          background: #141418;
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
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title {
          font-size: 1.2rem;
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

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 14px 20px 10px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-pill);
        }

        :global(.search-icon) {
          color: var(--text-muted);
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.88rem;
          width: 100%;
          font-family: inherit;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .category-pills-row {
          display: flex;
          gap: 8px;
          padding: 0 20px 12px;
          overflow-x: auto;
        }

        .category-pill {
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .category-pill.active {
          background: #ffffff;
          color: #09090b;
          font-weight: 600;
        }

        .exercises-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .exercise-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .exercise-row:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .exercise-row.already-added {
          opacity: 0.55;
        }

        :global(.thumbnail) {
          border-radius: 8px;
          object-fit: cover;
          background: #000000;
        }

        .ex-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ex-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
        }

        .ex-meta {
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .add-action-btn {
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: var(--radius-pill);
          background: rgba(255, 255, 255, 0.1);
        }

        /* Configure View */
        .configure-view {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
          overflow-y: auto;
        }

        .selected-ex-header {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.04);
          padding: 12px;
          border-radius: var(--radius-md);
        }

        :global(.config-thumbnail) {
          border-radius: 10px;
          object-fit: cover;
        }

        .config-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
        }

        .config-equipment {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .config-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .control-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .control-label {
          font-size: 0.92rem;
          font-weight: 600;
          color: #ffffff;
        }

        .counter-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .step-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .counter-val {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          min-width: 48px;
          text-align: center;
        }

        .configure-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }

        .back-choose-btn {
          color: var(--text-muted);
          font-size: 0.88rem;
          padding: 8px;
        }

        .confirm-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
