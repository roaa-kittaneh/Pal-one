import { Breadcrumbs } from '../components/Breadcrumbs';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { t } = useLanguage();
  const title = kind === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle;
  const body = kind === 'privacy' ? t.legal.privacy : t.legal.terms;
  useDocumentTitle(title);
  return (
    <div className="container-page max-w-[900px] py-10 lg:py-14">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="font-display mt-6 text-[32px] font-semibold text-heading sm:text-[40px]">{title}</h1>
      <p className="mt-2 inline-block rounded-full bg-chip px-3 py-1 text-xs text-heading">{t.legal.draft}</p>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink">
        {body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
