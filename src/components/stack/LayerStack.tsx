import type { CSSProperties, ReactNode } from 'react';
import styles from './LayerStack.module.css';

export interface StackLayer {
  id: string;
  label: string;
  /** Position relative to the interface: above it is positive, below it negative. */
  offset: number;
  content: ReactNode;
  hiddenWhenClosed?: boolean;
}

const place = (layer: StackLayer) => ({
  'data-base': layer.offset === 0 || undefined,
  'data-hidden-when-closed': layer.hiddenWhenClosed || undefined,
  style: { '--offset': layer.offset } as CSSProperties,
});

/**
 * A piece of work drawn as the layers it is made of, in a CSS 3D scene. The offset-0 layer is in
 * flow and sets the stack's size; the others are drawn over it, so opening never changes layout.
 * The labels are drawn by a second, identical scene laid over the first: separate 3D scenes never
 * cut into each other, so no sheet can cover a label.
 */
export function LayerStack({ layers, open, peek = false }: { layers: StackLayer[]; open: boolean; peek?: boolean }) {
  return (
    <span className={styles.depth}>
      <span className={styles.scene} data-stack-scene data-open={open} data-peek={peek}>
        {layers.map((layer) => (
          <span key={layer.id} className={styles.layer} data-layer={layer.id} {...place(layer)}>
            {layer.content}
          </span>
        ))}
      </span>
      <span className={`${styles.scene} ${styles.labels}`} data-open={open} data-peek={peek}>
        {layers.map((layer) => (
          <span key={layer.id} className={styles.layer} {...place(layer)}>
            <span className={styles.label}>{layer.label}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
