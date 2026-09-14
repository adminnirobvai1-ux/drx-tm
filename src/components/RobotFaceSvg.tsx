import React, { useEffect, useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RobotAnimation } from '../types/robot.ts';

export type { RobotAnimation };

interface RobotFaceSvgProps {
  animation: RobotAnimation;
  onFaceClick?: () => void;
}

export const RobotFaceSvg: React.FC<RobotFaceSvgProps> = ({
  animation,
  onFaceClick,
}) => {
  const filterId = useId().replace(/:/g, '');
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (
      animation === 'shock' ||
      animation === 'angry' ||
      animation === 'sleep' ||
      animation === 'scan' ||
      animation === 'glitch'
    ) {
      return;
    }
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4000);
    return () => clearInterval(interval);
  }, [animation]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animation === 'sleep' || animation === 'scan' || animation === 'waiting') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
    setMousePos({ x: dx * 10, y: dy * 7 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const getThemeColors = () => {
    switch (animation) {
      case 'angry':
        return { glow: '#dc2626', visorTint: '#2b0707', eyeColor: '#ef4444' };
      case 'love':
        return { glow: '#f43f5e', visorTint: '#1c0914', eyeColor: '#fb7185' };
      case 'shock':
        return { glow: '#f59e0b', visorTint: '#1f1505', eyeColor: '#fbbf24' };
      case 'confused':
        return { glow: '#eab308', visorTint: '#181404', eyeColor: '#facc15' };
      case 'idea':
        return { glow: '#c084fc', visorTint: '#140c24', eyeColor: '#fef08a' };
      case 'tense':
        return { glow: '#f97316', visorTint: '#211005', eyeColor: '#fb923c' };
      case 'scan':
        return { glow: '#38bdf8', visorTint: '#041220', eyeColor: '#00f0ff' };
      case 'sleep':
        return { glow: '#6366f1', visorTint: '#070a18', eyeColor: '#818cf8' };
      case 'sad':
        return { glow: '#0284c7', visorTint: '#03101c', eyeColor: '#38bdf8' };
      case 'cool':
        return { glow: '#a855f7', visorTint: '#0d0718', eyeColor: '#c084fc' };
      default:
        return { glow: '#a855f7', visorTint: '#060913', eyeColor: '#c084fc' };
    }
  };

  const theme = getThemeColors();

  const headVariants = {
    shock: {
      y: [-2, -24, -18],
      scale: [1, 1.08, 1.05],
      rotate: [0, -1.5, 0],
      transition: { duration: 0.45, ease: 'easeOut' as const },
    },
    angry: {
      x: [-3.5, 3.5, -3, 3, -1.5, 1.5, 0],
      y: [-2, 3, -1, 2, 0],
      scale: [1.02, 1.05, 1.03],
      transition: { duration: 0.12, repeat: Infinity, ease: 'linear' as const },
    },
    love: {
      y: [0, -10, 0],
      scale: [1, 1.035, 1],
      rotate: [0, 1.5, 0, -1.5, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
    confused: {
      rotate: [-11, -8, -11],
      y: -6,
      x: -4,
      transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
    },
    idea: {
      y: [0, -16, 0],
      scale: [1, 1.06, 1],
      transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' as const },
    },
    waiting: {
      rotate: [-3, 3, -3],
      y: [0, 2, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    sleep: {
      y: [10, 15, 10],
      rotate: 4,
      opacity: 0.88,
      transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    tense: {
      x: [-2, 2, -2],
      y: [-1, 1, -1],
      transition: { duration: 0.08, repeat: Infinity, ease: 'linear' as const },
    },
    scan: { y: 0, rotate: 0, scale: 1.01, transition: { duration: 0.3 } },
    laugh: {
      y: [0, -18, 0, -10, 0],
      rotate: [-2.5, 2.5, -2.5],
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' as const },
    },
    cool: {
      y: [0, -6, 0],
      rotate: [-2, 2, -2],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    sad: { y: 8, rotate: -3, scale: 0.98, transition: { duration: 0.6 } },
    glitch: {
      x: [0, -7, 8, -4, 5, 0],
      skewX: [0, 5, -5, 2, 0],
      transition: { duration: 0.2, repeat: Infinity, ease: 'linear' as const },
    },
    wink: {
      y: -6,
      rotate: -4,
      transition: { type: 'spring' as const, stiffness: 280, damping: 14 },
    },
    neutral: {
      y: [0, -5, 0],
      rotate: [0, 0.6, 0, -0.6, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  return (
    <div className="relative w-full max-w-[480px] aspect-square mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full overflow-visible drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onFaceClick}
      >
        <defs>
          <linearGradient id={`${filterId}-whiteArmor`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id={`${filterId}-blackChassis`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#181e28" />
            <stop offset="60%" stopColor="#0a0e16" />
            <stop offset="100%" stopColor="#04060a" />
          </linearGradient>

          <radialGradient id={`${filterId}-visorOled`} cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor={theme.visorTint} />
            <stop offset="70%" stopColor="#04060c" />
            <stop offset="100%" stopColor="#010205" />
          </radialGradient>

          <linearGradient id={`${filterId}-glassGlare`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor={theme.glow} stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id={`${filterId}-scanBeam`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="95%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
          </linearGradient>

          <filter id={`${filterId}-laserGlow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blurWide" />
            <feGaussianBlur stdDeviation="3" result="blurSharp" />
            <feMerge>
              <feMergeNode in="blurWide" />
              <feMergeNode in="blurSharp" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`${filterId}-sharpGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.ellipse
          cx="250"
          cy="462"
          rx="140"
          ry="14"
          fill="#000000"
          opacity="0.75"
          filter="blur(16px)"
          animate={{
            rx: [135, 145, 135],
            opacity: animation === 'angry' ? 0.9 : 0.75,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatePresence>
          {animation === 'idea' && (
            <motion.g
              key="fx-idea"
              initial={{ scale: 0, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 15 }}
              transform="translate(250, 42)"
            >
              <circle cx="0" cy="0" r="14" fill="#fef08a" stroke="#eab308" strokeWidth="2" filter={`url(#${filterId}-laserGlow)`} />
              <path d="M -5 10 L 5 10 L 4 16 L -4 16 Z" fill="#94a3b8" stroke="#000000" strokeWidth="1" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="-18"
                  x2="0"
                  y2="-26"
                  stroke="#eab308"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 0 0)`}
                  filter={`url(#${filterId}-sharpGlow)`}
                />
              ))}
            </motion.g>
          )}

          {animation === 'confused' && (
            <motion.g
              key="fx-confused"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              transform="translate(372, 135)"
            >
              <path
                d="M -7 -18 C -7 -30 14 -32 14 -16 C 14 -6 0 -1 0 8"
                fill="none"
                stroke="#eab308"
                strokeWidth="5"
                strokeLinecap="round"
                filter={`url(#${filterId}-laserGlow)`}
              />
              <circle cx="0" cy="18" r="3.5" fill="#eab308" filter={`url(#${filterId}-laserGlow)`} />
            </motion.g>
          )}

          {animation === 'tense' && (
            <motion.g
              key="fx-sweat"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, repeat: Infinity }}
              transform="translate(362, 168)"
            >
              <path
                d="M 0 0 C 4 6 7 12 7 16 C 7 21 3 24 0 24 C -3 24 -7 21 -7 16 C -7 12 -4 6 0 0 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1.5"
                filter={`url(#${filterId}-sharpGlow)`}
              />
              <circle cx="-2" cy="14" r="1.5" fill="#ffffff" />
            </motion.g>
          )}

          {animation === 'sleep' && (
            <motion.g
              key="fx-sleep"
              transform="translate(378, 142)"
              animate={{ y: [0, -12, 0], opacity: [0.3, 0.95, 0.3] }}
              transition={{ duration: 2.6, repeat: Infinity }}
            >
              <text x="0" y="0" fill="#818cf8" fontSize="22" fontWeight="bold" fontFamily="monospace" filter={`url(#${filterId}-sharpGlow)`}>
                Z
              </text>
              <text x="14" y="-12" fill="#a5b4fc" fontSize="15" fontWeight="bold" fontFamily="monospace">
                z
              </text>
            </motion.g>
          )}

          {animation === 'love' && (
            <motion.g key="fx-love-bubbles">
              <motion.path
                d="M 374 210 l -2.2 -2 C -10 6 -15 1 -15 -5 C -15 -10 -11 -13.5 -6 -13.5 C -3.3 -13.5 -1 -12 0 -9.5 C 1 -12 3.3 -13.5 6 -13.5 C 11 -13.5 15 -10 15 -5 C 15 1 10 6 2.2 12.8 L 0 15 Z"
                fill="#f43f5e"
                filter={`url(#${filterId}-sharpGlow)`}
                transform="translate(375, 205) scale(0.65)"
                animate={{ y: [0, -14, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        <motion.g
          id="robot-head-assembly"
          animate={animation}
          variants={headVariants}
          style={{ originX: '250px', originY: '270px' }}
        >
          <g id="top-sensor-crest">
            <rect
              x="214"
              y="60"
              width="72"
              height="36"
              rx="6"
              fill={`url(#${filterId}-blackChassis)`}
              stroke="#000000"
              strokeWidth="4"
            />
            <rect
              x="216"
              y="62"
              width="68"
              height="32"
              rx="4"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <rect
              x="226"
              y="72"
              width="20"
              height="8"
              rx="3"
              fill={animation === 'angry' ? '#ef4444' : '#a855f7'}
              filter={`url(#${filterId}-sharpGlow)`}
            />
            <rect
              x="254"
              y="72"
              width="20"
              height="8"
              rx="3"
              fill="#dc2626"
              filter={`url(#${filterId}-sharpGlow)`}
            />
          </g>

          <g transform="translate(46, 185)">
            <path
              d="M 28 0 L 0 24 L 0 90 L 28 114 Z"
              fill={`url(#${filterId}-whiteArmor)`}
              stroke="#000000"
              strokeWidth="4.5"
            />
            <path
              d="M 26 5 L 4 26 L 4 88 L 26 108 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <line x1="8" y1="36" x2="22" y2="36" stroke="#a855f7" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
            <line x1="8" y1="58" x2="22" y2="58" stroke="#dc2626" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
            <line x1="8" y1="80" x2="22" y2="80" stroke="#a855f7" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
          </g>

          <g transform="translate(426, 185)">
            <path
              d="M 0 0 L 28 24 L 28 90 L 0 114 Z"
              fill={`url(#${filterId}-whiteArmor)`}
              stroke="#000000"
              strokeWidth="4.5"
            />
            <path
              d="M 2 5 L 24 26 L 24 88 L 2 108 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <line x1="6" y1="36" x2="20" y2="36" stroke="#a855f7" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
            <line x1="6" y1="58" x2="20" y2="58" stroke="#dc2626" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
            <line x1="6" y1="80" x2="20" y2="80" stroke="#a855f7" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
          </g>

          <rect
            x="68"
            y="90"
            width="364"
            height="332"
            rx="56"
            fill={`url(#${filterId}-whiteArmor)`}
            stroke="#000000"
            strokeWidth="5"
          />

          <rect
            x="72"
            y="94"
            width="356"
            height="324"
            rx="52"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          />

          <path
            d="M 72 250 L 96 250 L 96 370 L 72 350 Z"
            fill="#090d16"
            stroke="#000000"
            strokeWidth="3"
          />
          <path
            d="M 428 250 L 404 250 L 404 370 L 428 350 Z"
            fill="#090d16"
            stroke="#000000"
            strokeWidth="3"
          />

          <g transform="translate(140, 106)">
            <line x1="0" y1="0" x2="220" y2="0" stroke="#000000" strokeWidth="3" />
            <line x1="2" y1="0" x2="105" y2="0" stroke="#a855f7" strokeWidth="2.5" filter={`url(#${filterId}-sharpGlow)`} />
            <line x1="115" y1="0" x2="218" y2="0" stroke="#dc2626" strokeWidth="2.5" filter={`url(#${filterId}-sharpGlow)`} />
          </g>

          <rect
            x="96"
            y="126"
            width="308"
            height="250"
            rx="40"
            fill={`url(#${filterId}-visorOled)`}
            stroke="#000000"
            strokeWidth="5"
          />

          <rect
            x="99"
            y="129"
            width="302"
            height="244"
            rx="37"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          <path
            d="M 112 140 Q 250 162 388 140 L 378 178 Q 250 198 122 178 Z"
            fill={`url(#${filterId}-glassGlare)`}
            className="pointer-events-none"
          />

          <g className="pointer-events-none">
            <motion.g
              animate={{
                y: animation === 'scan' ? [0, 210, 0] : [0, 220, 0],
              }}
              transition={{
                duration: animation === 'scan' ? 1.5 : 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <rect
                x="100"
                y="130"
                width="300"
                height="28"
                fill={`url(#${filterId}-scanBeam)`}
                opacity={animation === 'scan' ? 0.9 : 0.35}
              />
              <line
                x1="102"
                y1="158"
                x2="398"
                y2="158"
                stroke={animation === 'scan' ? '#00f0ff' : theme.glow}
                strokeWidth={animation === 'scan' ? '2.5' : '1.5'}
                filter={`url(#${filterId}-laserGlow)`}
                opacity={animation === 'scan' ? 1 : 0.5}
              />
            </motion.g>

            {animation === 'scan' && (
              <g opacity="0.85">
                <path d="M 116 150 L 116 142 L 126 142" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 384 150 L 384 142 L 374 142" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 116 348 L 116 356 L 126 356" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 384 348 L 384 356 L 374 356" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="250" cy="245" r="32" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="250" cy="245" r="48" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="8 6" opacity="0.5" />
              </g>
            )}
          </g>

          <motion.g
            id="ocular-eyes"
            animate={{
              filter: [
                'drop-shadow(0 0 2px rgba(0,240,255,0.4)) drop-shadow(0 0 6px rgba(0,240,255,0.6))',
                'drop-shadow(0 0 5px rgba(0,240,255,0.9)) drop-shadow(0 0 14px rgba(0,240,255,0.95))',
                'drop-shadow(0 0 2px rgba(0,240,255,0.4)) drop-shadow(0 0 6px rgba(0,240,255,0.6))',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <g transform="translate(182, 218)">
              {isBlinking && animation !== 'sleep' && animation !== 'shock' && animation !== 'angry' ? (
                <line
                  x1="-26"
                  y1="0"
                  x2="26"
                  y2="0"
                  stroke={theme.eyeColor}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter={`url(#${filterId}-laserGlow)`}
                />
              ) : animation === 'shock' ? (
                <g>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="-28"
                      x2="0"
                      y2="-36"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      transform={`rotate(${deg} 0 0)`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="28" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 3" />
                  <circle cx="0" cy="0" r="22" fill="#fbbf24" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="0" cy="0" r="7" fill="#04060c" />
                  <circle cx="-5" cy="-5" r="4" fill="#ffffff" />
                </g>
              ) : animation === 'angry' ? (
                <g>
                  <line x1="-28" y1="-26" x2="28" y2="-10" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
                  <polygon points="-26,-4 26,6 22,14 -24,8" fill="#ef4444" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="2" cy="5" r="4" fill="#ffffff" />
                  <line x1="0" y1="5" x2="-140" y2="5" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
                </g>
              ) : animation === 'love' ? (
                <motion.path
                  d="M 0 18 l -2.6 -2.4 C -12 7.5 -18 1.5 -18 -6 C -18 -12 -13.5 -16.5 -7.5 -16.5 C -4.2 -16.5 -1.2 -14.5 0 -11.5 C 1.2 -14.5 4.2 -16.5 7.5 -16.5 C 13.5 -16.5 18 -12 18 -6 C 18 1.5 12 7.5 2.6 15.6 L 0 18 Z"
                  fill="#f43f5e"
                  filter={`url(#${filterId}-laserGlow)`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              ) : animation === 'confused' ? (
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <circle cx="0" cy="0" r="22" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="6 4" />
                  <path
                    d="M 0 0 C 4 -6 10 -4 12 2 C 14 8 8 16 0 16 C -10 16 -18 8 -16 -2 C -14 -12 -4 -20 6 -20"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter={`url(#${filterId}-sharpGlow)`}
                  />
                  <circle cx="0" cy="0" r="4" fill="#ffffff" />
                </motion.g>
              ) : animation === 'idea' ? (
                <g>
                  <polygon
                    points="0,-24 6,-6 24,0 6,6 0,24 -6,6 -24,0 -6,-6"
                    fill="#fef08a"
                    stroke="#eab308"
                    strokeWidth="1.5"
                    filter={`url(#${filterId}-laserGlow)`}
                  />
                  <circle cx="0" cy="0" r="5" fill="#ffffff" />
                </g>
              ) : animation === 'waiting' ? (
                <g>
                  <motion.g animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <circle cx="0" cy="0" r="22" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="30 40" />
                  </motion.g>
                  <circle cx="0" cy="0" r="8" fill="#c084fc" />
                </g>
              ) : animation === 'sleep' ? (
                <line x1="-22" y1="4" x2="22" y2="4" stroke="#818cf8" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" filter={`url(#${filterId}-sharpGlow)`} />
              ) : animation === 'tense' ? (
                <g>
                  <circle cx="0" cy="0" r="22" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3" />
                  <circle cx="0" cy="0" r="9" fill="#f97316" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="-2" cy="-2" r="3" fill="#ffffff" />
                </g>
              ) : animation === 'laugh' ? (
                <path d="M -26 8 Q 0 -22 26 8" fill="none" stroke={theme.eyeColor} strokeWidth="7" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
              ) : animation === 'cool' ? (
                <polygon points="-28,-8 28,-8 22,14 -24,14" fill="#000000" stroke="#c084fc" strokeWidth="2.5" filter={`url(#${filterId}-sharpGlow)`} />
              ) : animation === 'sad' ? (
                <g>
                  <path d="M -24 0 Q 0 16 24 0" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                  <motion.path
                    d="M 0 6 L 0 55"
                    stroke="#00f0ff"
                    strokeWidth="3.5"
                    strokeDasharray="10 8"
                    animate={{ strokeDashoffset: [0, -36] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    filter={`url(#${filterId}-laserGlow)`}
                  />
                </g>
              ) : animation === 'glitch' ? (
                <g>
                  <rect x="-26" y="-12" width="52" height="12" fill="#ec4899" opacity="0.85" />
                  <rect x="-20" y="2" width="46" height="10" fill="#00f0ff" opacity="0.85" />
                  <line x1="-32" y1="0" x2="32" y2="0" stroke="#ffffff" strokeWidth="2" />
                </g>
              ) : animation === 'wink' ? (
                <path d="M -22 4 Q 0 -12 22 4" fill="none" stroke={theme.eyeColor} strokeWidth="6" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
              ) : (
                <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
                  <circle cx="0" cy="0" r="26" fill="none" stroke={theme.eyeColor} strokeWidth="1.5" strokeOpacity="0.4" />
                  <circle cx="0" cy="0" r="20" fill={theme.eyeColor} fillOpacity="0.3" stroke={theme.eyeColor} strokeWidth="2.5" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="0" cy="0" r="10" fill={theme.eyeColor} />
                  <circle cx="-4" cy="-4" r="4.5" fill="#ffffff" />
                  <circle cx="4" cy="4" r="2" fill="#ffffff" opacity="0.8" />
                </g>
              )}
            </g>

            <g transform="translate(318, 218)">
              {isBlinking && animation !== 'sleep' && animation !== 'shock' && animation !== 'angry' ? (
                <line
                  x1="-26"
                  y1="0"
                  x2="26"
                  y2="0"
                  stroke={theme.eyeColor}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter={`url(#${filterId}-laserGlow)`}
                />
              ) : animation === 'shock' ? (
                <g>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="-28"
                      x2="0"
                      y2="-36"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      transform={`rotate(${deg} 0 0)`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="28" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 3" />
                  <circle cx="0" cy="0" r="22" fill="#fbbf24" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="0" cy="0" r="7" fill="#04060c" />
                  <circle cx="-5" cy="-5" r="4" fill="#ffffff" />
                </g>
              ) : animation === 'angry' ? (
                <g>
                  <line x1="-28" y1="-10" x2="28" y2="-26" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
                  <polygon points="-26,6 26,-4 24,8 -22,14" fill="#ef4444" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="-2" cy="5" r="4" fill="#ffffff" />
                  <line x1="0" y1="5" x2="140" y2="5" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
                </g>
              ) : animation === 'love' ? (
                <motion.path
                  d="M 0 18 l -2.6 -2.4 C -12 7.5 -18 1.5 -18 -6 C -18 -12 -13.5 -16.5 -7.5 -16.5 C -4.2 -16.5 -1.2 -14.5 0 -11.5 C 1.2 -14.5 4.2 -16.5 7.5 -16.5 C 13.5 -16.5 18 -12 18 -6 C 18 1.5 12 7.5 2.6 15.6 L 0 18 Z"
                  fill="#f43f5e"
                  filter={`url(#${filterId}-laserGlow)`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              ) : animation === 'confused' ? (
                <g>
                  <circle cx="0" cy="0" r="22" fill="none" stroke="#eab308" strokeWidth="1.5" />
                  <path
                    d="M -4 -12 C -4 -19 10 -20 10 -11 C 10 -4 0 0 0 6"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter={`url(#${filterId}-laserGlow)`}
                  />
                  <circle cx="0" cy="12" r="2.5" fill="#facc15" />
                </g>
              ) : animation === 'idea' ? (
                <g>
                  <polygon
                    points="0,-24 6,-6 24,0 6,6 0,24 -6,6 -24,0 -6,-6"
                    fill="#fef08a"
                    stroke="#eab308"
                    strokeWidth="1.5"
                    filter={`url(#${filterId}-laserGlow)`}
                  />
                  <circle cx="0" cy="0" r="5" fill="#ffffff" />
                </g>
              ) : animation === 'waiting' ? (
                <g>
                  <motion.g animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <circle cx="0" cy="0" r="22" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="30 40" />
                  </motion.g>
                  <circle cx="0" cy="0" r="8" fill="#c084fc" />
                </g>
              ) : animation === 'sleep' ? (
                <line x1="-22" y1="4" x2="22" y2="4" stroke="#818cf8" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" filter={`url(#${filterId}-sharpGlow)`} />
              ) : animation === 'tense' ? (
                <g>
                  <circle cx="0" cy="0" r="22" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3" />
                  <circle cx="0" cy="0" r="9" fill="#f97316" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="-2" cy="-2" r="3" fill="#ffffff" />
                </g>
              ) : animation === 'laugh' ? (
                <path d="M -26 8 Q 0 -22 26 8" fill="none" stroke={theme.eyeColor} strokeWidth="7" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
              ) : animation === 'cool' ? (
                <polygon points="-28,-8 28,-8 24,14 -22,14" fill="#000000" stroke="#c084fc" strokeWidth="2.5" filter={`url(#${filterId}-sharpGlow)`} />
              ) : animation === 'sad' ? (
                <g>
                  <path d="M -24 0 Q 0 16 24 0" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                  <motion.path
                    d="M 0 6 L 0 55"
                    stroke="#00f0ff"
                    strokeWidth="3.5"
                    strokeDasharray="10 8"
                    animate={{ strokeDashoffset: [0, -36] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    filter={`url(#${filterId}-laserGlow)`}
                  />
                </g>
              ) : animation === 'glitch' ? (
                <g>
                  <rect x="-26" y="-8" width="52" height="12" fill="#00f0ff" opacity="0.85" />
                  <rect x="-20" y="4" width="44" height="8" fill="#ec4899" opacity="0.85" />
                  <line x1="-32" y1="-2" x2="32" y2="-2" stroke="#ffffff" strokeWidth="2" />
                </g>
              ) : animation === 'wink' ? (
                <g>
                  <circle cx="0" cy="0" r="24" fill="none" stroke={theme.eyeColor} strokeWidth="1.5" strokeOpacity="0.5" />
                  <circle cx="0" cy="0" r="18" fill={theme.eyeColor} fillOpacity="0.3" stroke={theme.eyeColor} strokeWidth="2" filter={`url(#${filterId}-laserGlow)`} />
                  <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#ffffff" filter={`url(#${filterId}-laserGlow)`} />
                </g>
              ) : (
                <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
                  <circle cx="0" cy="0" r="26" fill="none" stroke={theme.eyeColor} strokeWidth="1.5" strokeOpacity="0.4" />
                  <circle cx="0" cy="0" r="20" fill={theme.eyeColor} fillOpacity="0.3" stroke={theme.eyeColor} strokeWidth="2.5" filter={`url(#${filterId}-laserGlow)`} />
                  <circle cx="0" cy="0" r="10" fill={theme.eyeColor} />
                  <circle cx="-4" cy="-4" r="4.5" fill="#ffffff" />
                  <circle cx="4" cy="4" r="2" fill="#ffffff" opacity="0.8" />
                </g>
              )}
            </g>
          </motion.g>

          <g id="digital-mouth-visor" transform="translate(250, 298)">
            {animation === 'shock' ? (
              <motion.ellipse
                cx="0"
                cy="8"
                rx="16"
                ry="24"
                fill="#000000"
                stroke="#fbbf24"
                strokeWidth="4.5"
                filter={`url(#${filterId}-laserGlow)`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            ) : animation === 'angry' ? (
              <g>
                <polygon points="-28,-5 28,-5 22,8 -22,8" fill="#dc2626" stroke="#ef4444" strokeWidth="3" filter={`url(#${filterId}-laserGlow)`} />
                <line x1="-24" y1="1" x2="24" y2="1" stroke="#ffffff" strokeWidth="2.5" />
                {[-14, -7, 0, 7, 14].map((tx) => (
                  <line key={tx} x1={tx} y1="-3" x2={tx} y2="6" stroke="#ffffff" strokeWidth="1.5" />
                ))}
              </g>
            ) : animation === 'laugh' ? (
              <g>
                <path d="M -30 -3 Q 0 32 30 -3 Z" fill={theme.eyeColor} stroke={theme.eyeColor} strokeWidth="3.5" filter={`url(#${filterId}-laserGlow)`} />
                <line x1="-22" y1="2" x2="22" y2="2" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </g>
            ) : animation === 'confused' ? (
              <path d="M -24 0 L -16 6 L -8 -6 L 0 6 L 8 -6 L 16 6 L 24 -2" fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" filter={`url(#${filterId}-sharpGlow)`} />
            ) : animation === 'waiting' ? (
              <circle cx="0" cy="2" r="7" fill="none" stroke="#c084fc" strokeWidth="3" filter={`url(#${filterId}-sharpGlow)`} />
            ) : animation === 'tense' ? (
              <motion.path
                d="M -24 0 L -16 5 L -8 -5 L 0 6 L 8 -5 L 16 5 L 24 0"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter={`url(#${filterId}-laserGlow)`}
                animate={{
                  d: [
                    'M -24 0 L -16 5 L -8 -5 L 0 6 L 8 -5 L 16 5 L 24 0',
                    'M -24 0 L -16 -4 L -8 4 L 0 -5 L 8 4 L 16 -4 L 24 0',
                    'M -24 0 L -16 5 L -8 -5 L 0 6 L 8 -5 L 16 5 L 24 0',
                  ],
                }}
                transition={{ duration: 0.14, repeat: Infinity }}
              />
            ) : animation === 'cool' ? (
              <path d="M -18 2 Q 4 14 26 -6" fill="none" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" filter={`url(#${filterId}-sharpGlow)`} />
            ) : animation === 'sad' ? (
              <path d="M -24 6 Q 0 -12 24 6" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
            ) : animation === 'love' || animation === 'idea' ? (
              <motion.path
                d="M -26 -4 Q 0 22 26 -4"
                fill="none"
                stroke={theme.eyeColor}
                strokeWidth="5.5"
                strokeLinecap="round"
                filter={`url(#${filterId}-laserGlow)`}
                animate={{
                  d: [
                    'M -26 -4 Q 0 22 26 -4',
                    'M -26 -6 Q 0 25 26 -6',
                    'M -26 -4 Q 0 22 26 -4',
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            ) : animation === 'sleep' ? (
              <line x1="-10" y1="2" x2="10" y2="2" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            ) : (
              <path d="M -22 -1 Q 0 12 22 -1" fill="none" stroke={theme.eyeColor} strokeWidth="4.5" strokeLinecap="round" filter={`url(#${filterId}-laserGlow)`} />
            )}
          </g>

          <g transform="translate(200, 355)" className="opacity-80">
            {[-36, -18, 0, 18, 36, 54, 72, 90].map((dotX, i) => (
              <circle
                key={dotX}
                cx={dotX}
                cy="0"
                r="2.2"
                fill={i % 2 === 0 ? '#a855f7' : '#dc2626'}
              />
            ))}
          </g>
        </motion.g>
      </svg>
    </div>
  );
};
