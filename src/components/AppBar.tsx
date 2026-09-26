'use client';

import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { UserProfile } from '@/types/workout';
import '@/styles/AppBar.css';

interface AppBarProps {
  title?: string;
  subtitle?: string;
  showBackButton: boolean;
  onBack: () => void;
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: 'sejal' | 'bhaumik') => void;
  showUserSwitcher?: boolean;
  transparentBackButton?: boolean;
  titlePosition?: 'center' | 'left';
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  showBackButton,
  onBack,
  activeUser,
  allUsers,
  onSwitchUser,
  showUserSwitcher = true,
  transparentBackButton = false,
  titlePosition = 'center',
}) => {
  return (
    <header className="app-bar">
      {/* Left Slot: Back Button OR Branding */}
      <div className={`left-slot ${titlePosition === 'left' ? 'left-aligned-title' : ''}`}>
        {showBackButton ? (
          <>
            <button
              className={`appbar-back-btn ${transparentBackButton ? 'ghost-back' : ''}`}
              onClick={onBack}
              aria-label="Go Back"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            {titlePosition === 'left' && title && (
              <h1 className="appbar-left-title">{title}</h1>
            )}
          </>
        ) : (
          <div className="appbar-brand">
            <Sparkles size={16} className="brand-icon" />
            <span className="brand-text">AURA</span>
          </div>
        )}
      </div>

      {/* Center Slot: Dynamic Screen Title (when centered) */}
      {titlePosition !== 'left' && (
        <div className="center-slot">
          {title && <h1 className="appbar-title">{title}</h1>}
          {subtitle && <span className="appbar-subtitle">{subtitle}</span>}
        </div>
      )}

      {/* Right Slot: User Profile Switcher */}
      {showUserSwitcher && (
        <div className="right-slot">
          <div className="profile-pill-toggle">
            {allUsers.map((user) => {
              const isActive = user.id === activeUser.id;
              return (
                <button
                  key={user.id}
                  className={`profile-chip ${isActive ? 'active' : ''}`}
                  onClick={() => onSwitchUser(user.id)}
                  title={`Switch to ${user.name}`}
                >
                  <span
                    className="chip-avatar"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.initials}
                  </span>
                  <span className="chip-name">{user.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
