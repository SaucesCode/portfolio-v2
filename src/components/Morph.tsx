import { ViewTransition, type ReactNode } from 'react';

/** The shared name that links a project's frame on the homepage to the hero of its case study. */
export const morphName = (slug: string) => `work-${slug}`;

/**
 * Marks a piece of work as the same object on two pages, so following a link between them
 * moves it into place instead of swapping one picture for another. Only that pairing animates;
 * every other transition leaves it alone (default="none").
 */
export function Morph({ name, children }: { name?: string; children: ReactNode }) {
  if (!name) return children;
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
