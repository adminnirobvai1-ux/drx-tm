/**
 * Tamper Guard Module
 * Orchestrates application lockdown upon intrusion or DevTools detection.
 */

import { devtoolsDetector } from './devtoolsDetector.ts';
import { keyInterceptor } from './keyInterceptor.ts';
import { antiInspect } from './antiInspect.ts';
import { SECURE_ENDPOINTS } from './stringCiphers.ts';

export type LockdownListener = (isLocked: boolean, reason: string) => void;

class TamperGuardManager {
  private isLocked = false;
  private listeners: Set<LockdownListener> = new Set();

  public start(): void {
    // 1. Initialize Anti-Inspect (Right Click & Drag)
    antiInspect.init((e) => {
      this.notifyTelemetry('CONTEXT_MENU_ATTEMPT', 'Right click prevented');
    });

    // 2. Initialize Keyboard Shortcuts Interceptor
    keyInterceptor.init((combo) => {
      this.notifyTelemetry('KEY_TAMPER', `Shortcut blocked: ${combo}`);
      // Shortcut attempts can either warn or trigger lockdown if aggressive
      if (combo === 'F12' || combo === 'CTRL_SHIFT_I') {
        this.triggerLockdown(`Shortcut intercepted: ${combo}`);
      }
    });

    // 3. Initialize DevTools Detector
    devtoolsDetector.init((reason) => {
      this.triggerLockdown(`DevTools inspection detected: ${reason}`);
    });
  }

  public triggerLockdown(reason: string): void {
    if (this.isLocked) return;
    this.isLocked = true;

    // Report intrusion to backend
    this.notifyTelemetry('DEVTOOLS_OPENED', reason);

    // Notify UI listeners to display the blocking overlay
    this.listeners.forEach((listener) => listener(true, reason));

    // Freeze console output
    try {
      console.clear();
    } catch {
      // Ignored
    }
  }

  public subscribe(listener: LockdownListener): () => void {
    this.listeners.add(listener);
    if (this.isLocked) {
      listener(true, 'SYSTEM_ALREADY_LOCKED');
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  public resetLock(): void {
    this.isLocked = false;
    devtoolsDetector.reset();
    this.listeners.forEach((listener) => listener(false, 'CLEARED'));
  }

  public getLockedState(): boolean {
    return this.isLocked;
  }

  private async notifyTelemetry(type: string, detail: string): Promise<void> {
    try {
      await fetch(SECURE_ENDPOINTS.TELEMETRY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          detail,
          timestamp: Date.now(),
        }),
      });
    } catch {
      // Fallback silently if offline
    }
  }
}

export const tamperGuard = new TamperGuardManager();
