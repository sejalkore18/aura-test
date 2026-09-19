'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Play, Info, Flame, Dumbbell } from 'lucide-react';
import { Exercise } from '@/types/workout';
import { EXERCISE_LIBRARY } from '@/data/exercises';

interface ExerciseLibraryViewProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  onSelectExercise,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscles.some((m) =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="library-view animate-fade-in">
      {/* Header */}
      <header className="library-header">
        <h1 className="library-title">Exercise Library</h1>
        <p className="library-subtitle">
          Explore exercise forms, pro tips, and targeted muscle groups
        </p>
      </header>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={17} className="search-icon" />
        <input
          type="text"
          placeholder="Search by exercise, equipment, or muscle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="category-pills">
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

      {/* Exercises Grid / List */}
      <div className="exercises-list">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="exercise-card"
            onClick={() => onSelectExercise(exercise)}
          >
            <div className="thumbnail-wrapper">
              <Image
                src={exercise.thumbnailUrl}
                alt={exercise.name}
                width={100}
                height={70}
                className="thumbnail-img"
                unoptimized
              />
              <div className="play-overlay">
                <Play size={16} fill="#e4e4e7" color="#e4e4e7" />
              </div>
            </div>

            <div className="card-details">
              <div className="name-category-row">
                <span className="category-tag">{exercise.category.toUpperCase()}</span>
                <span className="equipment-tag">{exercise.equipment}</span>
              </div>
              <h2 className="exercise-name">{exercise.name}</h2>
              <div className="muscle-preview">
                <Flame size={12} className="text-green" />
                <span>{exercise.primaryMuscles.slice(0, 2).join(', ')}</span>
              </div>
            </div>

            <button
              className="info-action-btn"
              title="View guide"
              onClick={(e) => {
                e.stopPropagation();
                onSelectExercise(exercise);
              }}
            >
              <Info size={18} />
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .library-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 22px 20px 24px;
          color: #e4e4e7;
        }

        .library-header {
          margin-bottom: 16px;
        }

        .library-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.02em;
        }

        .library-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-pill);
          padding: 10px 16px;
          margin-bottom: 14px;
        }

        :global(.search-icon) {
          color: var(--text-muted);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e4e4e7;
          font-size: 0.88rem;
          font-family: inherit;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .clear-search-btn {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .category-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 16px;
          padding-bottom: 2px;
        }

        .category-pill {
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .category-pill.active {
          background: #c8c8cc;
          color: #09090b;
          font-weight: 600;
        }

        .exercises-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          overflow-y: auto;
        }

        .exercise-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px 12px 8px 8px;
          border-radius: 18px;
          background: rgba(20, 20, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .exercise-card:hover {
          background: rgba(30, 30, 36, 0.85);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .thumbnail-wrapper {
          position: relative;
          width: 100px;
          height: 70px;
          border-radius: 14px;
          overflow: hidden;
          background: #141418;
          flex-shrink: 0;
        }

        :global(.thumbnail-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .exercise-card:hover .play-overlay {
          opacity: 1;
        }

        .card-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .name-category-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-blue);
          letter-spacing: 0.05em;
        }

        .equipment-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .exercise-name {
          font-size: 1.02rem;
          font-weight: 600;
          color: #e4e4e7;
        }

        .muscle-preview {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .text-green {
          color: var(--accent-green);
        }

        .info-action-btn {
          color: var(--text-muted);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-action-btn:hover {
          color: #e4e4e7;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};
