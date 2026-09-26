'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Play } from 'lucide-react';
import { Exercise } from '@/types/workout';
import { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';
import '@/styles/ExerciseLibraryView.css';

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

              </div>
              <h2 className="exercise-name">{exercise.name}</h2>

            </div>


          </div>
        ))}
      </div>
    </div>
  );
};
