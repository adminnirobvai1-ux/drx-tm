/**
 * Keyboard Shortcut Interceptor Module
 * Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
 */

export type KeyBlockedCallback = (keyCombo: string) => void;

class KeyInterceptorManager {
  private active = false;
  private onBlockedCallback?: KeyBlockedCallback;

  public init(callback?: KeyBlockedCallback): void {
    if (this.active) return;
    this.active = true;
    this.onBlockedCallback = callback;

    window.addEventListener('keydown', this.handleKeyDown, { capture: true });
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = (e.key || '').toUpperCase();
    const code = e.code || '';

    // 1. F12 key
    if (key === 'F12' || code === 'F12') {
      this.prevent(e, 'F12');
      return;
    }

    // 2. Ctrl + Shift + I (Inspect) or Cmd + Option + I
    if (isCtrlOrCmd && isShift && (key === 'I' || code === 'KeyI')) {
      this.prevent(e, 'CTRL_SHIFT_I');
      return;
    }

    // 3. Ctrl + Shift + J (Console) or Cmd + Option + J
    if (isCtrlOrCmd && isShift && (key === 'J' || code === 'KeyJ')) {
      this.prevent(e, 'CTRL_SHIFT_J');
      return;
    }

    // 4. Ctrl + Shift + C (Element selector)
    if (isCtrlOrCmd && isShift && (key === 'C' || code === 'KeyC')) {
      this.prevent(e, 'CTRL_SHIFT_C');
      return;
    }

    // 5. Ctrl + U (View Source)
    if (isCtrlOrCmd && (key === 'U' || code === 'KeyU')) {
      this.prevent(e, 'CTRL_U');
      return;
    }

    // 6. Ctrl + S (Save page)
    if (isCtrlOrCmd && (key === 'S' || code === 'KeyS')) {
      this.prevent(e, 'CTRL_S');
      return;
    }
  };

  private prevent(e: KeyboardEvent, comboName: string): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.onBlockedCallback) {
      this.onBlockedCallback(comboName);
    }
  }

  public destroy(): void {
    if (!this.active) return;
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    this.active = false;
  }
}

export const keyInterceptor = new KeyInterceptorManager();
