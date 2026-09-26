'use client';

import React from 'react';
import '@/styles/PhoneFrame.css';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <main className="app-container">
        {children}
      </main>
    </div>
  );
};
