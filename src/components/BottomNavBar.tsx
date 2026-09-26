'use client';

import React from 'react';
import { LayoutGrid, Dumbbell, BookOpen, TrendingUp, User } from 'lucide-react';
import { UserProfile } from '@/types/workout';
import '@/styles/BottomNavBar.css';

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
    </nav>
  );
};
