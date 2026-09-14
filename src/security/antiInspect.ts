/**
 * Anti-Inspect and Context-Menu Protection Module
 * Blocks right-click context menu and unauthorized DOM dragging.
 */

export type AntiInspectCallback = (event: Event) => void;

class AntiInspectManager {
  private active = false;
  private onAttemptListener?: AntiInspectCallback;

  public init(callback?: AntiInspectCallback): void {
    if (this.active) return;
    this.active = true;
    this.onAttemptListener = callback;

    this.attachListeners();
  }

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (this.onAttemptListener) {
      this.onAttemptListener(e);
    }
    return;
  };

  private handleDragStart = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  private attachListeners(): void {
    window.addEventListener('contextmenu', this.handleContextMenu, { capture: true });
    window.addEventListener('dragstart', this.handleDragStart, { capture: true });
  }

  public destroy(): void {
    if (!this.active) return;
    window.removeEventListener('contextmenu', this.handleContextMenu, { capture: true });
    window.removeEventListener('dragstart', this.handleDragStart, { capture: true });
    this.active = false;
  }
}

export const antiInspect = new AntiInspectManager();
