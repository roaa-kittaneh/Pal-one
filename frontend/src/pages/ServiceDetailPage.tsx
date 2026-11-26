import { ArrowUpRight, Check, Info, Link2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { IconChip } from '../components/CategoryIcon';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceCard } from '../components/ServiceCard';
import { CardGridSkeleton, ErrorState } from '../components/StatusViews';
import { useService } from '../hooks/useCatalog';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';
import { serviceDescription, serviceName } from '../utils/format';

export default function ServiceDetailPage() {
  const { slug = '' } = useParams();
  const { t, lang, loc } = useLanguage();
  const d = t.detail;
  const req = useService(slug);
  // Ignore cached data from a different slug while the new one loads
  const service = req.data?.data.slug === slug ? req.data.data : undefined;
  const related = req.data?.related ?? [];
  const [copied, setCopied] = useState(false);
  useDocumentTitle(service ? serviceName(service, lang) : req.error?.isNotFound ? d.notFoundTitle : undefined);

  if (req.error && !req.error.isNotFound) {
    return (
      <div className="container-page py-16">
        <ErrorState onRetry={req.retry} />
      </div>
    );
  }
  if (!service && !req.error) {
    return (
      <>
        <section className="bg-forest">
          <div className="container-page h-[320px] animate-pulse" aria-busy="true" />
        </section>
        <section className="container-page py-10 lg:py-14">
          <CardGridSkeleton count={3} />
        </section>
      </>
    );
  }
  if (!service) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-heading">{d.notFoundTitle}</h1>
        <p className="mt-3 text-muted">{d.notFoundText}</p>
        <Link to="/services" className="btn-primary mt-7">
          {t.nav.explore}
        </Link>
      </div>
    );
  }

  const { category } = service;
  const name = serviceName(service, lang);
  const langs = service.languages.length === 2 ? t.languages.both : t.languages[service.languages[0]];
  const highlights = service.highlights.length
    ? service.highlights.map((h) => ({ title: loc(h, 'title'), text: loc(h, 'text') }))
    : d.genericHighlights;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const info: [string, string][] = [
    [d.organization, name],
    [d.sector, loc(category, 'name')],
    [d.type, t.serviceType[service.serviceType]],
    [d.location, t.location[service.location]],
    [d.languages, langs],
    [d.availability, d.checkOfficial],
  ];
  if (service.contactEmail) info.push([d.email, service.contactEmail]);
  if (service.contactPhone) info.push([d.phone, service.contactPhone]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-forest text-white">
        <div className="container-page py-8 lg:pt-8 lg:pb-16">
          <Breadcrumbs tone="inverse" items={[{ label: loc(category, 'name'), to: `/categories/${category.slug}` }, { label: name }]} />
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:gap-8 lg:mt-10">
            <IconChip icon={category.icon} size="xl" className="bg-[#e8eee6]" />
            <div className="min-w-0">
              <p className="eyebrow text-lime-ink">{loc(category, 'name')}</p>
              <h1 className="font-display mt-2 text-[32px] leading-tight font-semibold tracking-[-0.02em] sm:text-[44px] lg:text-[48px]">
                {name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">{serviceDescription(service, lang)}</p>
              <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/70 lg:text-[13px]">
                <span>{t.location[service.location]}</span>
                <span aria-hidden="true">·</span>
                <span>{langs}</span>
                <span aria-hidden="true">·</span>
                <span>{t.serviceType[service.serviceType]}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────── */}
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:py-14">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold text-heading lg:text-[28px]">{d.closerLook}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted lg:text-[15px]">{d.intro(name, loc(category, 'name'))}</p>

          <h3 className="font-display mt-10 text-xl font-semibold text-heading lg:text-[22px]">{d.whatExplore}</h3>
          <ul className="mt-5 space-y-6">
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-4">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-heading" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-heading lg:text-[15px]">{h.title}</span>
                  <span className="mt-1.5 block text-[13px] text-muted lg:text-sm">{h.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 max-w-3xl rounded-2xl bg-chip p-5 lg:p-6">
            <p className="text-sm font-semibold text-heading lg:text-[15px]">{d.safetyTitle}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{d.safetyText}</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
            <p className="eyebrow text-heading">{d.accessEyebrow}</p>
            <h2 className="font-display mt-3 text-xl font-semibold text-heading lg:text-2xl">{d.accessTitle}</h2>
            {service.officialWebsite ? (
              <>
                <p className="mt-2 text-sm text-muted" dir="ltr">
                  {new URL(service.officialWebsite).hostname}
                </p>
                <a href={service.officialWebsite} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 h-12 w-full">
                  {d.visitWebsite}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              </>
            ) : (
              <>
                <button type="button" disabled className="btn-primary mt-5 h-12 w-full">
                  {d.linkPending}
                </button>
                <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {d.linkPendingText}
                </p>
              </>
            )}
            <p className="eyebrow mt-6 text-heading">{d.appEyebrow}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{d.appText}</p>
            <p className="mt-6 flex items-center gap-1.5 text-[11px] text-muted">
              <ArrowUpRight className="size-3 rtl:-scale-x-100" aria-hidden="true" />
              {d.external}
            </p>
          </div>

          <button type="button" onClick={copyLink} className="btn-outline h-11 w-full" aria-live="polite">
            {copied ? <Check className="size-4 text-pine" /> : <Link2 className="size-4" />}
            {copied ? d.copied : d.share}
          </button>

          <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
            <h2 className="text-sm font-semibold text-heading lg:text-[15px]">{d.providerInfo}</h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-xs lg:text-[13px]">
              {info.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="break-words text-ink" dir="auto">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>

      {/* ── Related ──────────────────────────────────────── */}
      <section className="container-page pb-14 lg:pb-16">
        <SectionHeader title={d.keepExploring} subtitle={d.keepExploringSub} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {related.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>
    </>
  );
}
