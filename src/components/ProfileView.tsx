'use client';

import React from 'react';
import { UserProfile, WorkoutLog, USER_PROFILES } from '@/types/workout';
import { Award, Flame, Clock, Layers, Shield, Check, Trash2 } from 'lucide-react';

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
  const totalVolume = userLogs.reduce((acc, log) => acc + (log.totalVolumeKg || 0), 0);
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

      <style jsx>{`
        .profile-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
          padding: 24px 20px;
          color: #ffffff;
          overflow-y: auto;
        }

        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 26px 20px 20px;
          text-align: center;
        }

        .large-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 14px;
        }

        .user-display-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
        }

        .user-membership-badge {
          font-size: 0.76rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
          margin-bottom: 18px;
        }

        .profile-switcher-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .switcher-label {
          font-size: 0.74rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .switcher-buttons {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-pill);
          padding: 3px;
        }

        .switch-user-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .switch-user-btn.active {
          background: #ffffff;
          color: #09090b;
        }

        .mini-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Stats Section */
        .stats-section, .settings-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-md);
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 3px;
        }

        .stat-icon-wrap {
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .text-orange {
          color: var(--accent-orange);
        }

        .text-green {
          color: var(--accent-green);
        }

        /* Settings */
        .settings-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-md);
          padding: 8px 16px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.88rem;
        }

        .setting-row:last-child {
          border-bottom: none;
        }

        .setting-name {
          color: var(--text-secondary);
        }

        .setting-value {
          color: #ffffff;
          font-weight: 600;
        }

        .clear-data-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--accent-red);
          font-size: 0.82rem;
          padding: 12px;
          border-radius: var(--radius-md);
          background: rgba(255, 69, 58, 0.08);
          border: 1px solid rgba(255, 69, 58, 0.18);
          margin-top: 4px;
        }

        .clear-data-btn:hover {
          background: rgba(255, 69, 58, 0.16);
        }
      `}</style>
    </div>
  );
};
