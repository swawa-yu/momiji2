import { isMobile } from '../main';
import desktopStyle from '../style/window_desktop.css';
import mobileStyle from '../style/window_mobile.css';

const positionStorageKey = 'draggable-window-position';
const minSize = 100;

class DraggableWindow extends HTMLElement {
  private start: [number, number] | null;
  private previousWindowPosition: [number, number] | null;
  private windowElement: HTMLDivElement | null;
  private willDisposed: [string, Function][] = [];
  private position = { x: 10, y: 10, width: 300, height: 300 };

  constructor() {
    super();
    this.start = null;
    this.previousWindowPosition = null;
    this.windowElement = null;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });

    const win = document.createElement('div');
    win.className = 'window';

    this.windowElement = win;

    const controls = document.createElement('ul');
    controls.className = 'controls';

    const closing = document.createElement('li');
    closing.className = 'closing';

    const title = document.createElement('li');
    title.className = 'title';

    const titleSlot = document.createElement('slot');
    titleSlot.name = 'title';
    title.append(titleSlot);

    controls.append(closing, title);

    closing.addEventListener('click', () => this.remove());

    const body = document.createElement('div');
    body.className = 'body';

    const bodySlot = document.createElement('slot');
    bodySlot.name = 'body';
    body.append(bodySlot);

    win.append(controls);
    win.append(body);

    shadow.append(win);

    titleSlot.addEventListener('slotchange', () => {
      const nodes = titleSlot.assignedElements();

      nodes.forEach((it) => {
        it.slot = '';
      });

      title.append(...nodes);
    });

    bodySlot.addEventListener('slotchange', () => {
      const nodes = bodySlot.assignedElements();

      nodes.forEach((it) => {
        it.slot = '';
      });

      body.append(...nodes);
    });

    if (isMobile()) {
      this.connectedCallbackForMobile(shadow);
    } else {
      this.connectedCallbackForDesktop(shadow, win);
    }
  }

  connectedCallbackForDesktop(shadow: ShadowRoot, win: HTMLElement) {
    const style = document.createElement('style');
    style.innerHTML = desktopStyle;
    shadow.append(style);

    win.draggable = true;
    const pointerUpHandler = this.dragEnd.bind(this);
    const pointerMoveHandler = this.drag.bind(this);

    const positionItem = localStorage.getItem(positionStorageKey);
    if (positionItem) {
      const parsed = JSON.parse(positionItem);
      if ('x' in parsed && 'y' in parsed && 'width' in parsed && 'height' in parsed) {
        this.position = parsed;
        this.position.x = Math.max(this.position.x, 0);
        this.position.y = Math.max(this.position.y, 0);
        this.position.width = Math.max(this.position.width, minSize);
        this.position.height = Math.max(this.position.height, minSize);
      }
    }
    win.style.left = this.position.x + 'px';
    win.style.top = this.position.y + 'px';
    win.style.width = this.position.width + 'px';
    win.style.height = this.position.height + 'px';

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width > 10 && entries[0].contentRect.height > 10) {
        this.position.width = entries[0].contentRect.width;
        this.position.height = entries[0].contentRect.height;
        localStorage.setItem(positionStorageKey, JSON.stringify(this.position));
      }
    });
    resizeObserver.observe(win);

    win.addEventListener('dragstart', this.dragStart.bind(this));
    window.addEventListener('pointerup', pointerUpHandler);
    window.addEventListener('pointermove', pointerMoveHandler);

    this.willDisposed.push(['pointerup', pointerUpHandler]);
    this.willDisposed.push(['pointermove', pointerMoveHandler]);
  }

  connectedCallbackForMobile(shadow: ShadowRoot) {
    const style = document.createElement('style');
    style.innerHTML = mobileStyle;
    shadow.append(style);
  }

  disconnectedCallback() {
    this.willDisposed.forEach(([evt, hdr]) => {
      window.removeEventListener(evt as any, hdr as any);
    });
  }

  /**
   * @param {DragEvent} evt
   */
  dragStart(evt: DragEvent) {
    evt.preventDefault();
    this.start = [evt.pageX, evt.pageY];
    const currentLeft = parseFloat(getComputedStyle(this.windowElement!).left.slice(0, -2)) || 0;
    const currentTop = parseFloat(getComputedStyle(this.windowElement!).top.slice(0, -2)) || 0;

    this.previousWindowPosition = [currentLeft, currentTop];
  }

  /**
   * @param {PointerEvent} evt
   */
  dragEnd(evt: PointerEvent) {
    if (this.start === null) {
      return;
    }
    const delta = [evt.pageX - this.start![0], evt.pageY - this.start![1]];
    this.position.x = delta[0] + this.previousWindowPosition![0];
    this.position.y = delta[1] + this.previousWindowPosition![1];
    this.windowElement!.style.left = `${this.position.x}px`;
    this.windowElement!.style.top = `${this.position.y}px`;
    this.start = null;

    localStorage.setItem(positionStorageKey, JSON.stringify(this.position));
  }

  /**
   * @param {PointerEvent} evt
   */
  drag(evt: PointerEvent) {
    if (this.start === null) {
      return;
    }

    const delta = [evt.pageX - this.start![0], evt.pageY - this.start![1]];
    this.windowElement!.style.left = `${delta[0] + this.previousWindowPosition![0]}px`;
    this.windowElement!.style.top = `${delta[1] + this.previousWindowPosition![1]}px`;
  }
}

if ('customElements' in window) {
  customElements.define('draggable-window', DraggableWindow);
}
