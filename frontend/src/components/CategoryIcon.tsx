import {
  BookOpen,
  BriefcaseBusiness,
  Bus,
  Cross,
  Globe,
  Landmark,
  MapPin,
  ShoppingBag,
  Smartphone,
  UserRoundSearch,
  type LucideProps,
} from 'lucide-react';
import type { CategoryIcon as IconKey } from '../types';

const map: Record<IconKey, React.ComponentType<LucideProps>> = {
  finance: Landmark,
  education: BookOpen,
  telecom: Smartphone,
  shopping: ShoppingBag,
  health: Cross,
  business: BriefcaseBusiness,
  public: Globe,
  travel: MapPin,
  transport: Bus,
  employment: UserRoundSearch,
};

export function CategoryIcon({ icon, ...props }: { icon: IconKey } & LucideProps) {
  const Icon = map[icon] ?? Globe;
  return <Icon strokeWidth={1.6} aria-hidden="true" {...props} />;
}

/** The rounded square icon tile used on cards (Figma: 36×36, mist background). */
export function IconChip({
  icon,
  size = 'md',
  className = '',
}: {
  icon: IconKey;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const box = { md: 'size-10 rounded-lg lg:size-11 lg:rounded-xl', lg: 'size-12 rounded-xl', xl: 'size-16 rounded-2xl lg:size-[76px]' }[size];
  const ic = { md: 'size-5', lg: 'size-[22px]', xl: 'size-7 lg:size-8' }[size];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center bg-chip text-heading ${box} ${className}`}>
      <CategoryIcon icon={icon} className={ic} />
    </span>
  );
}
