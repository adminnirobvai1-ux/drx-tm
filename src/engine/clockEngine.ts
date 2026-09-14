/**
 * High-Precision Real-Time Clock Engine
 * Drives the synchronized digital clock display down to the second.
 */

import type { ClockState } from '../types/index.ts';

export type ClockTickListener = (state: ClockState) => void;

export class ClockEngine {
  private listeners: Set<ClockTickListener> = new Set();
  private timerId: number | null = null;
  private serverOffsetMs = 0;

  public start(): void {
    if (this.timerId !== null) return;

    this.tick();
    this.timerId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  public setServerOffset(serverUtcMs: number): void {
    const localNow = Date.now();
    this.serverOffsetMs = serverUtcMs - localNow;
  }

  public subscribe(listener: ClockTickListener): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getCurrentState(): ClockState {
    const now = new Date(Date.now() + this.serverOffsetMs);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return {
      hours,
      minutes,
      seconds,
      fullTimeString: `${hours}:${minutes}:${seconds}`,
    };
  }

  private tick(): void {
    const state = this.getCurrentState();
    this.listeners.forEach((listener) => listener(state));
  }

  public stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

export const clockEngine = new ClockEngine();
