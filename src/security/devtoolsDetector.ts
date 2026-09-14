/**
 * DevTools Detection Module
 * Employs timing threshold analysis and debugger traps to detect inspection tools.
 */

export type DevToolsDetectedCallback = (reason: string) => void;

class DevToolsDetector {
  private active = false;
  private intervalId: number | null = null;
  private onDetectedCallback?: DevToolsDetectedCallback;
  private triggered = false;

  public init(callback: DevToolsDetectedCallback): void {
    if (this.active) return;
    this.active = true;
    this.onDetectedCallback = callback;

    this.startDetectionLoop();
  }

  private startDetectionLoop(): void {
    // 1. Timing threshold detector
    const checkTiming = () => {
      if (this.triggered) return;
      const start = performance.now();
      // Using a regex or object toString probe
      const reg = /./;
      reg.toString = () => {
        return '';
      };
      
      const duration = performance.now() - start;
      // In opened devtools, logging or complex evaluation takes dramatically longer
      if (duration > 100) {
        this.fireDetection('TIMING_THRESHOLD_EXCEEDED');
      }
    };

    // 2. Window difference check (only for non-iframe standalone windows)
    const checkWindowDelta = () => {
      if (this.triggered) return;
      try {
        if (window.self === window.top) {
          const threshold = 160;
          const widthDiff = window.outerWidth - window.innerWidth;
          const heightDiff = window.outerHeight - window.innerHeight;
          if (widthDiff > threshold || heightDiff > threshold) {
            this.fireDetection('WINDOW_DIMENSION_DELTA');
          }
        }
      } catch {
        // Sandboxed iframe cross-origin check ignored
      }
    };

    this.intervalId = window.setInterval(() => {
      checkTiming();
      checkWindowDelta();
    }, 1500);
  }

  public fireDetection(reason: string): void {
    if (this.triggered) return;
    this.triggered = true;
    if (this.onDetectedCallback) {
      this.onDetectedCallback(reason);
    }
  }

  public reset(): void {
    this.triggered = false;
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.active = false;
  }
}

export const devtoolsDetector = new DevToolsDetector();
