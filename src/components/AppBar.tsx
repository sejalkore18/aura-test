'use client';

import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { UserProfile } from '@/types/workout';

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

      <style jsx>{`
        .app-bar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 70;
          height: 56px;
          background: rgba(8, 8, 10, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          flex-shrink: 0;
        }

        .left-slot {
          display: flex;
          align-items: center;
          min-width: 90px;
        }

        .left-slot.left-aligned-title {
          flex: 1;
          gap: 8px;
          min-width: 0;
        }

        .appbar-left-title {
          font-family: var(--font-display);
          font-size: 1.08rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.015em;
          margin: 0;
          line-height: 1.2;
        }

        .appbar-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: #ffffff;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .appbar-back-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateX(-2px);
        }

        .appbar-back-btn:active {
          transform: scale(0.94);
        }

        .appbar-back-btn.ghost-back {
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .appbar-back-btn.ghost-back:hover {
          background: transparent;
          transform: translateX(-3px);
          opacity: 0.8;
        }

        .appbar-back-btn.ghost-back:active {
          transform: scale(0.92) translateX(-3px);
          opacity: 0.65;
        }

        .appbar-brand {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        :global(.brand-icon) {
          color: #ff9f0a;
        }

        .brand-text {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #ffffff;
        }

        .center-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
          padding: 0 8px;
          overflow: hidden;
        }

        .appbar-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
          letter-spacing: -0.01em;
        }

        .appbar-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: -1px;
        }

        .right-slot {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-width: 90px;
        }

        .profile-pill-toggle {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-pill);
          padding: 2px;
        }

        .profile-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: var(--radius-pill);
          color: var(--text-muted);
          font-size: 0.74rem;
          font-weight: 600;
          background: transparent;
          border: none;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .profile-chip:hover {
          color: #ffffff;
        }

        .profile-chip.active {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
        }

        .chip-avatar {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 800;
          color: #ffffff;
        }

        .chip-name {
          font-family: var(--font-display);
        }

        @media (max-width: 480px) {
          .chip-name {
            display: none;
          }
          .profile-chip {
            padding: 3px 5px;
          }
        }
      `}</style>
    </header>
  );
};
