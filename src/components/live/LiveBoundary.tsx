'use client';

import { Component, type ReactNode } from 'react';

/** If a demo's code cannot load (for example on a dropped connection), the screenshot simply stays. */
export class LiveBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
