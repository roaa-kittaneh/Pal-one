import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';

export default function NotFoundPage() {
  const { t } = useLanguage();
  useDocumentTitle('404');
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-6xl font-semibold text-sage">404</p>
      <h1 className="font-display mt-4 text-3xl font-semibold text-heading">{t.notFound.title}</h1>
      <p className="mt-3 text-muted">{t.notFound.text}</p>
      <Link to="/" className="btn-primary mt-8">
        {t.notFound.cta}
      </Link>
    </div>
  );
}
