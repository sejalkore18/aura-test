'use client';

import React from 'react';
import { LayoutGrid, Dumbbell, BookOpen, TrendingUp, User } from 'lucide-react';
import { UserProfile } from '@/types/workout';

export type NavTab = 'dashboard' | 'workout' | 'library' | 'history' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeUser: UserProfile;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  activeUser,
}) => {
  const isDashboard = activeTab === 'dashboard';

  const tabs = [
    {
      id: 'dashboard' as NavTab,
      label: 'Home',
      icon: LayoutGrid,
    },
    {
      id: 'workout' as NavTab,
      label: 'Workout',
      icon: Dumbbell,
    },
    {
      id: 'library' as NavTab,
      label: 'Exercises',
      icon: BookOpen,
    },
    {
      id: 'history' as NavTab,
      label: 'Progress',
      icon: TrendingUp,
    },
    {
      id: 'profile' as NavTab,
      label: activeUser.name,
      icon: User,
      customAvatar: true,
    },
  ];

  return (
    <nav className="footer-nav-bar" aria-label="Main Navigation">
      <div className="nav-items-wrapper">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              aria-selected={isActive}
              role="tab"
            >
              <div className="icon-container">
                {tab.customAvatar ? (
                  <div
                    className="avatar-icon"
                    style={{
                      backgroundColor: activeUser.avatarColor,
                      boxShadow: isActive
                        ? `0 0 8px ${activeUser.avatarColor}44`
                        : 'none',
                    }}
                  >
                    {activeUser.initials}
                  </div>
                ) : (
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    fill="none"
                  />
                )}
              </div>
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .footer-nav-bar {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 60;
          flex-shrink: 0;
          padding: 8px 16px 14px;
          margin-top: auto;
          background: rgba(14, 14, 18, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nav-items-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-around;
          max-width: 500px;
          margin: 0 auto;
        }

        .nav-tab-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 4px 12px;
          border-radius: var(--radius-md);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          min-width: 56px;
        }

        .nav-tab-btn:hover {
          color: #ffffff;
        }

        .nav-tab-btn.active {
          color: #ffffff;
        }

        .icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
        }

        .avatar-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
          color: #ffffff;
          transition: transform 0.2s ease;
        }

        .nav-tab-btn.active .avatar-icon {
          transform: scale(1.1);
        }

        .tab-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          font-family: var(--font-body);
        }

        .nav-tab-btn.active .tab-label {
          color: #ffffff;
        }
      `}</style>
    </nav>
  );
};
