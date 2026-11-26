import { Search } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

interface SearchBarProps {
  /** Initial / controlled-from-URL value. */
  defaultValue?: string;
  placeholder?: string;
  /** Override submit (e.g. filter in place). Defaults to navigating to /search?q=… */
  onSearch?: (q: string) => void;
  /** Fires on every keystroke — used for live filtering. */
  onChange?: (q: string) => void;
  size?: 'lg' | 'md';
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  defaultValue = '',
  placeholder,
  onSearch,
  onChange,
  size = 'lg',
  autoFocus,
  className = '',
}: SearchBarProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const id = useId();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => setValue(defaultValue), [defaultValue]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (onSearch) onSearch(q);
    else navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const pad = size === 'lg' ? 'h-14 lg:h-[62px]' : 'h-12';

  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {t.search.label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border border-line bg-white ps-4 pe-1.5 shadow-card transition-colors focus-within:border-sage ${pad}`}
      >
        <Search className="size-[18px] shrink-0 text-heading" strokeWidth={1.8} aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder={placeholder ?? t.search.placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted lg:text-[15px] [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" className="btn-primary h-[42px] shrink-0 px-5 sm:px-8 lg:h-[48px] lg:px-14">
          {t.search.button}
        </button>
      </div>
    </form>
  );
}
