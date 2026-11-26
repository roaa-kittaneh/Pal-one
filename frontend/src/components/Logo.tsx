import { Link } from 'react-router-dom';

export function Logo({ tone = 'default' }: { tone?: 'default' | 'lime' }) {
  return (
    <Link
      to="/"
      dir="ltr"
      className={`font-display text-xl font-bold tracking-[-0.01em] lg:text-[26px] ${tone === 'lime' ? 'text-lime-ink' : 'text-heading'}`}
      style={{ fontFamily: 'Manrope, Inter, sans-serif' }}
    >
      PAL-ONE
    </Link>
  );
}
