'use client';

import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { stylePresets, typePairs, type StylePreset, type TypePair } from '@/data/thread-and-form';
import styles from './LiveControls.module.css';

interface Option {
  id: string;
  label: string;
  swatch?: string;
}

/** A radio group with roving focus: arrow keys move and choose, as in the hero's own switch. */
function RadioRow({ label, options, value, onChange, kind }: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  kind: 'swatch' | 'toggle';
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    refs.current[next]?.focus();
    onChange(options[next].id);
  };
  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      <span className={styles.prompt}>{label}:</span>
      {options.map((option, index) => (
        <button
          key={option.id}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          tabIndex={option.id === value ? 0 : -1}
          className={kind === 'swatch' ? styles.swatch : styles.toggle}
          style={option.swatch ? ({ '--swatch': option.swatch } as CSSProperties) : undefined}
          onClick={() => onChange(option.id)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Full-size controls under the hero window: restyle Thread & Form from its own theme tokens. */
export function StyleControls({ preset, type, onPreset, onType, announce }: {
  preset: StylePreset;
  type: TypePair;
  onPreset: (preset: StylePreset) => void;
  onType: (type: TypePair) => void;
  announce: (message: string) => void;
}) {
  const choosePreset = (id: string) => {
    const next = stylePresets.find((p) => p.id === id)!;
    onPreset(next);
    announce(`Thread & Form restyled: ${next.label}, ${type.label}.`);
  };
  const chooseType = (id: string) => {
    const next = typePairs.find((t) => t.id === id)!;
    onType(next);
    announce(`Thread & Form restyled: ${preset.label}, ${next.label}.`);
  };
  return (
    <div role="group" aria-label="Try Thread & Form" className={styles.controls}>
      <RadioRow
        label="Colour"
        kind="swatch"
        value={preset.id}
        onChange={choosePreset}
        options={stylePresets.map((p) => ({ id: p.id, label: p.label, swatch: p.ground }))}
      />
      <RadioRow label="Type" kind="toggle" value={type.id} onChange={chooseType} options={typePairs.map((t) => ({ id: t.id, label: t.label }))} />
    </div>
  );
}
