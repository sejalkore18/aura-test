'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  GripVertical,
  Dumbbell,
  Clock,
  Layers,
  Search,
  Check,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { WorkoutRoutine, RoutineExercise, DayKey } from '@/types/workout';
import { EXERCISE_LIBRARY, getExerciseById } from '@/data/exercises';
import '@/styles/WorkoutTemplateModal.css';

interface WorkoutTemplateModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialRoutine?: WorkoutRoutine | null;
  onClose: () => void;
  onSave: (routine: WorkoutRoutine) => void;
  onDelete?: (routineId: string) => void;
}

const TEMPLATE_PRESETS = [
  { title: 'Upper Body' },
  { title: 'Lower Body' },
  { title: 'Push Day' },
  { title: 'Pull Day' },
  { title: 'Full Body Blast' },
];

export const WorkoutTemplateModal: React.FC<WorkoutTemplateModalProps> = ({
  isOpen,
  mode,
  initialRoutine,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<(RoutineExercise & { _uid?: string })[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedMovementIds, setSelectedMovementIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [dragItemHeight, setDragItemHeight] = useState(120);
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [scheduledDays, setScheduledDays] = useState<DayKey[]>([]);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  const dragItemRef = React.useRef<number | null>(null);
  const dragOverRef = React.useRef<number | null>(null);
  const isDraggingActiveRef = React.useRef(false);
  const isDroppingRef = React.useRef(false);
  const dropTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Swipe-to-delete state
  const [swipingIndex, setSwipingIndex] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipingCardWidth, setSwipingCardWidth] = useState(360);
  const [isSwipingActive, setIsSwipingActive] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const swipeStartRef = React.useRef<{
    x: number;
    y: number;
    locked: 'h' | 'v' | null;
    startIndex: number;
    cardWidth: number;
  } | null>(null);

  // Sync state when opened or initialRoutine changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialRoutine) {
        setTitle(initialRoutine.title);
        setScheduledDays(initialRoutine.scheduledDays ?? []);
        setExercises(
          initialRoutine.exercises.map((ex, i) => {
            const numSets =
              typeof ex.sets === 'number'
                ? ex.sets
                : Array.isArray(ex.sets)
                ? (ex.sets as any[]).length
                : ex.targetSets || 3;
            return {
              ...ex,
              _uid: `uid-${ex.exerciseId}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              sets: numSets,
              targetSets: ex.targetSets ?? numSets,
            };
          })
        );
      } else {
        setTitle('');
        setScheduledDays([]);
        setExercises([]);
      }
      setShowExercisePicker(false);
      setSelectedMovementIds([]);
      setErrorMessage('');
      setSearchQuery('');
      setSelectedCategory('all');
      setDraggedIdx(null);
      setDragOverIdx(null);
      setDragTranslateY(0);
      setIsDraggingActive(false);
      setIsDropping(false);
      if (dropTimerRef.current) {
        clearTimeout(dropTimerRef.current);
        dropTimerRef.current = null;
      }
      dragItemRef.current = null;
      dragOverRef.current = null;
      isDraggingActiveRef.current = false;
      isDroppingRef.current = false;
      setSwipingIndex(null);
      setSwipeOffset(0);
      setIsSwipingActive(false);
      setDeletingIndex(null);
      swipeStartRef.current = null;
    }
  }, [isOpen, mode, initialRoutine]);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!isOpen) return null;

  // Exercise modifications
  const handleUpdateExercise = (
    index: number,
    field: 'targetSets' | 'targetReps' | 'targetWeightKg',
    value: number
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      const safeVal = Math.max(0, value);

      if (field === 'targetSets') {
        item.targetSets = Math.max(1, Math.min(12, safeVal));
      } else if (field === 'targetReps') {
        item.targetReps = Math.max(1, Math.min(100, safeVal));
      } else if (field === 'targetWeightKg') {
        item.targetWeightKg = safeVal;
      }

      item.sets = item.targetSets;

      updated[index] = item;
      return updated;
    });
  };

  // Reorder exercises via drag and drop
  const handleReorderExercises = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= exercises.length ||
      toIndex >= exercises.length
    )
      return;

    setExercises((prev) => {
      const copy = [...prev];
      const [movedItem] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, movedItem);
      return copy;
    });
  };

  const handlePointerDownHandle = (
    index: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0 || isDroppingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    if (dropTimerRef.current) {
      clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }

    // Cancel any active swipe immediately
    setSwipingIndex(null);
    setSwipeOffset(0);

    const container = listRef.current;
    if (!container) return;

    const cardWrappers = Array.from(
      container.querySelectorAll<HTMLElement>('.swipe-card-wrapper')
    );
    if (cardWrappers.length <= 1) return;

    // Snapshot undisturbed card centers and heights at the moment drag starts
    const slotCenters = cardWrappers.map((wrapper) => {
      const rect = wrapper.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });

    const currentCardRect = cardWrappers[index]?.getBoundingClientRect();
    const measuredSlotHeight =
      cardWrappers.length >= 2 &&
      cardWrappers[1]?.offsetTop !== undefined &&
      cardWrappers[0]?.offsetTop !== undefined &&
      cardWrappers[1].offsetTop > cardWrappers[0].offsetTop
        ? cardWrappers[1].offsetTop - cardWrappers[0].offsetTop
        : (currentCardRect?.height || 110) + 14;
    setDragItemHeight(measuredSlotHeight);

    const startClientY = e.clientY;
    dragItemRef.current = index;
    dragOverRef.current = index;
    isDraggingActiveRef.current = true;
    isDroppingRef.current = false;
    setIsDropping(false);

    setDraggedIdx(index);
    setDragOverIdx(index);
    setDragTranslateY(0);
    setIsDraggingActive(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingActiveRef.current || isDroppingRef.current) return;
      moveEvent.preventDefault();

      const dy = moveEvent.clientY - startClientY;
      setDragTranslateY(dy);

      const currentMidY = slotCenters[index] + dy;

      // Find closest slot center
      let closestIdx = index;
      let minDistance = Infinity;
      for (let i = 0; i < slotCenters.length; i++) {
        const dist = Math.abs(currentMidY - slotCenters[i]);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      closestIdx = Math.max(0, Math.min(slotCenters.length - 1, closestIdx));

      if (dragOverRef.current !== closestIdx) {
        dragOverRef.current = closestIdx;
        setDragOverIdx(closestIdx);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const from = dragItemRef.current;
      const to = dragOverRef.current;

      if (from === null || to === null) {
        isDraggingActiveRef.current = false;
        dragItemRef.current = null;
        dragOverRef.current = null;
        setDraggedIdx(null);
        setDragOverIdx(null);
        setDragTranslateY(0);
        setIsDraggingActive(false);
        return;
      }

      // Calculate exact drop landing translation offset relative to initial position
      const landingY = (slotCenters[to] ?? slotCenters[from]) - slotCenters[from];

      // Initiate smooth landing drop animation
      isDroppingRef.current = true;
      setIsDropping(true);
      setDragTranslateY(landingY);

      dropTimerRef.current = setTimeout(() => {
        if (from !== to) {
          handleReorderExercises(from, to);
        }

        isDroppingRef.current = false;
        isDraggingActiveRef.current = false;
        dragItemRef.current = null;
        dragOverRef.current = null;

        setDraggedIdx(null);
        setDragOverIdx(null);
        setDragTranslateY(0);
        setIsDraggingActive(false);
        setIsDropping(false);
        dropTimerRef.current = null;
      }, 240);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });
  };

  // Swipe-to-delete trigger with smooth exit animation
  const handleTriggerDelete = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
      setDeletingIndex(null);
      setSwipingIndex(null);
      setSwipeOffset(0);
    }, 240);
  };

  const handleSwipeStart = (
    index: number,
    clientX: number,
    clientY: number,
    target: HTMLElement
  ): boolean => {
    if (
      target.closest('.drag-handle, button, input, .step-btn') ||
      isDraggingActiveRef.current ||
      isDroppingRef.current
    ) {
      return false;
    }
    const cardWrapper = target.closest<HTMLElement>('.swipe-card-wrapper');
    const width = cardWrapper?.offsetWidth || 360;
    setSwipingCardWidth(width);

    swipeStartRef.current = {
      x: clientX,
      y: clientY,
      locked: null,
      startIndex: index,
      cardWidth: width,
    };
    if (swipingIndex !== null && swipingIndex !== index) {
      setSwipingIndex(null);
      setSwipeOffset(0);
    }
    return true;
  };

  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!swipeStartRef.current) return;
    const { x, y, startIndex, cardWidth } = swipeStartRef.current;
    const dx = clientX - x;
    const dy = clientY - y;

    if (swipeStartRef.current.locked === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        if (Math.abs(dx) > Math.abs(dy) + 2) {
          swipeStartRef.current.locked = 'h';
        } else {
          swipeStartRef.current.locked = 'v';
        }
      }
    }

    if (swipeStartRef.current.locked === 'h') {
      if (dx <= 0) {
        setSwipingIndex(startIndex);
        setIsSwipingActive(true);
        // Allow smooth swiping across full width, slight resistance only past full width
        const maxSlide = -cardWidth;
        const clamped = dx < maxSlide ? maxSlide + (dx - maxSlide) * 0.2 : dx;
        setSwipeOffset(clamped);
      } else if (swipingIndex === startIndex) {
        setSwipeOffset(0);
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!swipeStartRef.current) return;
    const { startIndex, locked, cardWidth } = swipeStartRef.current;
    setIsSwipingActive(false);

    if (locked === 'h' && swipingIndex === startIndex) {
      // Only delete if shifted more than 60% of tile width to the left
      const deleteThreshold = cardWidth * 0.6;
      if (Math.abs(swipeOffset) >= deleteThreshold) {
        handleTriggerDelete(startIndex);
      } else {
        // Shifted less than 60% -> smoothly snap back to 0
        setSwipeOffset(0);
        setSwipingIndex(null);
      }
    }
    swipeStartRef.current = null;
  };

  const handleMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const shouldStart = handleSwipeStart(index, e.clientX, e.clientY, e.target as HTMLElement);
    if (!shouldStart) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSwipeMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      handleSwipeEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (index: number, e: React.TouchEvent<HTMLDivElement>) => {
    handleSwipeStart(index, e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  // Movement picker handlers
  const handleToggleMovement = (id: string) => {
    setSelectedMovementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClosePicker = () => {
    setShowExercisePicker(false);
    setSelectedMovementIds([]);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const handleAddSelectedExercises = () => {
    if (selectedMovementIds.length === 0) return;

    const toAdd: (RoutineExercise & { _uid?: string })[] = [];
    selectedMovementIds.forEach((id, idx) => {
      const ex = EXERCISE_LIBRARY.find((e) => e.id === id);
      if (!ex) return;
      toAdd.push({
        _uid: `uid-${ex.id}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        exerciseId: ex.id,
        targetSets: ex.defaultSets || 3,
        targetReps: ex.defaultReps || 10,
        targetWeightKg: ex.defaultWeightKg || 0,
        sets: ex.defaultSets || 3,
      });
    });

    setExercises((prev) => [...prev, ...toAdd]);
    setSelectedMovementIds([]);
    setShowExercisePicker(false);
    setSearchQuery('');
    setSelectedCategory('all');
    setErrorMessage('');
  };

  // Calculate estimated minutes based on total sets
  const totalSets = exercises.reduce((acc, curr) => acc + curr.targetSets, 0);
  const estimatedMinutes = Math.max(15, Math.round(totalSets * 2.5));

  // Save routine
  const handleSave = () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a workout title (e.g. "Upper Body").');
      return;
    }
    if (exercises.length === 0) {
      setErrorMessage('Please add at least one exercise to this workout.');
      return;
    }

    const routineId =
      mode === 'edit' && initialRoutine
        ? initialRoutine.id
        : `routine_${Date.now()}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const firstExId = exercises[0]?.exerciseId;
    const firstEx = firstExId ? getExerciseById(firstExId) : null;
    const coverImage = firstEx?.thumbnailUrl || initialRoutine?.coverImage || '/workouts/upper-body.jpg';

    const savedRoutine: WorkoutRoutine = {
      id: routineId,
      title: title.trim(),
      estimatedMinutes,
      estimatedCalories: Math.round(estimatedMinutes * 4),
      exercises: exercises.map(({ _uid, ...rest }) => ({
        ...rest,
        sets: typeof rest.sets === 'number' ? rest.sets : rest.targetSets,
      })),
      coverImage,
      scheduledDays: scheduledDays.length > 0 ? scheduledDays : undefined,
    };

    onSave(savedRoutine);
    onClose();
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'core', label: 'Core' },
  ];

  const filteredLibrary = EXERCISE_LIBRARY.filter((ex) => {
    const matchesQuery =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const content = (
    <div
      className="template-page-view"
      role="region"
      aria-label={mode === 'create' ? 'Create Workout' : 'Modify Workout'}
    >
      {/* Page Header */}
      <header className="page-header">
        <button
          type="button"
          className="back-btn"
          onClick={onClose}
          aria-label="Go Back"
          title="Go Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="page-title">
          {mode === 'create' ? 'Create Workout' : 'Modify Workout'}
        </h1>
      </header>

      {/* Content Body */}
      <div className="page-body">
          {errorMessage && (
            <div className="error-banner animate-fade-in">
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Template Title Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="workout-title-input">
              Workout Name
            </label>
            <input
              id="workout-title-input"
              type="text"
              placeholder='e.g. "Upper Body", "Leg Day"'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrorMessage('');
              }}
              className="text-input"
              maxLength={40}
            />

            {/* Quick Presets if in create mode and empty */}
            {mode === 'create' && !title && (
              <div className="presets-row">
                <span className="presets-label">Quick Ideas:</span>
                <div className="presets-pills">
                  {TEMPLATE_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      className="preset-pill"
                      onClick={() => {
                        setTitle(preset.title);
                      }}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Training Days Selector */}
          <div className="days-selector-group">
            <label className="input-label">Training Days</label>
            <div className="days-pills-row">
              {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as DayKey[]).map((day) => {
                const labels: Record<DayKey, string> = { sun: 'S', mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S' };
                const fullLabels: Record<DayKey, string> = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };
                const isSelected = scheduledDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={`day-pill ${isSelected ? 'day-pill--active' : ''}`}
                    onClick={() => {
                      setScheduledDays((prev) =>
                        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                      );
                    }}
                    aria-pressed={isSelected}
                    aria-label={fullLabels[day]}
                    title={fullLabels[day]}
                  >
                    {labels[day]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercises Sequence Section */}
          <div className="exercises-section">
            <div className="section-header-row">
              <button
                type="button"
                className="add-exercise-trigger-btn"
                onClick={() => {
                  setSelectedMovementIds([]);
                  setShowExercisePicker(true);
                }}
              >
                <Plus size={15} />
                <span>Add Exercise</span>
              </button>
            </div>

            {/* Stats Preview */}
            <div className="stats-preview-bar">
              <div className="stat-item">
                <Layers size={14} className="text-accent" />
                <span>{exercises.length} Movements</span>
              </div>
              <div className="stat-item">
                <Flame size={14} className="text-orange" />
                <span>{totalSets} Sets</span>
              </div>
              <div className="stat-item">
                <Clock size={14} className="text-blue" />
                <span>~{estimatedMinutes} min</span>
              </div>
            </div>

            {exercises.length === 0 ? (
              <div
                className="empty-exercises-card"
                onClick={() => {
                  setSelectedMovementIds([]);
                  setShowExercisePicker(true);
                }}
              >
                <div className="empty-icon-wrap">
                  <Dumbbell size={32} />
                </div>
                <h4>No exercises added yet</h4>
                <p>Tap here to add exercises with custom sets, reps, and weights.</p>
              </div>
            ) : (
              <div
                ref={listRef}
                className={`exercise-cards-list ${isDraggingActive ? 'is-dragging-active' : ''}`}
              >
                {exercises.map((item, idx) => {
                  const ex = getExerciseById(item.exerciseId);
                  const exName = ex?.name || item.exerciseId;
                  const isThisDragging = isDraggingActive && draggedIdx === idx;
                  const isThisDropping = isThisDragging && isDropping;

                  // Calculate smooth slot displacement for neighboring cards
                  let shiftY = 0;
                  if (
                    isDraggingActive &&
                    draggedIdx !== null &&
                    dragOverIdx !== null &&
                    draggedIdx !== dragOverIdx
                  ) {
                    if (draggedIdx < dragOverIdx) {
                      if (idx > draggedIdx && idx <= dragOverIdx) {
                        shiftY = -dragItemHeight;
                      }
                    } else if (draggedIdx > dragOverIdx) {
                      if (idx >= dragOverIdx && idx < draggedIdx) {
                        shiftY = dragItemHeight;
                      }
                    }
                  }

                  const isSwipeActive =
                    (swipingIndex === idx && swipeOffset < 0) || deletingIndex === idx;
                  const deleteThreshold = swipingCardWidth > 0 ? swipingCardWidth * 0.6 : 200;
                  const isPast60Percent =
                    swipingIndex === idx && Math.abs(swipeOffset) >= deleteThreshold;

                  return (
                    <div
                      key={item._uid || `${item.exerciseId}-${idx}`}
                      className={`swipe-card-wrapper ${deletingIndex === idx ? 'is-deleting' : ''} ${
                        isThisDragging ? 'wrapper-dragging' : ''
                      } ${isThisDropping ? 'wrapper-dropping' : ''}`}
                      data-index={idx}
                      style={{
                        transform: isThisDragging
                          ? `translateY(${dragTranslateY}px)`
                          : shiftY !== 0
                          ? `translateY(${shiftY}px)`
                          : 'translateY(0)',
                        zIndex: isThisDragging ? 100 : 1,
                        transition: isThisDragging
                          ? isDropping
                            ? 'transform 0.24s cubic-bezier(0.18, 1, 0.22, 1)'
                            : 'none'
                          : isDraggingActive
                          ? 'transform 0.28s cubic-bezier(0.2, 0, 0, 1)'
                          : deletingIndex === idx
                          ? 'max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, margin-bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                          : 'none',
                      }}
                    >
                      {/* Swipe Delete Background Action (rendered only when actively swiping or deleting) */}
                      {isSwipeActive && (
                        <div
                          className={`swipe-delete-action ${
                            isPast60Percent ? 'ready-delete' : ''
                          }`}
                          onClick={() => handleTriggerDelete(idx)}
                        >
                          <div className="swipe-delete-content">
                            <Trash2
                              size={20}
                              color="#9ca3af"
                              className={`swipe-trash-icon ${isPast60Percent ? 'ready' : ''}`}
                            />
                            <span className="swipe-delete-label">
                              {isPast60Percent ? 'Release to Delete' : 'Slide to Delete'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Foreground Exercise Config Card */}
                      <div
                        className={`exercise-config-card ${isThisDragging ? 'is-dragging' : ''} ${
                          isThisDropping ? 'is-dropping' : ''
                        }`}
                        data-index={idx}
                        style={{
                          transform:
                            deletingIndex === idx
                              ? 'translateX(-100%)'
                              : swipingIndex === idx
                              ? `translateX(${swipeOffset}px)`
                              : 'translateX(0)',
                          transition:
                            isSwipingActive && swipingIndex === idx
                              ? 'none'
                              : 'transform 0.26s cubic-bezier(0.18, 1, 0.22, 1), opacity 0.24s ease',
                          pointerEvents: isThisDragging ? 'none' : 'auto',
                        }}
                        onMouseDown={(e) => handleMouseDown(idx, e)}
                        onTouchStart={(e) => handleTouchStart(idx, e)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => {
                          if (swipingIndex === idx && swipeOffset < 0) {
                            setSwipeOffset(0);
                            setSwipingIndex(null);
                          }
                        }}
                      >
                        {/* Top Row: Thumbnail, Name, Drag Handle */}
                        <div className="card-top-row">
                          {ex?.thumbnailUrl && (
                            <div className="thumb-container">
                              <Image
                                src={ex.thumbnailUrl}
                                alt={exName}
                                width={52}
                                height={40}
                                className="thumb-img"
                                unoptimized
                              />
                            </div>
                          )}

                          <div className="card-titles">
                            <span className="ex-name">{exName}</span>
                            <span className="ex-cat">
                              {ex?.category ? ex.category.toUpperCase() : 'EXERCISE'} ·{' '}
                              {ex?.equipment || 'Freeweights'}
                            </span>
                          </div>

                          {/* Drag Handle */}
                          <div className="card-actions">
                            <div
                              className={`drag-handle ${
                                isThisDragging && !isThisDropping ? 'is-active' : ''
                              }`}
                              onPointerDown={(e) => handlePointerDownHandle(idx, e)}
                              title="Drag to reorder"
                              aria-label="Drag to reorder"
                            >
                              <GripVertical size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Set, Rep, and Weight Steppers */}
                        <div className="steppers-grid">
                          {/* Sets Stepper */}
                          <div className="stepper-item">
                            <span className="stepper-label">Sets</span>
                            <div className="stepper-control">
                              <button
                                type="button"
                                className="step-btn"
                                onClick={() =>
                                  handleUpdateExercise(idx, 'targetSets', item.targetSets - 1)
                                }
                              >
                                <Minus size={13} strokeWidth={2.4} />
                              </button>
                              <span className="step-val">{item.targetSets}</span>
                              <button
                                type="button"
                                className="step-btn"
                                onClick={() =>
                                  handleUpdateExercise(idx, 'targetSets', item.targetSets + 1)
                                }
                              >
                                <Plus size={13} strokeWidth={2.4} />
                              </button>
                            </div>
                          </div>

                          {/* Reps Stepper */}
                          <div className="stepper-item">
                            <span className="stepper-label">Reps</span>
                            <div className="stepper-control">
                              <button
                                type="button"
                                className="step-btn"
                                onClick={() =>
                                  handleUpdateExercise(idx, 'targetReps', item.targetReps - 1)
                                }
                              >
                                <Minus size={13} strokeWidth={2.4} />
                              </button>
                              <span className="step-val">{item.targetReps}</span>
                              <button
                                type="button"
                                className="step-btn"
                                onClick={() =>
                                  handleUpdateExercise(idx, 'targetReps', item.targetReps + 1)
                                }
                              >
                                <Plus size={13} strokeWidth={2.4} />
                              </button>
                            </div>
                          </div>

                          {/* Weight Stepper */}
                          <div className="stepper-item weight-stepper">
                            <span className="stepper-label">Weight</span>
                            <div className="stepper-control">
                              <button
                                type="button"
                                className="step-btn"
                                onClick={() =>
                                  handleUpdateExercise(
                                    idx,
                                    'targetWeightKg',
                                    Math.max(0, item.targetWeightKg - 2.5)
                                  )
                                }
                              >
                                <Minus size={13} strokeWidth={2.4} />
                              </button>
                              <span className="step-val weight-val">
                                {item.targetWeightKg > 0 ? `${item.targetWeightKg}kg` : 'BW'}
                              </span>
                              <button
                                type="button"
                                className="step-btn"
                                onClick={() =>
                                  handleUpdateExercise(
                                    idx,
                                    'targetWeightKg',
                                    item.targetWeightKg + 2.5
                                  )
                                }
                              >
                                <Plus size={13} strokeWidth={2.4} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="page-footer">
          <button
            type="button"
            className="btn-save-template"
            onClick={handleSave}
          >
            <span>{mode === 'create' ? 'Create Workout' : 'Save'}</span>
          </button>
        </footer>

        {/* Exercise Picker Full Screen */}
        {showExercisePicker && (
          <div className="picker-screen-view">
            <header className="page-header">
              <button
                type="button"
                className="back-btn"
                onClick={handleClosePicker}
                aria-label="Go Back"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="page-title">Select Movement</h1>
              {selectedMovementIds.length > 0 && (
                <div className="picker-header-actions">
                  <button
                    type="button"
                    className="clear-selection-btn"
                    onClick={() => setSelectedMovementIds([])}
                  >
                    Clear
                  </button>
                </div>
              )}
            </header>

            <div className="picker-screen-body">
              {/* Search Input */}
              <div className="picker-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by exercise or muscle group..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
              </div>

              {/* Category Filter Chips */}
              <div className="picker-chips-scroll">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Exercise List */}
              <div className="picker-list">
                {filteredLibrary.map((ex) => {
                  const isAlreadyIn = exercises.some((e) => e.exerciseId === ex.id);
                  const isSelected = selectedMovementIds.includes(ex.id);

                  return (
                    <div
                      key={ex.id}
                      className={`picker-item ${isAlreadyIn ? 'already-added' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (!isAlreadyIn) {
                          handleToggleMovement(ex.id);
                        }
                      }}
                      role="button"
                      tabIndex={isAlreadyIn ? -1 : 0}
                      aria-disabled={isAlreadyIn}
                    >
                      <Image
                        src={ex.thumbnailUrl}
                        alt={ex.name}
                        width={56}
                        height={42}
                        className="picker-thumb"
                        unoptimized
                      />
                      <div className="picker-info">
                        <span className="picker-name">{ex.name}</span>
                        <span className="picker-meta">{ex.category.toUpperCase()}</span>
                      </div>
                      <div className="picker-add-action">
                        {isAlreadyIn || isSelected ? (
                          <div className="icon-circle-check">
                            <Check size={16} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="icon-circle-add">
                            <Plus size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Picker Bottom Action Footer */}
            <footer className="picker-footer">
              <button
                type="button"
                className={`btn-add-selected ${selectedMovementIds.length > 0 ? 'active' : 'disabled'}`}
                disabled={selectedMovementIds.length === 0}
                onClick={handleAddSelectedExercises}
              >
                <span>
                  {selectedMovementIds.length === 0
                    ? 'Select exercises to add'
                    : `Add ${selectedMovementIds.length} ${selectedMovementIds.length === 1 ? 'Exercise' : 'Exercises'}`}
                </span>
              </button>
            </footer>
          </div>
        )}
    </div>
  );

  return portalTarget ? createPortal(content, portalTarget) : null;
};
