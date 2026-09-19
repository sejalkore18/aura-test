'use client';

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from '@/components/PhoneFrame';
import { WorkoutOverview } from '@/components/WorkoutOverview';
import { ActiveWorkoutPlayer } from '@/components/ActiveWorkoutPlayer';
import { ExerciseDetailModal } from '@/components/ExerciseDetailModal';
import { WorkoutSummaryModal } from '@/components/WorkoutSummaryModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { AddExerciseModal } from '@/components/AddExerciseModal';
import { WorkoutTemplateModal } from '@/components/WorkoutTemplateModal';
import { AppBar } from '@/components/AppBar';
import { BottomNavBar, NavTab } from '@/components/BottomNavBar';
import { ExerciseLibraryView } from '@/components/ExerciseLibraryView';
import { HistoryView } from '@/components/HistoryView';
import { ProfileView } from '@/components/ProfileView';
import { DashboardView } from '@/components/DashboardView';
import {
  WorkoutRoutine,
  WorkoutSet,
  WorkoutLog,
  Exercise,
  RoutineExercise,
  UserProfile,
  USER_PROFILES,
} from '@/types/workout';
import { DEFAULT_ROUTINES, getExerciseById, EXERCISE_LIBRARY } from '@/data/exercises';
import { INITIAL_WORKOUT_LOGS } from '@/data/mockWorkoutLogs';

export default function HomePage() {
  // 0. User Profile State (Sejal and Bhaumik)
  const [activeUserId, setActiveUserId] = useState<'sejal' | 'bhaumik'>('sejal');
  const activeUser: UserProfile =
    USER_PROFILES.find((u) => u.id === activeUserId) || USER_PROFILES[0];

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // 1. Routine State
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(DEFAULT_ROUTINES);
  const [currentRoutineId, setCurrentRoutineId] = useState<string>('chest-triceps-day');

  // 2. Active Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isPlayerViewOpen, setIsPlayerViewOpen] = useState<boolean>(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Exercise Progress Map: exerciseId -> WorkoutSet[]
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, WorkoutSet[]>>({});

  // 3. Modals & Drawers
  const [selectedExerciseForGuide, setSelectedExerciseForGuide] = useState<Exercise | null>(null);
  const [summaryLog, setSummaryLog] = useState<WorkoutLog | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAddExercise, setShowAddExercise] = useState<boolean>(false);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(INITIAL_WORKOUT_LOGS);

  // Template Modal State (Create / Edit Routine)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [templateModalMode, setTemplateModalMode] = useState<'create' | 'edit'>('create');
  const [templateModalRoutine, setTemplateModalRoutine] = useState<WorkoutRoutine | null>(null);

  // Find active routine object
  const currentRoutine: WorkoutRoutine =
    routines.find((r) => r.id === currentRoutineId) || routines[0] || DEFAULT_ROUTINES[0];

  // Initialize and load from localStorage
  useEffect(() => {
    try {
      // Load active user profile
      const savedUserId = localStorage.getItem('aura_active_user');
      if (savedUserId === 'sejal' || savedUserId === 'bhaumik') {
        setActiveUserId(savedUserId);
      }

      // Load saved logs
      const savedLogs = localStorage.getItem('aura_workout_logs');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkoutLogs(parsed);
        } else {
          setWorkoutLogs(INITIAL_WORKOUT_LOGS);
        }
      } else {
        setWorkoutLogs(INITIAL_WORKOUT_LOGS);
      }

      // Load routines if customized
      const savedRoutines = localStorage.getItem('aura_routines');
      if (savedRoutines) {
        setRoutines(JSON.parse(savedRoutines));
      }

      // Load current routine selection
      const savedRoutineId = localStorage.getItem('aura_current_routine_id');
      if (savedRoutineId) {
        setCurrentRoutineId(savedRoutineId);
      }
    } catch {
      // ignore
    }
  }, []);

  // Switch Active User Profile
  const handleSwitchUser = (userId: 'sejal' | 'bhaumik') => {
    setActiveUserId(userId);
    try {
      localStorage.setItem('aura_active_user', userId);
    } catch {
      // ignore
    }
  };

  // Save logs to localStorage
  const saveWorkoutLogs = (newLogs: WorkoutLog[]) => {
    setWorkoutLogs(newLogs);
    try {
      localStorage.setItem('aura_workout_logs', JSON.stringify(newLogs));
    } catch {
      // ignore
    }
  };

  // Initialize sets for the active routine if not yet initialized
  const getSetsForExercise = (exerciseId: string, targetSets = 3, targetReps = 10, targetWeightKg = 0) => {
    if (exerciseProgress[exerciseId]) {
      return exerciseProgress[exerciseId];
    }
    const initialSets: WorkoutSet[] = Array.from({ length: targetSets }, (_, i) => ({
      setNumber: i + 1,
      targetReps,
      actualReps: targetReps,
      weightKg: targetWeightKg,
      completed: false,
    }));
    return initialSets;
  };

  // List of exercises that have all sets completed
  const completedExerciseIds = currentRoutine.exercises
    .filter((item) => {
      const sets = exerciseProgress[item.exerciseId];
      if (!sets || sets.length === 0) return false;
      return sets.every((s) => s.completed);
    })
    .map((item) => item.exerciseId);

  // Switch routine
  const handleSelectRoutine = (routineId: string) => {
    setCurrentRoutineId(routineId);
    try {
      localStorage.setItem('aura_current_routine_id', routineId);
    } catch {
      // ignore
    }
    // Reset session for new routine
    setIsSessionActive(false);
    setIsPlayerViewOpen(false);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setExerciseProgress({});
  };

  // Start / Resume Workout
  const handleStartWorkout = (targetRoutineId?: string) => {
    let activeRoutine = currentRoutine;
    if (targetRoutineId && targetRoutineId !== currentRoutineId) {
      const found = routines.find((r) => r.id === targetRoutineId);
      if (found) {
        activeRoutine = found;
        setCurrentRoutineId(targetRoutineId);
        try {
          localStorage.setItem('aura_current_routine_id', targetRoutineId);
        } catch {
          // ignore
        }
      }
    }

    if (!activeRoutine || !activeRoutine.exercises || activeRoutine.exercises.length === 0) {
      handleOpenCreateTemplate();
      return;
    }

    if (!isSessionActive || targetRoutineId) {
      setIsSessionActive(true);
      setSessionStartTime(Date.now());
      // Initialize progress map
      const initialProgress: Record<string, WorkoutSet[]> = {};
      activeRoutine.exercises.forEach((item) => {
        initialProgress[item.exerciseId] = Array.from({ length: item.targetSets }, (_, i) => ({
          setNumber: i + 1,
          targetReps: item.targetReps,
          actualReps: item.targetReps,
          weightKg: item.targetWeightKg,
          completed: false,
        }));
      });
      setExerciseProgress(initialProgress);
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
    }
    setIsPlayerViewOpen(true);
  };

  // Start directly from a specific exercise clicked in overview
  const handleSelectExerciseToStart = (exerciseIndex: number, targetRoutineId?: string) => {
    let activeRoutine = currentRoutine;
    if (targetRoutineId && targetRoutineId !== currentRoutineId) {
      const found = routines.find((r) => r.id === targetRoutineId);
      if (found) {
        activeRoutine = found;
        setCurrentRoutineId(targetRoutineId);
        try {
          localStorage.setItem('aura_current_routine_id', targetRoutineId);
        } catch {
          // ignore
        }
      }
    }

    if (!isSessionActive || targetRoutineId) {
      handleStartWorkout(targetRoutineId);
    }
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSetIndex(0);
    setIsPlayerViewOpen(true);
  };

  // Update reps or weight of current set
  const handleUpdateSet = (setIndex: number, reps: number, weightKg: number) => {
    const currentEx = currentRoutine.exercises[currentExerciseIndex];
    if (!currentEx) return;

    const existingSets = getSetsForExercise(
      currentEx.exerciseId,
      currentEx.targetSets,
      currentEx.targetReps,
      currentEx.targetWeightKg
    );

    const updatedSets = [...existingSets];
    if (updatedSets[setIndex]) {
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        actualReps: reps,
        weightKg,
      };
      setExerciseProgress((prev) => ({
        ...prev,
        [currentEx.exerciseId]: updatedSets,
      }));
    }
  };

  // Add a new set to the current active exercise (max 6)
  const handleAddSet = () => {
    const currentEx = currentRoutine.exercises[currentExerciseIndex];
    if (!currentEx) return;

    const existingSets = getSetsForExercise(
      currentEx.exerciseId,
      currentEx.targetSets,
      currentEx.targetReps,
      currentEx.targetWeightKg
    );

    if (existingSets.length >= 6) return;

    const lastSet = existingSets[existingSets.length - 1];
    const newSet: WorkoutSet = {
      setNumber: existingSets.length + 1,
      targetReps: lastSet ? lastSet.targetReps : currentEx.targetReps || 10,
      actualReps: lastSet ? lastSet.actualReps : currentEx.targetReps || 10,
      weightKg: lastSet ? lastSet.weightKg : currentEx.targetWeightKg || 0,
      completed: false,
    };

    setExerciseProgress((prev) => ({
      ...prev,
      [currentEx.exerciseId]: [...existingSets, newSet],
    }));
  };

  // Remove the last set from the current active exercise (min 1)
  const handleRemoveSet = () => {
    const currentEx = currentRoutine.exercises[currentExerciseIndex];
    if (!currentEx) return;

    const existingSets = getSetsForExercise(
      currentEx.exerciseId,
      currentEx.targetSets,
      currentEx.targetReps,
      currentEx.targetWeightKg
    );

    if (existingSets.length <= 1) return;

    const updatedSets = existingSets.slice(0, existingSets.length - 1);

    setExerciseProgress((prev) => ({
      ...prev,
      [currentEx.exerciseId]: updatedSets,
    }));

    if (currentSetIndex >= updatedSets.length) {
      setCurrentSetIndex(updatedSets.length - 1);
    }
  };

  // Complete a set and advance
  const handleCompleteSet = (setIndex: number, reps: number, weightKg: number) => {
    const currentEx = currentRoutine.exercises[currentExerciseIndex];
    if (!currentEx) return;

    const existingSets = getSetsForExercise(
      currentEx.exerciseId,
      currentEx.targetSets,
      currentEx.targetReps,
      currentEx.targetWeightKg
    );

    const updatedSets = [...existingSets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      actualReps: reps,
      weightKg,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    const newProgress = {
      ...exerciseProgress,
      [currentEx.exerciseId]: updatedSets,
    };
    setExerciseProgress(newProgress);

    const isLastSetOfExercise = setIndex === updatedSets.length - 1;
    const isLastExerciseOfRoutine = currentExerciseIndex === currentRoutine.exercises.length - 1;

    if (isLastSetOfExercise && isLastExerciseOfRoutine) {
      // First put a check on the last set, then finish workout
      setTimeout(() => {
        finishWorkout(newProgress);
      }, 600);
    } else if (isLastSetOfExercise) {
      // First put a check on the last set, then move to next exercise
      setTimeout(() => {
        const nextExIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextExIndex);
        setCurrentSetIndex(0);
      }, 600);
    } else {
      // Advance directly to next set in current exercise without rest screen
      const nextSetIdx = setIndex + 1;
      setCurrentSetIndex(nextSetIdx);
    }
  };

  // Finish Workout and compute summary log
  const finishWorkout = (finalProgress: Record<string, WorkoutSet[]>) => {
    const durationMins = sessionStartTime
      ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
      : currentRoutine.estimatedMinutes;

    let totalSets = 0;
    let totalReps = 0;
    let totalVolumeKg = 0;

    const completedExercisesList: {
      name: string;
      sets: { reps: number; weightKg: number }[];
    }[] = [];

    currentRoutine.exercises.forEach((item) => {
      const sets = finalProgress[item.exerciseId] || [];
      const exData = getExerciseById(item.exerciseId);
      const exName = exData ? exData.name : item.exerciseId;

      const loggedSets: { reps: number; weightKg: number }[] = [];

      sets.forEach((s) => {
        if (s.completed) {
          totalSets += 1;
          totalReps += s.actualReps;
          // If bodyweight, consider standard benchmark or 0 + added weight
          const effectiveWeight = s.weightKg > 0 ? s.weightKg : 0;
          totalVolumeKg += s.actualReps * effectiveWeight;
          loggedSets.push({ reps: s.actualReps, weightKg: s.weightKg });
        }
      });

      if (loggedSets.length > 0) {
        completedExercisesList.push({
          name: exName,
          sets: loggedSets,
        });
      }
    });

    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = String(now.getMonth() + 1).padStart(2, '0');
    const nowDay = String(now.getDate()).padStart(2, '0');
    const isoDateStr = `${nowYear}-${nowMonth}-${nowDay}`;

    const newLog: WorkoutLog = {
      id: `log_${Date.now()}`,
      userId: activeUserId,
      routineId: currentRoutine.id,
      routineTitle: currentRoutine.title,
      date: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isoDate: isoDateStr,
      durationMinutes: durationMins,
      totalSets,
      totalReps,
      totalVolumeKg,
      completedExercises: completedExercisesList,
    };

    const updatedLogs = [newLog, ...workoutLogs];
    saveWorkoutLogs(updatedLogs);

    // Reset active session and show celebratory modal
    setIsSessionActive(false);
    setIsPlayerViewOpen(false);
    setSummaryLog(newLog);
  };

  // Undo / Previous Set
  const handlePreviousSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
    } else if (currentExerciseIndex > 0) {
      const prevExIdx = currentExerciseIndex - 1;
      const prevEx = currentRoutine.exercises[prevExIdx];
      const prevSets = getSetsForExercise(prevEx.exerciseId);
      setCurrentExerciseIndex(prevExIdx);
      setCurrentSetIndex(prevSets.length - 1);
    }
  };

  // Skip to next exercise
  const handleSkipExercise = () => {
    if (currentExerciseIndex < currentRoutine.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    } else {
      finishWorkout(exerciseProgress);
    }
  };

  // Add exercise to routine
  const handleAddExerciseToRoutine = (newRoutineEx: RoutineExercise) => {
    const updatedRoutine: WorkoutRoutine = {
      ...currentRoutine,
      exercises: [...currentRoutine.exercises, newRoutineEx],
    };

    const updatedRoutines = routines.map((r) =>
      r.id === currentRoutine.id ? updatedRoutine : r
    );

    setRoutines(updatedRoutines);
    try {
      localStorage.setItem('aura_routines', JSON.stringify(updatedRoutines));
    } catch {
      // ignore
    }
  };

  // Open Create Template Modal
  const handleOpenCreateTemplate = () => {
    setTemplateModalMode('create');
    setTemplateModalRoutine(null);
    setIsTemplateModalOpen(true);
  };

  // Open Edit Template Modal
  const handleOpenEditTemplate = (routineToEdit: WorkoutRoutine) => {
    setTemplateModalMode('edit');
    setTemplateModalRoutine(routineToEdit);
    setIsTemplateModalOpen(true);
  };

  // Save Routine (Create or Edit)
  const handleSaveRoutine = (savedRoutine: WorkoutRoutine) => {
    let updatedRoutines: WorkoutRoutine[];
    const exists = routines.some((r) => r.id === savedRoutine.id);

    if (exists) {
      updatedRoutines = routines.map((r) =>
        r.id === savedRoutine.id ? savedRoutine : r
      );
    } else {
      updatedRoutines = [...routines, savedRoutine];
    }

    setRoutines(updatedRoutines);
    setCurrentRoutineId(savedRoutine.id);

    try {
      localStorage.setItem('aura_routines', JSON.stringify(updatedRoutines));
      localStorage.setItem('aura_current_routine_id', savedRoutine.id);
    } catch {
      // ignore
    }

    // Reset active session for clean start with the modified routine
    setIsSessionActive(false);
    setIsPlayerViewOpen(false);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setExerciseProgress({});
  };

  // Delete Routine
  const handleDeleteRoutine = (routineId: string) => {
    if (routines.length <= 1) {
      alert('You must have at least one workout routine.');
      return;
    }

    const updatedRoutines = routines.filter((r) => r.id !== routineId);
    setRoutines(updatedRoutines);

    if (currentRoutineId === routineId) {
      const fallbackId = updatedRoutines[0]?.id || DEFAULT_ROUTINES[0].id;
      setCurrentRoutineId(fallbackId);
      try {
        localStorage.setItem('aura_current_routine_id', fallbackId);
      } catch {
        // ignore
      }
      setIsSessionActive(false);
      setIsPlayerViewOpen(false);
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
      setExerciseProgress({});
    }

    try {
      localStorage.setItem('aura_routines', JSON.stringify(updatedRoutines));
    } catch {
      // ignore
    }

    setIsTemplateModalOpen(false);
  };

  // Quick Update Exercise Targets directly from WorkoutOverview
  const handleUpdateExerciseTargets = (
    exerciseIndex: number,
    targetSets: number,
    targetReps: number,
    targetWeightKg: number
  ) => {
    const exList = [...currentRoutine.exercises];
    if (!exList[exerciseIndex]) return;

    const item = { ...exList[exerciseIndex] };
    item.targetSets = targetSets;
    item.targetReps = targetReps;
    item.targetWeightKg = targetWeightKg;
    item.sets = Array.from({ length: targetSets }, (_, i) => ({
      setNumber: i + 1,
      targetReps,
      actualReps: targetReps,
      weightKg: targetWeightKg,
      completed: false,
    }));

    exList[exerciseIndex] = item;

    const updatedRoutine: WorkoutRoutine = {
      ...currentRoutine,
      exercises: exList,
    };

    const updatedRoutines = routines.map((r) =>
      r.id === currentRoutine.id ? updatedRoutine : r
    );

    setRoutines(updatedRoutines);
    try {
      localStorage.setItem('aura_routines', JSON.stringify(updatedRoutines));
    } catch {
      // ignore
    }

    if (exerciseProgress[item.exerciseId]) {
      setExerciseProgress((prev) => ({
        ...prev,
        [item.exerciseId]: item.sets,
      }));
    }
  };

  // Remove single exercise from current routine
  const handleRemoveExerciseFromRoutine = (exerciseIndex: number) => {
    const updatedExercises = currentRoutine.exercises.filter((_, i) => i !== exerciseIndex);
    const updatedRoutine: WorkoutRoutine = {
      ...currentRoutine,
      exercises: updatedExercises,
    };

    const updatedRoutines = routines.map((r) =>
      r.id === currentRoutine.id ? updatedRoutine : r
    );

    setRoutines(updatedRoutines);
    try {
      localStorage.setItem('aura_routines', JSON.stringify(updatedRoutines));
    } catch {
      // ignore
    }

    if (currentExerciseIndex >= updatedExercises.length) {
      setCurrentExerciseIndex(Math.max(0, updatedExercises.length - 1));
      setCurrentSetIndex(0);
    }
  };

  // Reset day's workout progress
  const handleResetProgress = () => {
    setIsSessionActive(false);
    setIsPlayerViewOpen(false);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setExerciseProgress({});
  };

  // Clear all workout logs
  const handleClearHistory = () => {
    saveWorkoutLogs([]);
  };

  const currentRoutineExercise =
    currentRoutine?.exercises?.[currentExerciseIndex] || currentRoutine?.exercises?.[0];
  const activeExerciseData: Exercise = currentRoutineExercise
    ? getExerciseById(currentRoutineExercise.exerciseId) || EXERCISE_LIBRARY[0]
    : EXERCISE_LIBRARY[0];
  const activeSets = currentRoutineExercise
    ? getSetsForExercise(
        currentRoutineExercise.exerciseId,
        currentRoutineExercise.targetSets,
        currentRoutineExercise.targetReps,
        currentRoutineExercise.targetWeightKg
      )
    : [];

  const showBackButton = isPlayerViewOpen || activeTab !== 'dashboard';

  const handleAppBarBack = () => {
    if (isPlayerViewOpen) {
      setIsPlayerViewOpen(false);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  const getAppBarTitle = () => {
    if (isPlayerViewOpen) return activeExerciseData.name;
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'workout':
        return 'Workout';
      case 'library':
        return 'Exercise Library';
      case 'history':
        return 'Progress';
      case 'profile':
        return `${activeUser.name}'s Profile`;
    }
  };

  const getAppBarSubtitle = () => {
    if (isPlayerViewOpen) {
      return `Set ${currentSetIndex + 1} of ${activeSets.length}`;
    }
    switch (activeTab) {
      case 'dashboard':
        return 'Home Overview';
      case 'workout':
        return undefined;
      case 'library':
        return 'All Movements';
      case 'history':
        return undefined;
      case 'profile':
        return 'Athlete Stats';
    }
  };

  return (
    <PhoneFrame>
      {/* Universal Top AppBar (shown on sub-tabs & player view, hidden on root dashboard) */}
      {(isPlayerViewOpen || activeTab !== 'dashboard') && (
        <AppBar
          title={getAppBarTitle()}
          subtitle={getAppBarSubtitle()}
          showBackButton={showBackButton}
          onBack={handleAppBarBack}
          activeUser={activeUser}
          allUsers={USER_PROFILES}
          onSwitchUser={handleSwitchUser}
          showUserSwitcher={!['history', 'workout'].includes(activeTab) && !isPlayerViewOpen}
          transparentBackButton={['history', 'workout'].includes(activeTab)}
          titlePosition={['history', 'workout'].includes(activeTab) ? 'left' : 'center'}
        />
      )}

      {/* Active Workout Player Screen (Immersive Exercise Mode) */}
      {isPlayerViewOpen ? (
        <div className="player-viewport">
          <ActiveWorkoutPlayer
            exercise={activeExerciseData as Exercise}
            exerciseIndex={currentExerciseIndex}
            totalExercises={currentRoutine.exercises.length}
            routine={currentRoutine}
            sets={activeSets}
            currentSetIndex={currentSetIndex}
            onBackToOverview={() => setIsPlayerViewOpen(false)}
            onSetChange={(idx) => setCurrentSetIndex(idx)}
            onUpdateSet={handleUpdateSet}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onCompleteSet={handleCompleteSet}
            onPreviousSet={handlePreviousSet}
            onSkipExercise={handleSkipExercise}
            onOpenExerciseDetails={() => setSelectedExerciseForGuide(activeExerciseData as Exercise)}
            onSelectExercise={(idx) => {
              setCurrentExerciseIndex(idx);
              setCurrentSetIndex(0);
            }}
          />
        </div>
      ) : (
        /* Main Application Views with Scrollable Content and Sticky Bottom Footer Bar */
        <div className="tab-layout-wrapper">
          <div className="tab-scroll-viewport">
            {activeTab === 'dashboard' && (
              <DashboardView
                activeUser={activeUser}
                allUsers={USER_PROFILES}
                onSwitchUser={handleSwitchUser}
                currentRoutine={currentRoutine}
                isSessionActive={isSessionActive}
                completedExerciseIds={completedExerciseIds}
                workoutLogs={workoutLogs}
                onStartWorkout={() => {
                  setActiveTab('workout');
                  handleStartWorkout();
                }}
                onSelectExercise={(idx) => {
                  setActiveTab('workout');
                  handleSelectExerciseToStart(idx);
                }}
                onOpenExerciseDetails={(ex) => setSelectedExerciseForGuide(ex)}
                onGoToWorkoutTab={() => setActiveTab('workout')}
                onGoToHistoryTab={() => setActiveTab('history')}
              />
            )}

            {activeTab === 'workout' && (
              <WorkoutOverview
                routine={currentRoutine}
                allRoutines={routines}
                onSelectRoutine={handleSelectRoutine}
                onStartWorkout={handleStartWorkout}
                onSelectExerciseToStart={handleSelectExerciseToStart}
                onOpenExerciseDetails={(ex) => setSelectedExerciseForGuide(ex)}
                onOpenHistory={() => setActiveTab('history')}
                onOpenAddExercise={() => setShowAddExercise(true)}
                onResetProgress={handleResetProgress}
                completedExerciseIds={completedExerciseIds}
                isSessionActive={isSessionActive}
                onOpenCreateTemplate={handleOpenCreateTemplate}
                onOpenEditTemplate={handleOpenEditTemplate}
                onDeleteRoutine={handleDeleteRoutine}
                onUpdateExerciseTargets={handleUpdateExerciseTargets}
                onRemoveExerciseFromRoutine={handleRemoveExerciseFromRoutine}
              />
            )}

            {activeTab === 'library' && (
              <ExerciseLibraryView
                onSelectExercise={(ex) => setSelectedExerciseForGuide(ex)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                logs={workoutLogs}
                activeUser={activeUser}
                onClearHistory={handleClearHistory}
                onGoToWorkouts={() => setActiveTab('workout')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                activeUser={activeUser}
                allUsers={USER_PROFILES}
                onSwitchUser={handleSwitchUser}
                logs={workoutLogs}
                onClearUserHistory={handleClearHistory}
              />
            )}
          </div>

          {/* Sticky Bottom Navigation Bar */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            activeUser={activeUser}
          />
        </div>
      )}

      {/* 3. Exercise Detail & Form Guide Modal (Modeled after FitnessAI) */}
      {selectedExerciseForGuide && (
        <ExerciseDetailModal
          exercise={selectedExerciseForGuide}
          onClose={() => setSelectedExerciseForGuide(null)}
          onStartExerciseNow={() => {
            const index = currentRoutine.exercises.findIndex(
              (item) => item.exerciseId === selectedExerciseForGuide.id
            );
            if (index !== -1) {
              handleSelectExerciseToStart(index);
            }
          }}
        />
      )}

      {/* 5. Workout Completion Summary Modal with Confetti */}
      {summaryLog && (
        <WorkoutSummaryModal
          log={summaryLog}
          activeUser={activeUser}
          onClose={() => setSummaryLog(null)}
        />
      )}

      {/* 6. Workout History Drawer */}
      {showHistory && (
        <HistoryDrawer
          logs={workoutLogs}
          activeUser={activeUser}
          onClose={() => setShowHistory(false)}
          onClearHistory={handleClearHistory}
        />
      )}

      {/* 7. Add Exercise to Routine Modal */}
      {showAddExercise && (
        <AddExerciseModal
          onClose={() => setShowAddExercise(false)}
          onAddExercise={handleAddExerciseToRoutine}
          existingExerciseIds={
            currentRoutine?.exercises ? currentRoutine.exercises.map((e) => e.exerciseId) : []
          }
        />
      )}

      {/* 8. Workout Template Modal (Create / Modify Routine) */}
      <WorkoutTemplateModal
        isOpen={isTemplateModalOpen}
        mode={templateModalMode}
        initialRoutine={templateModalRoutine}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveRoutine}
        onDelete={handleDeleteRoutine}
      />

      <style jsx>{`
        .player-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          position: relative;
        }

        .tab-layout-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .tab-scroll-viewport {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .tab-scroll-viewport::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </PhoneFrame>
  );
}
