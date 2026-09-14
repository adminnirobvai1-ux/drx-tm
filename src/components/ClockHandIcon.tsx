import React from 'react';

interface ClockHandIconProps {
  size?: number;
  className?: string;
  handClassName?: string;
  speed?: number; // seconds per rotation
}

/**
 * ClockHandIcon:
 * The outer timer body/casing remains completely stationary (does NOT spin).
 * ONLY the internal clock hand (needle) sweeps/rotates smoothly inside the dial.
 */
export const ClockHandIcon: React.FC<ClockHandIconProps> = ({
  size = 14,
  className = 'text-amber-400',
  handClassName,
  speed = 2.4,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
      style={{ verticalAlign: 'middle' }}
    >
      {/* Top Stopwatch Crown & Pusher (Stationary) */}
      <path
        d="M12 2v2M9.5 2h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Angled start button */}
      <path
        d="M18.5 5.5l1-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Outer Watch Bezel / Frame (Stationary) */}
      <circle
        cx="12"
        cy="13"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* 4 Cardinal Dial Ticks (Stationary) */}
      <line x1="12" y1="6" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="13" x2="17.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="18.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="13" x2="6.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />

      {/* Center Pivot Pin (Stationary) */}
      <circle cx="12" cy="13" r="1.4" fill="currentColor" />

      {/* Rotating Internal Clock Hand (Sweeps smoothly inside dial) */}
      <g
        className="animate-clock-hand"
        style={{
          transformBox: 'view-box',
          transformOrigin: '12px 13px',
          animationDuration: `${speed}s`,
        }}
      >
        {/* Main pointing needle */}
        <line
          x1="12"
          y1="13"
          x2="12"
          y2="6.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className={handClassName}
        />
        {/* Needle counter-balance tail */}
        <line
          x1="12"
          y1="13"
          x2="12"
          y2="15.2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
};
