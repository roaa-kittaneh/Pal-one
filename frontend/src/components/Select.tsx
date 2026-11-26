import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  /** Render the label inline inside the control ("Sort: Recommended"), as in Figma. */
  inlineLabel?: boolean;
  className?: string;
}

export function Select<T extends string>({ label, value, options, onChange, inlineLabel = true, className = '' }: SelectProps<T>) {
  const id = useId();
  const current = options.find((o) => o.value === value)?.label ?? '';
  return (
    <div className={className}>
      {!inlineLabel && (
        <label htmlFor={id} className="eyebrow mb-2 block text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Visible face */}
        <div
          aria-hidden="true"
          className="pointer-events-none flex h-10 items-center justify-between gap-3 rounded-lg border border-line bg-white ps-3 pe-2.5 text-xs text-ink"
        >
          <span className="truncate">
            {inlineLabel && <span className="text-muted">{label}: </span>}
            {current}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </div>
        {/* Native select for accessibility & mobile pickers */}
        <select
          id={id}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
