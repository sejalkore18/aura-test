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
import { SplashScreen } from '@/components/SplashScreen';
import {
  WorkoutRoutine,
  WorkoutSet,
  WorkoutLog,
  Exercise,
  RoutineExercise,
  UserProfile,
  USER_PROFILES,
  DayKey,
} from '@/types/workout';
import { getExerciseById, EXERCISE_LIBRARY } from '@/data/exercises';
import {
  syncBatchLogsToCloud,
  fetchWorkoutLogsFromCloud,
  syncRoutinesToCloud,
  fetchRoutinesFromCloud,
  deleteWorkoutLogInCloud,
  deleteRoutineInCloud,
} from '@/lib/syncService';

export default function HomePage() {
  // 0. User Profile State (Sejal and Bhaumik)
  const [activeUserId, setActiveUserId] = useState<'sejal' | 'bhaumik'>('sejal');
  const activeUser: UserProfile =
    USER_PROFILES.find((u) => u.id === activeUserId) || USER_PROFILES[0];

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // 1. Routine State
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [currentRoutineId, setCurrentRoutineId] = useState<string>('');

  // 2. Active Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isPlayerViewOpen, setIsPlayerViewOpen] = useState<boolean>(false);
  const [selectedSummaryRoutineId, setSelectedSummaryRoutineId] = useState<string | null>(null);
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
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  // Template Modal State (Create / Edit Routine)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [templateModalMode, setTemplateModalMode] = useState<'create' | 'edit'>('create');
  const [templateModalRoutine, setTemplateModalRoutine] = useState<WorkoutRoutine | null>(null);

  // App Initial / Refresh Loading Splash Screen State
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter routines visible to the active user (strictly per user)
  const visibleRoutines = routines.filter(
    (r) => r.userId === activeUserId || (!r.userId && activeUserId === 'sejal')
  );

  // Find active routine object from visible routines
  const currentRoutine: WorkoutRoutine =
    visibleRoutines.find((r) => r.id === currentRoutineId) ||
    visibleRoutines[0] || {
      id: '',
      title: 'Workout',
      estimatedMinutes: 0,
      exercises: [],
    };

  // Derive today's scheduled routine
  const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayDayKey: DayKey = DAY_KEYS[new Date().getDay()];
  const todayRoutine: WorkoutRoutine | undefined = visibleRoutines.find(
    (r) => r.scheduledDays && r.scheduledDays.includes(todayDayKey)
  );
  const isRestDay = !todayRoutine;

  // Initialize and load directly from database (with offline cache fallback)
  useEffect(() => {
    try {
      // Load active user profile
      const savedUserId = localStorage.getItem('aura_active_user');
      if (savedUserId === 'sejal' || savedUserId === 'bhaumik') {
        setActiveUserId(savedUserId);
      }

      // Load saved logs, filtering out any legacy mock logs
      const savedLogs = localStorage.getItem('aura_workout_logs');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonMockLogs = parsed.filter(
            (l: WorkoutLog) => !l.id?.startsWith('log_bhaumik_') && !l.id?.startsWith('log_sejal_')
          );
          setWorkoutLogs(nonMockLogs);
          localStorage.setItem('aura_workout_logs', JSON.stringify(nonMockLogs));
        } else {
          setWorkoutLogs([]);
        }
      } else {
        setWorkoutLogs([]);
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

    // Always fetch the latest data from MongoDB Atlas
    const syncWithCloud = async () => {
      try {
        // 1. Fetch real workout logs from MongoDB
        const cloudLogs = await fetchWorkoutLogsFromCloud();
        if (cloudLogs) {
          setWorkoutLogs(cloudLogs);
          try {
            localStorage.setItem('aura_workout_logs', JSON.stringify(cloudLogs));
          } catch {
            // ignore
          }
        }

        // 2. Fetch routines directly from MongoDB
        const cloudRoutines = await fetchRoutinesFromCloud();
        if (cloudRoutines) {
          setRoutines(cloudRoutines);
          try {
            localStorage.setItem('aura_routines', JSON.stringify(cloudRoutines));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('MongoDB sync notice:', err);
      }
    };

    syncWithCloud();
  }, []);

  // Switch Active User Profile
  const handleSwitchUser = (userId: 'sejal' | 'bhaumik') => {
    setActiveUserId(userId);
    try {
      localStorage.setItem('aura_active_user', userId);
    } catch {
      // ignore
    }

    // Switch active routine to one visible to the new user if needed
    const nextUserRoutines = routines.filter(
      (r) => r.userId === userId || (!r.userId && userId === 'sejal')
    );
    if (nextUserRoutines.length > 0 && !nextUserRoutines.some((r) => r.id === currentRoutineId)) {
      setCurrentRoutineId(nextUserRoutines[0].id);
    }
  };

  // Save logs to localStorage and sync with MongoDB Atlas
  const saveWorkoutLogs = (newLogs: WorkoutLog[]) => {
    setWorkoutLogs(newLogs);
    try {
      localStorage.setItem('aura_workout_logs', JSON.stringify(newLogs));
    } catch {
      // ignore
    }
    syncBatchLogsToCloud(newLogs);
  };

  // Save routines to localStorage and sync with MongoDB Atlas
  const saveRoutines = (newRoutines: WorkoutRoutine[]) => {
    setRoutines(newRoutines);
    try {
      localStorage.setItem('aura_routines', JSON.stringify(newRoutines));
    } catch {
      // ignore
    }
    syncRoutinesToCloud(newRoutines);
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

    const activeRoutineId = targetRoutineId || currentRoutineId;
    setSelectedSummaryRoutineId(activeRoutineId);

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

    const activeRoutineId = targetRoutineId || currentRoutineId;
    setSelectedSummaryRoutineId(activeRoutineId);

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

    const allSetsCompleted = updatedSets.every((s) => s.completed);
    const isLastExerciseOfRoutine = currentExerciseIndex === currentRoutine.exercises.length - 1;

    if (allSetsCompleted && isLastExerciseOfRoutine) {
      // First put a check on the last set, then finish workout
      setTimeout(() => {
        finishWorkout(newProgress);
      }, 600);
    } else if (allSetsCompleted) {
      // First put a check on the last set, then move to next exercise
      setTimeout(() => {
        const nextExIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextExIndex);
        setCurrentSetIndex(0);
      }, 600);
    } else {
      // Advance to next incomplete set in current exercise
      const nextIncompleteIdx = updatedSets.findIndex((s, i) => i > setIndex && !s.completed);
      const fallbackIncompleteIdx = updatedSets.findIndex((s) => !s.completed);
      const nextIdx =
        nextIncompleteIdx !== -1
          ? nextIncompleteIdx
          : fallbackIncompleteIdx !== -1
          ? fallbackIncompleteIdx
          : Math.min(setIndex + 1, updatedSets.length - 1);
      setCurrentSetIndex(nextIdx);
    }
  };

  // Toggle set completion (unmark if completed)
  const handleToggleSet = (setIndex: number) => {
    const currentEx = currentRoutine.exercises[currentExerciseIndex];
    if (!currentEx) return;

    const existingSets = getSetsForExercise(
      currentEx.exerciseId,
      currentEx.targetSets,
      currentEx.targetReps,
      currentEx.targetWeightKg
    );

    const targetSet = existingSets[setIndex];
    if (!targetSet) return;

    if (targetSet.completed) {
      const updatedSets = [...existingSets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        completed: false,
        completedAt: undefined,
      };
      setExerciseProgress({
        ...exerciseProgress,
        [currentEx.exerciseId]: updatedSets,
      });
      setCurrentSetIndex(setIndex);
    }
  };

  // Finish Workout and compute summary log
  const finishWorkout = (finalProgress: Record<string, WorkoutSet[]>) => {
    const durationMins = sessionStartTime
      ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
      : currentRoutine.estimatedMinutes;

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

    const newLog: WorkoutLog = {
      id: `log_${Date.now()}`,
      userId: activeUserId,
      workoutId: currentRoutine.id,
      workoutTitle: currentRoutine.title,
      durationMinutes: durationMins,
      completedExercises: completedExercisesList,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...workoutLogs];
    saveWorkoutLogs(updatedLogs);

    // Reset active session and show celebratory modal
    setIsSessionActive(false);
    setIsPlayerViewOpen(false);
    setSelectedSummaryRoutineId(null);
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

    saveRoutines(updatedRoutines);
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
    const routineWithUser: WorkoutRoutine = {
      ...savedRoutine,
      userId: activeUserId,
    };

    let updatedRoutines: WorkoutRoutine[];
    const exists = routines.some((r) => r.id === routineWithUser.id);

    if (exists) {
      updatedRoutines = routines.map((r) =>
        r.id === routineWithUser.id ? routineWithUser : r
      );
    } else {
      updatedRoutines = [...routines, routineWithUser];
    }

    saveRoutines(updatedRoutines);
    setCurrentRoutineId(routineWithUser.id);

    try {
      localStorage.setItem('aura_current_routine_id', routineWithUser.id);
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
    const updatedRoutines = routines.filter((r) => r.id !== routineId);
    saveRoutines(updatedRoutines);
    deleteRoutineInCloud(routineId);

    if (currentRoutineId === routineId) {
      const remainingUserRoutines = updatedRoutines.filter(
        (r) => r.userId === activeUserId || (!r.userId && activeUserId === 'sejal')
      );
      const fallbackId = remainingUserRoutines[0]?.id || '';
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
    item.sets = targetSets;

    exList[exerciseIndex] = item;

    const updatedRoutine: WorkoutRoutine = {
      ...currentRoutine,
      exercises: exList,
    };

    const updatedRoutines = routines.map((r) =>
      r.id === currentRoutine.id ? updatedRoutine : r
    );

    saveRoutines(updatedRoutines);

    if (exerciseProgress[item.exerciseId]) {
      setExerciseProgress((prev) => ({
        ...prev,
        [item.exerciseId]: Array.from({ length: targetSets }, (_, i) => ({
          setNumber: i + 1,
          targetReps,
          actualReps: targetReps,
          weightKg: targetWeightKg,
          completed: false,
        })),
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

    saveRoutines(updatedRoutines);

    if (currentExerciseIndex >= updatedExercises.length) {
      setCurrentExerciseIndex(Math.max(0, updatedExercises.length - 1));
      setCurrentSetIndex(0);
    }
  };

  // Reset Today's Workout Progress
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

  // Delete single workout log
  const handleDeleteWorkoutLog = (logId: string) => {
    const updated = workoutLogs.filter((l) => l.id !== logId);
    saveWorkoutLogs(updated);
    deleteWorkoutLogInCloud(logId);
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

  const handleBackToWorkoutSummary = () => {
    setIsPlayerViewOpen(false);
    setActiveTab('workout');
    setSelectedSummaryRoutineId(currentRoutineId);
  };

  const handleAppBarBack = () => {
    if (isPlayerViewOpen) {
      handleBackToWorkoutSummary();
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
        return undefined;
      case 'history':
        return undefined;
      case 'profile':
        return 'Athlete Stats';
    }
  };

  return (
    <PhoneFrame>
      {/* App Refresh / Initial Loading Splash Screen */}
      {isLoading && (
        <SplashScreen onComplete={() => setIsLoading(false)} />
      )}

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
          showUserSwitcher={!['history', 'workout', 'library'].includes(activeTab) && !isPlayerViewOpen}
          transparentBackButton={['history', 'workout', 'library'].includes(activeTab)}
          titlePosition={['history', 'workout', 'library'].includes(activeTab) ? 'left' : 'center'}
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
            onBackToOverview={handleBackToWorkoutSummary}
            onSetChange={(idx) => setCurrentSetIndex(idx)}
            onUpdateSet={handleUpdateSet}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onCompleteSet={handleCompleteSet}
            onToggleSet={handleToggleSet}
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
                currentRoutine={todayRoutine ?? currentRoutine}
                isRestDay={isRestDay}
                isSessionActive={isSessionActive}
                completedExerciseIds={completedExerciseIds}
                workoutLogs={workoutLogs}
                onStartWorkout={() => {
                  setIsPlayerViewOpen(false);
                  setSelectedSummaryRoutineId(null);
                  setActiveTab('workout');
                }}
                onSelectExercise={(idx) => {
                  setActiveTab('workout');
                  handleSelectExerciseToStart(idx);
                }}
                onOpenExerciseDetails={(ex) => setSelectedExerciseForGuide(ex)}
                onGoToWorkoutTab={() => {
                  setIsPlayerViewOpen(false);
                  setSelectedSummaryRoutineId(null);
                  setActiveTab('workout');
                }}
                onGoToHistoryTab={() => setActiveTab('history')}
                onRefresh={() => {
                  setTimeout(() => {
                    window.location.reload();
                  }, 350);
                }}
              />
            )}

            {activeTab === 'workout' && (
              <WorkoutOverview
                routine={currentRoutine}
                allRoutines={visibleRoutines}
                selectedSummaryRoutineId={selectedSummaryRoutineId}
                onSelectSummaryRoutine={setSelectedSummaryRoutineId}
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
                onDeleteLog={handleDeleteWorkoutLog}
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
