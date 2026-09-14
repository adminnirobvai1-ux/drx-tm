/**
 * Sub-header: Server Status & Digital Clock Component
 * Displays live server ping and synchronized digital clock.
 */

import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { clockEngine } from '../engine/clockEngine.ts';
import type { ClockState } from '../types/index.ts';

interface ServerStatusBarProps {
  serverStatusText?: string;
}

export const ServerStatusBar: React.FC<ServerStatusBarProps> = ({
  serverStatusText = 'LIVE SERVER',
}) => {
  const [clock, setClock] = useState<ClockState>(clockEngine.getCurrentState());

  useEffect(() => {
    clockEngine.start();
    const unsubscribe = clockEngine.subscribe((newClock) => {
      setClock(newClock);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <section
      id="server-status-bar"
      className="px-4 py-2 border-b-[1.8px] border-[#0b1a3d] bg-[#f9fbfe]/90 backdrop-blur-sm flex items-center justify-between text-[#0b1a3d] text-[11px] font-mono-tech tracking-wider select-none"
    >
      <div className="flex items-center space-x-1.5">
        <Radio size={14} className="text-[#0b1a3d]" />
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
        <span className="font-bold">{serverStatusText}</span>
      </div>

      <div
        id="liveClock"
        className="font-bold tracking-widest text-[#0b1a3d]"
      >
        {clock.fullTimeString}
      </div>
    </section>
  );
};
