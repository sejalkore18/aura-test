'use client';

import React from 'react';
import { UserProfile, WorkoutLog } from '@/types/workout';
import { Award, Flame, Clock, Layers, Shield, Check, Trash2 } from 'lucide-react';
import '@/styles/ProfileView.css';

interface ProfileViewProps {
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: 'sejal' | 'bhaumik') => void;
  logs: WorkoutLog[];
  onClearUserHistory: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  activeUser,
  allUsers,
  onSwitchUser,
  logs,
  onClearUserHistory,
}) => {
  const userLogs = logs.filter((l) => !l.userId || l.userId === activeUser.id);
  const totalWorkouts = userLogs.length;
  const totalVolume = userLogs.reduce((acc, log) => {
    const vol =
      log.completedExercises?.reduce(
        (exAcc, ex) =>
          exAcc +
          (ex.sets?.reduce(
            (sAcc, s) => sAcc + (s.reps || 0) * (s.weightKg > 0 ? s.weightKg : 0),
            0
          ) || 0),
        0
      ) || 0;
    return acc + vol;
  }, 0);
  const totalMinutes = userLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);

  return (
    <div className="profile-view animate-fade-in">
      {/* Profile Header Card */}
      <div className="profile-card">
        <div
          className="large-avatar"
          style={{
            backgroundColor: activeUser.avatarColor,
            boxShadow: `0 0 24px ${activeUser.avatarColor}66`,
          }}
        >
          {activeUser.initials}
        </div>

        <h1 className="user-display-name">{activeUser.name}</h1>
        <span className="user-membership-badge">Aura Gym Athlete</span>

        {/* Profile Switcher Pills */}
        <div className="profile-switcher-pill">
          <span className="switcher-label">Active Profile:</span>
          <div className="switcher-buttons">
            {allUsers.map((user) => {
              const isActive = user.id === activeUser.id;
              return (
                <button
                  key={user.id}
                  className={`switch-user-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSwitchUser(user.id)}
                >
                  <span
                    className="mini-dot"
                    style={{ backgroundColor: user.avatarColor }}
                  />
                  <span>{user.name}</span>
                  {isActive && <Check size={13} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lifetime Stats Section */}
      <section className="stats-section">
        <h2 className="section-title">
          <Award size={16} />
          <span>Lifetime Performance</span>
        </h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Layers size={18} />
            </div>
            <span className="stat-number">{totalWorkouts}</span>
            <span className="stat-label">Workouts</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Flame size={18} className="text-orange" />
            </div>
            <span className="stat-number">{Math.round(totalVolume)}</span>
            <span className="stat-label">Total kg Lifted</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Clock size={18} />
            </div>
            <span className="stat-number">{totalMinutes}</span>
            <span className="stat-label">Total Minutes</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Shield size={18} className="text-green" />
            </div>
            <span className="stat-number">{totalWorkouts > 0 ? 'Active' : 'Ready'}</span>
            <span className="stat-label">Status</span>
          </div>
        </div>
      </section>

      {/* Preferences & Reset */}
      <section className="settings-section">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-card">
          <div className="setting-row">
            <span className="setting-name">Weight Unit</span>
            <span className="setting-value">Kilograms (kg)</span>
          </div>
          <div className="setting-row">
            <span className="setting-name">Rest Period Default</span>
            <span className="setting-value">60 Seconds</span>
          </div>
        </div>

        {totalWorkouts > 0 && (
          <button className="clear-data-btn" onClick={onClearUserHistory}>
            <Trash2 size={14} />
            <span>Reset {activeUser.name}&apos;s Workout History</span>
          </button>
        )}
      </section>
    </div>
  );
};
