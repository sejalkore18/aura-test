'use client';

import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <main className="app-container">
        {children}
      </main>

      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at 50% 15%, #15151b 0%, #08080a 75%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 24px 16px 36px;
          overflow-x: hidden;
        }

        .app-container {
          position: relative;
          width: 100%;
          max-width: 540px;
          height: 870px;
          max-height: calc(100vh - 48px);
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.85),
                      0 0 0 1px rgba(255, 255, 255, 0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 640px) {
          .app-shell {
            /* position: fixed is immune to pull-to-refresh overscroll.
               Unlike height/padding approaches, a fixed element never
               moves or recalculates during scroll gestures. */
            position: fixed;
            inset: 0;
            padding: 0;
            height: auto;
            min-height: 0;
            background: #08080a;
            overscroll-behavior: none;
            /* Carve safe areas inside the fixed shell */
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            box-sizing: border-box;
          }

          .app-container {
            max-width: 100%;
            width: 100%;
            height: 100%;
            max-height: 100%;
            min-height: 0;
            border: none;
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};
