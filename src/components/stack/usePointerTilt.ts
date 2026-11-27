import { useEffect, type RefObject } from 'react';

const TILTS = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const MAX_TILT_DEG = 3;

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * Tilts the stack a few degrees towards a mouse or pen over it, and back when it leaves. It writes
 * two custom properties once a frame; the CSS applies them only where TILTS matches, so touch
 * screens and reduced motion never tilt, and React never re-renders for it.
 */
export function usePointerTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const query = window.matchMedia(TILTS);
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const draw = () => {
      frame = 0;
      if (!pointer) {
        el.style.removeProperty('--tilt-axis');
        el.style.removeProperty('--tilt');
        return;
      }
      const box = el.getBoundingClientRect();
      const x = clamp(((pointer.x - box.left) / box.width) * 2 - 1);
      const y = clamp(((pointer.y - box.top) / box.height) * 2 - 1);
      el.style.setProperty('--tilt-axis', `${-y} ${x} 0`);
      el.style.setProperty('--tilt', `${Math.min(1, Math.hypot(x, y)) * MAX_TILT_DEG}deg`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !query.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref]);
}
