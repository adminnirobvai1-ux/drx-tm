import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  Flame,
  Heart,
  HelpCircle,
  Lightbulb,
  Clock,
  Moon,
  Activity,
  Scan,
  Laugh,
  Glasses,
  CloudRain,
  Radio,
  Eye,
  Bot,
} from 'lucide-react';
import type { RobotAnimation } from '../types/robot.ts';

interface ActionControlsProps {
  currentAnimation: RobotAnimation;
  onSelectAnimation: (anim: RobotAnimation) => void;
}

interface EmotionButton {
  id: RobotAnimation;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  glowClass: string;
}

const EMOTIONS_LIST: EmotionButton[] = [
  { id: 'shock', title: 'Shock', icon: Zap, activeClass: 'text-amber-400 border-amber-500/60 bg-amber-500/20', glowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.5)]' },
  { id: 'angry', title: 'Angry', icon: Flame, activeClass: 'text-red-500 border-red-600/70 bg-red-600/25', glowClass: 'shadow-[0_0_20px_rgba(220,38,38,0.6)]' },
  { id: 'love', title: 'Love', icon: Heart, activeClass: 'text-rose-400 border-rose-500/60 bg-rose-500/20', glowClass: 'shadow-[0_0_18px_rgba(244,63,94,0.5)]' },
  { id: 'confused', title: 'Confused', icon: HelpCircle, activeClass: 'text-yellow-400 border-yellow-500/60 bg-yellow-500/20', glowClass: 'shadow-[0_0_18px_rgba(234,179,8,0.5)]' },
  { id: 'idea', title: 'Idea', icon: Lightbulb, activeClass: 'text-purple-300 border-purple-500/60 bg-purple-500/20', glowClass: 'shadow-[0_0_18px_rgba(192,132,252,0.5)]' },
  { id: 'waiting', title: 'Waiting', icon: Clock, activeClass: 'text-violet-300 border-violet-500/60 bg-violet-500/20', glowClass: 'shadow-[0_0_18px_rgba(167,139,250,0.5)]' },
  { id: 'sleep', title: 'Sleep', icon: Moon, activeClass: 'text-indigo-400 border-indigo-500/60 bg-indigo-500/20', glowClass: 'shadow-[0_0_18px_rgba(99,102,241,0.5)]' },
  { id: 'tense', title: 'Tense', icon: Activity, activeClass: 'text-orange-400 border-orange-500/60 bg-orange-500/20', glowClass: 'shadow-[0_0_18px_rgba(249,115,22,0.5)]' },
  { id: 'scan', title: 'Scan Face', icon: Scan, activeClass: 'text-cyan-400 border-cyan-500/60 bg-cyan-500/20', glowClass: 'shadow-[0_0_18px_rgba(6,182,212,0.5)]' },
  { id: 'laugh', title: 'Laugh', icon: Laugh, activeClass: 'text-emerald-400 border-emerald-500/60 bg-emerald-500/20', glowClass: 'shadow-[0_0_18px_rgba(16,185,129,0.5)]' },
  { id: 'cool', title: 'Cool', icon: Glasses, activeClass: 'text-purple-300 border-purple-500/60 bg-purple-500/20', glowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.5)]' },
  { id: 'sad', title: 'Sad', icon: CloudRain, activeClass: 'text-sky-400 border-sky-500/60 bg-sky-500/20', glowClass: 'shadow-[0_0_18px_rgba(56,189,248,0.5)]' },
  { id: 'glitch', title: 'Glitch', icon: Radio, activeClass: 'text-pink-400 border-pink-500/60 bg-pink-500/20', glowClass: 'shadow-[0_0_18px_rgba(236,72,153,0.5)]' },
  { id: 'wink', title: 'Wink', icon: Eye, activeClass: 'text-blue-400 border-blue-500/60 bg-blue-500/20', glowClass: 'shadow-[0_0_18px_rgba(59,130,246,0.5)]' },
  { id: 'neutral', title: 'Neutral', icon: Bot, activeClass: 'text-slate-100 border-slate-400/60 bg-slate-500/20', glowClass: 'shadow-[0_0_18px_rgba(255,255,255,0.4)]' },
];

export const ActionControls: React.FC<ActionControlsProps> = ({
  currentAnimation,
  onSelectAnimation,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-4">
      <div className="relative bg-slate-950/90 border border-slate-800/90 rounded-2xl p-2 sm:p-2.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
          {EMOTIONS_LIST.map((item) => {
            const Icon = item.icon;
            const isActive = currentAnimation === item.id;

            return (
              <motion.button
                key={item.id}
                id={`btn-anim-${item.id}`}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelectAnimation(item.id)}
                className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `${item.activeClass} ${item.glowClass} ring-1 ring-white/30`
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
                title={item.title}
                aria-label={item.title}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeDockNode"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
