import { tableGroups, traceSteps, type Table } from '@/data/rowszein-trace';
import type { DemoEvent } from '@/components/live/useRowszeinDemo';

export interface StackFlow {
  key: number;
  /** How many logic steps light, counted from the first. */
  lit: number;
  stoppedAt: number | null;
  shortOf: string | null;
  written: Table[];
}

const BALANCE_CHECK = 'Work out every new balance before writing anything';
const WRITE_STEP = 'Write the sale and its paper trail';

function stepNamed(title: string) {
  const index = traceSteps.findIndex((s) => s.title === title);
  if (index === -1) throw new Error(`No trace step titled "${title}"`);
  return { index, step: traceSteps[index] };
}

export function flowFor(event: DemoEvent | null): StackFlow | null {
  if (!event || event.kind === 'reset') return null;
  if (event.kind === 'refused') {
    const { index } = stepNamed(BALANCE_CHECK);
    return { key: event.key, lit: index + 1, stoppedAt: index, shortOf: event.shortOf.name.toLowerCase(), written: [] };
  }
  const { step } = stepNamed(WRITE_STEP);
  const written = tableGroups.flatMap((g) => g.tables.map((t) => t.table)).filter((t) => step.touches[t] === 'write');
  return { key: event.key, lit: traceSteps.length, stoppedAt: null, shortOf: null, written };
}

export function describeFlow(flow: StackFlow): string {
  if (flow.shortOf) {
    return `Underneath, the real app checks every balance first; with too little ${flow.shortOf} it writes nothing.`;
  }
  return 'Underneath, the real app writes this sale and its paper trail in one transaction.';
}
