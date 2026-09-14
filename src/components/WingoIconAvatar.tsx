/**
 * Wingo 30s Logic Icon Avatar Component - 4K 2D Animated Tech Vectors
 * Tailored specifically for all 20 new AI models requested by user:
 * 1. TIGER KING
 * 2. DRAGON X
 * 3. PHOENIX PRO
 * 4. EAGLE FORCE
 * 5. LION X
 * 6. THUNDER KING
 * 7. NINJA X
 * 8. COBRA PRO
 * 9. WOLF X
 * 10. BLAZE KING
 * 11. VIPER X
 * 12. ROCKET PRO
 * 13. STORM X
 * 14. NINJA Y
 * 15. FALCON RUSH PRO
 * 16. PANTHER X
 * 17. GHOST PRO
 * 18. SHARK X
 * 19. BULLET KING
 * 20. DARK PRO
 * + fallbacks for VIP dataset names (Vector, Nova, Titan, etc.)
 */

import React from 'react';

interface WingoIconAvatarProps {
  name?: string;
  className?: string;
  isAnimated?: boolean;
  isCircle?: boolean;
}

export const WingoIconAvatar: React.FC<WingoIconAvatarProps> = ({
  name = '',
  className = 'w-11 h-11',
  isAnimated = true,
  isCircle = false,
}) => {
  const normalized = (name || '').toUpperCase().trim();
  const shapeClass = isCircle
    ? 'rounded-full border-[2px] shadow-[0_0_12px_rgba(245,158,11,0.5)]'
    : 'rounded-[14px] border-[1.8px]';

  // 1. TIGER KING - Amber/Golden Fierce Tiger with Crown & Stripes
  if (normalized.includes('TIGER')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#451a03] via-[#1c0a00] to-[#0a0300] border-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-amber-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#f59e0b] ${isAnimated ? 'animate-tiger-roar' : ''}`}
        >
          {/* Tiger Ears */}
          <polygon points="7,8 12,15 5,16" fill="#b45309" stroke="#f59e0b" strokeWidth="1.2" />
          <polygon points="29,8 24,15 31,16" fill="#b45309" stroke="#f59e0b" strokeWidth="1.2" />
          {/* Tiger Head */}
          <path d="M7 16C7 10 11 8 18 8C25 8 29 10 29 16C29 25 24 31 18 31C12 31 7 25 7 16Z" fill="#d97706" stroke="#fbbf24" strokeWidth="1.4" />
          {/* Mini Crown on top */}
          <polygon points="13,7 18,3 23,7 21,9 15,9" fill="#fde047" stroke="#ffffff" strokeWidth="0.8" />
          {/* Forehead Stripes */}
          <path d="M18 10V16M15 12H21M16 15H20" stroke="#451a03" strokeWidth="1.4" strokeLinecap="round" />
          {/* Fierce Amber Eyes */}
          <circle cx="13" cy="18" r="2" fill="#fef08a" />
          <circle cx="23" cy="18" r="2" fill="#fef08a" />
          <circle cx="13" cy="18" r="0.9" fill="#000" />
          <circle cx="23" cy="18" r="0.9" fill="#000" />
          {/* Snout & Fangs */}
          <polygon points="18,22 15,20 21,20" fill="#451a03" />
          <path d="M15 25L14 27M21 25L22 27" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 2. DRAGON X - Mythic Cyber Dragon with Horns & Breath
  if (normalized.includes('DRAGON')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#01140e] border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-emerald-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#10b981] ${isAnimated ? 'animate-dragon-breathe' : ''}`}
        >
          {/* Dragon Horns */}
          <path d="M10 12L5 4L12 9" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M26 12L31 4L24 9" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          {/* Dragon Head */}
          <polygon points="18,5 28,15 24,29 18,33 12,29 8,15" fill="#047857" stroke="#6ee7b7" strokeWidth="1.4" />
          {/* Scaled Crest */}
          <path d="M18 7V27M13 14L18 19L23 14" stroke="#a7f3d0" strokeWidth="1.2" strokeLinecap="round" />
          {/* Glowing Eyes */}
          <circle cx="13" cy="18" r="1.8" fill="#fbbf24" />
          <circle cx="23" cy="18" r="1.8" fill="#fbbf24" />
          <line x1="13" y1="16.5" x2="13" y2="19.5" stroke="#000" strokeWidth="0.8" />
          <line x1="23" y1="16.5" x2="23" y2="19.5" stroke="#000" strokeWidth="0.8" />
          {/* Fiery Nostrils */}
          <circle cx="16" cy="27" r="0.9" fill="#f87171" />
          <circle cx="20" cy="27" r="0.9" fill="#f87171" />
        </svg>
      </div>
    );
  }

  // 3. PHOENIX PRO - Immortal Radiant Solar Phoenix
  if (normalized.includes('PHOENIX')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#581c87] via-[#2e1065] to-[#140628] border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-rose-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#f43f5e] ${isAnimated ? 'animate-phoenix-flare' : ''}`}
        >
          {/* Blazing Wings */}
          <path d="M4 14C8 10 13 12 18 18C23 12 28 10 32 14C29 22 24 28 18 32C12 28 7 22 4 14Z" fill="#e11d48" stroke="#fda4af" strokeWidth="1.2" />
          {/* Core Fire Body */}
          <path d="M18 4C18 4 14 11 14 17C14 22 16 25 18 28C20 25 22 22 22 17C22 11 18 4 18 4Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
          <circle cx="18" cy="14" r="2" fill="#ffffff" />
          {/* Wing Feathers */}
          <path d="M8 17L14 21M28 17L22 21" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 4. EAGLE FORCE - Apex Golden/Cyan Eagle Vision
  if (normalized.includes('EAGLE')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#082f49] via-[#031d30] to-[#010e17] border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-sky-400/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#38bdf8] ${isAnimated ? 'animate-eagle-soar' : ''}`}
        >
          {/* Eagle Head Profile / Crest */}
          <path d="M8 20L12 8C16 5 22 5 26 9L29 15C30 18 26 21 21 21H18L13 29L14 24L8 20Z" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.3" />
          {/* Sharp Curved Beak */}
          <path d="M26 13C29 13 32 15 31 18C30 20 27 21 24 20L26 13Z" fill="#f59e0b" stroke="#fde047" strokeWidth="1" />
          {/* Predatory Eye */}
          <circle cx="20" cy="12" r="2.2" fill="#ffffff" />
          <circle cx="20" cy="12" r="1.1" fill="#000" />
          {/* Feather Details */}
          <line x1="12" y1="13" x2="16" y2="15" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="10" y1="17" x2="15" y2="19" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 5. LION X - Imperial Golden Crowned Lion Mane
  if (normalized.includes('LION')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#713f12] via-[#2e1804] to-[#120901] border-yellow-400 shadow-[0_0_14px_rgba(234,179,8,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-yellow-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#eab308] ${isAnimated ? 'animate-lion-pulse' : ''}`}
        >
          {/* Lion Radiating Mane */}
          <circle cx="18" cy="18" r="13" stroke="#ca8a04" strokeWidth="1.8" strokeDasharray="3 2" fill="#854d0e" />
          {/* Face */}
          <circle cx="18" cy="18" r="8" fill="#eab308" stroke="#fef08a" strokeWidth="1.2" />
          {/* Crown */}
          <polygon points="13,11 15,8 18,10 21,8 23,11" fill="#fde047" stroke="#ffffff" strokeWidth="0.8" />
          {/* Eyes */}
          <circle cx="15" cy="17" r="1.2" fill="#000" />
          <circle cx="21" cy="17" r="1.2" fill="#000" />
          {/* Muzzle */}
          <polygon points="18,20 16,19 20,19" fill="#451a03" />
          <path d="M16 22C17 23 19 23 20 22" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 6. THUNDER KING - Zeus Dual Lightning Electric Discharge
  if (normalized.includes('THUNDER') || (normalized.includes('LIGHTNING') && !normalized.includes('PRO'))) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#172554] via-[#09153a] to-[#020617] border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.6)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-cyan-400/35 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#22d3ee] ${isAnimated ? 'animate-thunder-zap' : ''}`}
        >
          {/* Lightning 1 */}
          <path d="M19 2L7 17H16L13 32L28 14H18L21 2Z" fill="url(#thunder-king-grad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Crown Spark */}
          <circle cx="19" cy="2" r="1.5" fill="#ffffff" />
          <defs>
            <linearGradient id="thunder-king-grad" x1="13" y1="2" x2="23" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#67e8f9" />
              <stop offset="0.5" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 14. NINJA Y - Twin Golden Kunai Assassin
  if (normalized === 'NINJA Y' || normalized.includes('NINJA Y')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#451a03] via-[#1f0d01] to-[#0d0400] border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-amber-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#facc15] ${isAnimated ? 'animate-shuriken-spin' : ''}`}
        >
          {/* 4-point golden shuriken */}
          <polygon points="18,4 21,15 32,18 21,21 18,32 15,21 4,18 15,15" fill="#eab308" stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="18" cy="18" r="3.5" fill="#451a03" stroke="#ffffff" strokeWidth="1" />
          <circle cx="18" cy="18" r="1.5" fill="#facc15" />
        </svg>
      </div>
    );
  }

  // 7. NINJA X / NINJA MASTER - Stealth Katana Assassin Mask with Ruby Visor
  if (normalized.includes('NINJA')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#3b0764] via-[#1f0337] to-[#0d0117] border-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-fuchsia-600/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#d946ef] ${isAnimated ? 'animate-ninja-slash' : ''}`}
        >
          {/* Crossed Katanas behind head */}
          <line x1="6" y1="6" x2="30" y2="30" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="30" y1="6" x2="6" y2="30" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
          {/* Ninja Hood */}
          <path d="M10 12C10 7 14 5 18 5C22 5 26 7 26 12V22C26 27 22 31 18 31C14 31 10 27 10 22V12Z" fill="#18072b" stroke="#c084fc" strokeWidth="1.5" />
          {/* Headband with Emblem */}
          <rect x="12" y="9" width="12" height="5" rx="1.5" fill="#3b0764" stroke="#f43f5e" strokeWidth="1" />
          <circle cx="18" cy="11.5" r="1.2" fill="#f43f5e" />
          {/* Glowing Ruby Visor */}
          <path d="M13 18L18 20L23 18" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 8. COBRA PRO - Venomous Hooded King Cobra
  if (normalized.includes('COBRA')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#064e3b] via-[#02261d] to-[#00120d] border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-emerald-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#10b981] ${isAnimated ? 'animate-cobra-sway' : ''}`}
        >
          {/* Expanded Cobra Hood */}
          <path d="M6 18C6 11 12 8 18 8C24 8 30 11 30 18C30 26 23 29 18 32C13 29 6 26 6 18Z" fill="#047857" stroke="#34d399" strokeWidth="1.3" />
          {/* Hood Eye-Spectacle Marking */}
          <circle cx="12" cy="15" r="3" stroke="#fef08a" strokeWidth="1.2" fill="none" />
          <circle cx="24" cy="15" r="3" stroke="#fef08a" strokeWidth="1.2" fill="none" />
          {/* Cobra Head Core */}
          <polygon points="18,11 22,17 18,24 14,17" fill="#065f46" stroke="#a7f3d0" strokeWidth="1" />
          {/* Glowing Fangs & Eyes */}
          <circle cx="15.5" cy="16" r="1.1" fill="#ef4444" />
          <circle cx="20.5" cy="16" r="1.1" fill="#ef4444" />
          <line x1="16" y1="21" x2="16" y2="24" stroke="#ffffff" strokeWidth="1" />
          <line x1="20" y1="21" x2="20" y2="24" stroke="#ffffff" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // 9. WOLF X / WOLF PACK - Alpha Arctic Cyber Wolf
  if (normalized.includes('WOLF')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#000] border-cyan-400 shadow-[0_0_14px_rgba(56,189,248,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-sky-400/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#38bdf8] ${isAnimated ? 'animate-wolf-howl' : ''}`}
        >
          {/* Wolf Ears */}
          <polygon points="8,5 14,15 7,17" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.3" />
          <polygon points="28,5 22,15 29,17" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.3" />
          {/* Angular Geometric Head */}
          <polygon points="18,31 8,17 28,17" fill="#0f172a" stroke="#7dd3fc" strokeWidth="1.4" />
          <polygon points="18,31 13,22 23,22" fill="#0284c7" />
          {/* Glowing Eyes */}
          <circle cx="13.5" cy="18.5" r="1.8" fill="#38bdf8" />
          <circle cx="22.5" cy="18.5" r="1.8" fill="#38bdf8" />
          {/* Nose */}
          <polygon points="18,28 16,25 20,25" fill="#38bdf8" />
        </svg>
      </div>
    );
  }

  // 10. BLAZE KING - Inferno Burning Flame Crown
  if (normalized.includes('BLAZE')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#7c2d12] via-[#431407] to-[#1a0601] border-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.6)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-orange-500/35 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#f97316] ${isAnimated ? 'animate-blaze-dance' : ''}`}
        >
          {/* Outer Flames */}
          <path d="M18 4C18 4 10 12 10 20C10 26 13 30 18 32C23 30 26 26 26 20C26 12 18 4 18 4Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.2" />
          {/* Inner Flame Core */}
          <path d="M18 10C18 10 14 16 14 21C14 25 16 28 18 29C20 28 22 25 22 21C22 16 18 10 18 10Z" fill="#facc15" />
          {/* Flame Crown Points */}
          <polygon points="13,9 18,3 23,9 20,11 16,11" fill="#fde047" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="18" cy="24" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // 11. VIPER X - Bio-toxic Cybernetic Mecha Viper Visor
  if (normalized.includes('VIPER')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#14532d] via-[#052e16] to-[#011408] border-green-400 shadow-[0_0_14px_rgba(34,197,94,0.6)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-green-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#22c55e] ${isAnimated ? 'animate-viper-strike' : ''}`}
        >
          {/* Cybernetic Triangular Mask */}
          <polygon points="18,4 30,16 26,28 18,33 10,28 6,16" fill="#166534" stroke="#86efac" strokeWidth="1.4" />
          {/* Crosshair Visor */}
          <circle cx="18" cy="18" r="8" stroke="#22c55e" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="18" y1="7" x2="18" y2="29" stroke="#86efac" strokeWidth="1" />
          <line x1="7" y1="18" x2="29" y2="18" stroke="#86efac" strokeWidth="1" />
          {/* Toxic Optic Core */}
          <circle cx="18" cy="18" r="3" fill="#22c55e" />
          <circle cx="18" cy="18" r="1.2" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // 12. ROCKET PRO - Supersonic Thruster Rocket with Exhaust
  if (normalized.includes('ROCKET')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#083344] via-[#041c26] to-[#010c12] border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-cyan-400/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#22d3ee] ${isAnimated ? 'animate-rocket-launch' : ''}`}
        >
          {/* Rocket Body */}
          <path d="M18 4C23 10 24 20 22 26L18 24L14 26C12 20 13 10 18 4Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="1.3" />
          <circle cx="18" cy="13" r="2.2" fill="#ffffff" />
          {/* Fins */}
          <polygon points="11,19 7,27 14,24" fill="#155e75" stroke="#22d3ee" strokeWidth="1" />
          <polygon points="25,19 29,27 22,24" fill="#155e75" stroke="#22d3ee" strokeWidth="1" />
          {/* Fiery Exhaust Flare */}
          <polygon points="18,25 15,33 18,30 21,33" fill="#f59e0b" stroke="#ef4444" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // 13. STORM X - Cyclonic Tempest Vortex with Lightning
  if (normalized.includes('STORM')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#1e1b4b] via-[#0f0c29] to-[#030114] border-indigo-400 shadow-[0_0_14px_rgba(129,140,248,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-blue-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#818cf8] ${isAnimated ? 'animate-storm-spin' : ''}`}
        >
          {/* Vortex Spiral Arms */}
          <path d="M18 6C24 6 29 11 29 17C29 23 24 28 18 28C12 28 8 23 9 18C10 13 15 11 18 12C21 13 23 16 22 18" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" />
          {/* Storm Cloud Base */}
          <path d="M11 21C9 21 7 23 7 25C7 27 9 29 11 29H25C27 29 29 27 29 25C29 23 27 21 25 21" fill="#312e81" stroke="#c7d2fe" strokeWidth="1" />
          {/* Lightning Flash */}
          <polygon points="19,19 15,26 19,26 17,33 23,24 19,24" fill="#facc15" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // 15. FALCON RUSH PRO / FALCON PRO - Diving Peregrine Falcon
  if (normalized.includes('FALCON')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#082f49] via-[#041c2c] to-[#010a10] border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-cyan-400/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#38bdf8] ${isAnimated ? 'animate-falcon-dive' : ''}`}
        >
          {/* Diving Falcon Wing Sweep */}
          <path d="M18 4L6 14L15 22L18 33L21 22L30 14L18 4Z" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.3" />
          <polygon points="18,10 14,18 22,18" fill="#38bdf8" />
          {/* Yellow Beak */}
          <polygon points="18,33 16,30 20,30" fill="#f59e0b" />
          <circle cx="15" cy="15" r="1.4" fill="#ffffff" />
          <circle cx="21" cy="15" r="1.4" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // 16. PANTHER X - Midnight Black Panther with Violet Predatory Eyes
  if (normalized.includes('PANTHER')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#2e1065] via-[#13032d] to-[#05010d] border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-purple-600/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#a855f7] ${isAnimated ? 'animate-panther-stalk' : ''}`}
        >
          {/* Panther Ears */}
          <polygon points="6,9 12,16 6,17" fill="#1e1035" stroke="#a855f7" strokeWidth="1.2" />
          <polygon points="30,9 24,16 30,17" fill="#1e1035" stroke="#a855f7" strokeWidth="1.2" />
          {/* Head */}
          <path d="M7 16C7 10 11 8 18 8C25 8 29 10 29 16C29 25 24 30 18 30C12 30 7 25 7 16Z" fill="#0f071d" stroke="#c084fc" strokeWidth="1.4" />
          {/* Luminous Violet Predatory Eyes */}
          <ellipse cx="13" cy="17" rx="2.5" ry="1.4" fill="#c084fc" />
          <ellipse cx="23" cy="17" rx="2.5" ry="1.4" fill="#c084fc" />
          <line x1="13" y1="16" x2="13" y2="18" stroke="#000" strokeWidth="1" />
          <line x1="23" y1="16" x2="23" y2="18" stroke="#000" strokeWidth="1" />
          {/* Muzzle */}
          <polygon points="18,22 16,20 20,20" fill="#a855f7" />
          <line x1="14" y1="24" x2="22" y2="24" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 17. GHOST PRO / GHOST RIDER - Ethereal Spectral Mask with Cyan Ectoplasm
  if (normalized.includes('GHOST')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#082f49] via-[#021826] to-[#010b12] border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.6)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-cyan-400/40 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#38bdf8] ${isAnimated ? 'animate-ghost-float' : ''}`}
        >
          <path d="M18 4C11 4 8 11 8 18C8 22 10 25 12 28L14 32H22L24 28C26 25 28 22 28 18C28 11 25 4 18 4Z" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.4" />
          <circle cx="14" cy="16" r="2.8" fill="#000" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="22" cy="16" r="2.8" fill="#000" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="14" cy="16" r="1.2" fill="#38bdf8" />
          <circle cx="22" cy="16" r="1.2" fill="#38bdf8" />
          <path d="M18 20L17 23H19L18 20Z" fill="#38bdf8" />
          <path d="M13 27H23" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="15" y1="26" x2="15" y2="29" stroke="#38bdf8" strokeWidth="1" />
          <line x1="18" y1="26" x2="18" y2="29" stroke="#38bdf8" strokeWidth="1" />
          <line x1="21" y1="26" x2="21" y2="29" stroke="#38bdf8" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // 18. SHARK X - Apex Deep Sea Megalodon with Razor Teeth
  if (normalized.includes('SHARK')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#082f49] via-[#031d2e] to-[#010b12] border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-sky-400/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#38bdf8] ${isAnimated ? 'animate-shark-patrol' : ''}`}
        >
          {/* Shark Fin */}
          <path d="M18 5L10 16H26L18 5Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.3" />
          {/* Shark Head & Jaws */}
          <path d="M6 16C6 24 11 31 18 31C25 31 30 24 30 16H6Z" fill="#075985" stroke="#7dd3fc" strokeWidth="1.3" />
          {/* Razor Sharp Teeth Line */}
          <path d="M8 20L10 24L12 20L14 24L16 20L18 24L20 20L22 24L24 20L26 24L28 20" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
          {/* Eye */}
          <circle cx="18" cy="14" r="1.5" fill="#000" stroke="#38bdf8" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // 19. BULLET KING - Heavy Armor-Piercing Bullet with Golden Bullseye
  if (normalized.includes('BULLET')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#451a03] via-[#1c0a00] to-[#080200] border-yellow-400 shadow-[0_0_14px_rgba(234,179,8,0.55)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-amber-500/30 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#eab308] ${isAnimated ? 'animate-bullet-spin' : ''}`}
        >
          {/* Heavy Bullet Silhouette */}
          <path d="M18 4C14 8 13 14 13 19V30H23V19C23 14 22 8 18 4Z" fill="#d97706" stroke="#fef08a" strokeWidth="1.4" />
          {/* Bullet Rim */}
          <rect x="11" y="27" width="14" height="4" rx="1" fill="#b45309" stroke="#fef08a" strokeWidth="1" />
          {/* Bullseye Center Target */}
          <circle cx="18" cy="17" r="4.5" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          <circle cx="18" cy="17" r="2" fill="#ef4444" />
        </svg>
      </div>
    );
  }

  // 20. DARK PRO / DARK KILLER - Obsidian Cyber Skull with Laser Optic
  if (normalized.includes('DARK') || normalized.includes('OBSIDIAN')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#2e1065] via-[#12022b] to-[#030008] border-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.6)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-purple-500/35 via-transparent to-transparent" />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className={`w-7 h-7 relative z-10 drop-shadow-[0_0_8px_#a855f7] ${isAnimated ? 'animate-dark-pulse' : ''}`}
        >
          <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" stroke="#c084fc" strokeWidth="1.6" fill="#1f073b" strokeLinejoin="round" />
          <circle cx="18" cy="18" r="5" stroke="#f43f5e" strokeWidth="1.4" fill="#000" />
          <circle cx="18" cy="18" r="2.2" fill="#f43f5e" />
          <line x1="18" y1="8" x2="18" y2="28" stroke="#a855f7" strokeWidth="1" />
          <line x1="8" y1="18" x2="28" y2="18" stroke="#a855f7" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // FALLBACK 1: VECTOR
  if (normalized.includes('VECTOR') || normalized.includes('PULSE') || normalized.includes('SORT')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#083344] via-[#041c26] to-[#010b10] border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-cyan-500/25 via-transparent to-transparent" />
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 relative z-10 animate-pulse">
          <path d="M7 10L18 4L29 10L18 16L7 10Z" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.2" />
          <path d="M7 19L18 13L29 19L18 25L7 19Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="1.2" opacity="0.85" />
        </svg>
      </div>
    );
  }

  // FALLBACK 2: NOVA / STAR / AURORA
  if (normalized.includes('NOVA') || normalized.includes('STAR') || normalized.includes('AURORA')) {
    return (
      <div
        className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#1e1b4b] via-[#0f0c29] to-[#050314] border-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.35)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 bg-radial from-indigo-500/25 via-transparent to-transparent" />
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 relative z-10 animate-pulse">
          <polygon points="18,3 22,13 33,14 25,21 28,32 18,26 8,32 11,21 3,14 14,13" fill="#4338ca" stroke="#c7d2fe" strokeWidth="1.2" />
          <circle cx="18" cy="18" r="3" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // DEFAULT HIGH-TECH 4K 2D EMBLEM
  return (
    <div
      className={`${className} ${shapeClass} p-[2px] bg-gradient-to-b from-[#2e1065] via-[#17072b] to-[#080214] border-purple-500 shadow-[0_0_12px_rgba(147,51,234,0.3)] flex items-center justify-center relative overflow-hidden flex-shrink-0`}
    >
      <div className="absolute inset-0 bg-radial from-purple-500/25 via-transparent to-transparent" />
      <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 relative z-10 drop-shadow-[0_0_5px_rgba(147,51,234,0.8)]">
        <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" stroke="#c084fc" strokeWidth="1.6" fill="rgba(147, 51, 234, 0.2)" strokeLinejoin="round" />
        <circle cx="18" cy="18" r="4.5" fill="#e9d5ff" />
        <circle cx="18" cy="18" r="2" fill="#ffffff" />
      </svg>
    </div>
  );
};
