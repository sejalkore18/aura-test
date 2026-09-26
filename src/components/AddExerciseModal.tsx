'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Search } from 'lucide-react';
import { Exercise, RoutineExercise } from '@/types/workout';
import { EXERCISE_LIBRARY } from '@/data/exercises';
import '@/styles/AddExerciseModal.css';

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

    const routineEx: RoutineExercise = {
      exerciseId: selectedExercise.id,
      targetSets,
      targetReps,
      targetWeightKg,
      sets: targetSets,
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
    </div>
  );
};
