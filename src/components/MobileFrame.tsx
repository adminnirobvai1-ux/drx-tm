/**
 * Mobile Frame Container Component
 * Matches the exact blueprint-grid layout, borders, and shadows.
 */

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="blueprint-grid min-h-screen flex justify-center py-0 sm:py-6 px-0 sm:px-4">
      <main
        id="mobile-terminal-frame"
        className="w-full max-w-[425px] bg-[#f9fbfe] blueprint-grid min-h-screen sm:min-h-[860px] flex flex-col sm:border-[2px] sm:border-[#0b1a3d] sm:rounded-[22px] sm:shadow-2xl overflow-hidden relative pb-12"
      >
        {children}
      </main>
    </div>
  );
};
