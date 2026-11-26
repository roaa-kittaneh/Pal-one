const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const en = {
  brand: 'PAL-ONE',
  tagline: 'All Palestinian Digital Services. One Place.',
  /** The tagline in the *other* language, shown as a secondary line in the footer. */
  taglineAlt: 'كل الخدمات الرقمية الفلسطينية، في مكان واحد.',
  skipToContent: 'Skip to content',

  nav: {
    discover: 'Discover',
    categories: 'Categories',
    explore: 'Explore all services',
    about: 'About PAL-ONE',
    menu: 'Open menu',
    close: 'Close menu',
    openSearch: 'Search the directory',
    home: 'Home',
    main: 'Main navigation',
  },
  lang: {
    switchTo: 'العربية',
    switchAria: 'التبديل إلى العربية',
  },

  search: {
    placeholder: 'Search services, apps, or organizations…',
    button: 'Search',
    label: 'Search the directory',
    try: 'Try:',
    suggestions: ['banking', 'university portals', 'internet', 'business support'],
  },

  serviceType: {
    website: 'Website',
    'mobile-app': 'Mobile app',
    'website-and-app': 'Website · Mobile apps',
  },
  serviceTypeFilter: {
    website: 'Website',
    'mobile-app': 'Mobile app',
    'website-and-app': 'Website & app',
  },
  location: {
    nationwide: 'Palestine',
    ramallah: 'Ramallah',
    jerusalem: 'Jerusalem',
    nablus: 'Nablus',
    bethlehem: 'Bethlehem',
    hebron: 'Hebron',
    jenin: 'Jenin',
    gaza: 'Gaza',
    birzeit: 'Birzeit',
  },
  languages: { ar: 'Arabic', en: 'English', both: 'Arabic & English' },

  status: {
    loading: 'Loading…',
    errorTitle: 'We couldn’t load this right now.',
    errorText: 'Check your connection and try again. If the problem continues, the directory may be temporarily unavailable.',
    retry: 'Try again',
  },
  stats: (services: number, categories: number) => `${plural(services, 'service', 'services')} across ${categories} categories`,

  card: {
    viewService: 'View service',
    recentlyAdded: 'Recently added',
    featured: 'Featured',
  },

  sort: {
    label: 'Sort',
    recommended: 'Recommended',
    recent: 'Recently added',
    alphabetical: 'Alphabetical',
  },

  home: {
    eyebrow: 'Rooted in Palestine. Connected to you.',
    titleLines: ['All Palestinian', 'Digital Services.', 'One Place.'],
    subtitle: 'Find the websites, apps, and services that make everyday life easier.',
    heroCard: {
      eyebrow: 'A little closer to what you need',
      title: 'Your next connection starts here.',
      items: [
        { title: 'Manage your everyday', sub: 'Finance, telecom & essentials', to: '/categories/banking-finance' },
        { title: 'Learn something new', sub: 'Education & opportunities', to: '/categories/education' },
        { title: 'Build your next idea', sub: 'Business & digital tools', to: '/categories/business-services' },
      ],
    },
    categoriesEyebrow: 'Explore the directory',
    categoriesTitle: 'What are you looking for?',
    viewAllCategories: 'View all categories',
    featuredTitle: 'Useful connections, worth exploring.',
    featuredSub: 'A starting point for your everyday digital life.',
    exploreAll: 'Explore all services',
    recentTitle: 'Recently added',
    recentSub: 'The newest listings in the directory.',
    howTitle: 'A simpler way to find your way.',
    steps: [
      { title: 'Discover', text: 'Search a name or explore a category.' },
      { title: 'Get the full picture', text: 'Check the service, channels, and provider.' },
      { title: 'Continue with confidence', text: 'Open the provider’s official website or app.' },
    ],
    howNote: 'PAL-ONE helps you discover. The provider delivers the service.',
    ctaTitle: 'There’s more to discover.',
    ctaText: 'Browse every Palestinian service in the directory, all in one place.',
    ctaButton: 'Explore the directory',
  },

  categoriesPage: {
    title: 'Every corner of everyday life.',
    subtitle: 'Browse Palestinian digital services by category and go straight to what you need.',
    count: (n: number) => (n === 0 ? 'Coming soon' : plural(n, 'service', 'services')),
    heading: 'All categories',
    summary: (c: number, s: number) => `${c} categories · ${plural(s, 'service', 'services')}`,
    browse: 'Browse category',
  },

  categoryPage: {
    heading: (name: string) => `${name} services`,
    countLine: (n: number, subs: string) => `${plural(n, 'service', 'services')} · ${subs}`,
    searchPlaceholder: 'Search in this category…',
    allSubcategories: 'All',
    serviceType: 'Service type',
    allTypes: 'All types',
    location: 'Location',
    allLocations: 'All locations',
    notFoundTitle: 'We couldn’t find that category.',
    notFoundText: 'It may have been renamed. Browse all categories instead.',
    notFoundCta: 'View all categories',
    disclaimer:
      'PAL-ONE is independent of the listed institutions. Always check details and eligibility on the official website.',
    otherCategories: 'Other categories',
  },

  explorePage: {
    title: 'Find your next connection.',
    subtitle: 'Explore Palestinian websites, apps, and organizations, all in one directory.',
    sideNote: 'A growing, community-led digital directory.',
    filterTitle: 'Filter services',
    reset: 'Reset',
    category: 'Category',
    allCategories: 'All categories',
    subcategory: 'Subcategory',
    allSubcategories: 'All subcategories',
    serviceType: 'Service type',
    location: 'Location',
    allLocations: 'All locations',
    resultsCount: (n: number) => `${plural(n, 'service', 'services')} to explore`,
    showing: (a: number, b: number, n: number) => `Showing ${a}–${b} of ${plural(n, 'service', 'services')}`,
    next: 'Next',
    previous: 'Previous',
    page: (n: number) => `Page ${n}`,
    filters: 'Filters',
    hideFilters: 'Hide filters',
    showResults: (n: number) => `Show ${plural(n, 'result', 'results')}`,
    note: 'Listings link to the provider. Availability and terms may vary.',
  },

  searchPage: {
    title: 'Search the directory.',
    resultsFor: (q: string) => `Results for “${q}”`,
    count: (n: number) => `${plural(n, 'service', 'services')} found`,
    promptTitle: 'What would you like to find?',
    promptText: 'Search by service name in Arabic or English, by description, or by category.',
    popular: 'Popular searches',
    browseCategories: 'Or browse by category',
  },

  empty: {
    title: 'No services match your search.',
    text: 'Try different keywords, check the spelling, or remove a filter.',
    clearSearch: 'Clear search',
    clearFilters: 'Clear filters',
  },

  detail: {
    closerLook: 'A closer look',
    intro: (name: string, category: string) =>
      `${name} is listed under ${category}. Use this listing to discover the provider, explore its digital channels, and continue to the official provider for current information.`,
    whatExplore: 'What you can explore',
    genericHighlights: [
      { title: 'Services & information', text: 'Learn what the provider offers and who it is for.' },
      { title: 'Official digital channels', text: 'Find the provider’s official website and apps.' },
      { title: 'Contact & support', text: 'Reach the provider directly for help and updates.' },
    ],
    safetyTitle: 'You’re in the right place to discover—not transact.',
    safetyText:
      'PAL-ONE does not manage accounts, payments, or customer support. Never share passwords or personal credentials on a directory listing.',
    accessEyebrow: 'Continue to the provider',
    accessTitle: 'Access this service',
    visitWebsite: 'Visit official website',
    linkPending: 'Official link pending verification',
    linkPendingText: 'This is demonstration data. The provider’s official link will be added once it has been confirmed.',
    appEyebrow: 'Looking for the mobile app?',
    appText: 'Find iOS and Android links on the provider’s official website to avoid unofficial apps.',
    external: 'Opens an external provider platform',
    providerInfo: 'Provider information',
    organization: 'Organization',
    sector: 'Sector',
    type: 'Service type',
    location: 'Location',
    languages: 'Languages',
    availability: 'Availability',
    email: 'Email',
    phone: 'Phone',
    checkOfficial: 'Check official website',
    keepExploring: 'Keep exploring',
    keepExploringSub: 'Related services and everyday essentials.',
    notFoundTitle: 'We couldn’t find that service.',
    notFoundText: 'The listing may have moved. Search the directory to find it.',
    share: 'Copy link',
    copied: 'Link copied',
  },

  footer: {
    discover: 'Discover services',
    categories: 'Categories',
    explore: 'All services',
    about: 'About us',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
    copyright: '© 2026 PAL-ONE. An independent discovery platform.',
    external: 'Services open on their providers’ official platforms.',
    demo: 'Listings shown are demonstration content.',
    nav: 'Footer',
  },

  legal: {
    privacyTitle: 'Privacy policy',
    termsTitle: 'Terms of use',
    draft: 'Draft — for demonstration purposes',
    privacy: [
      'PAL-ONE is a public directory that you can use without creating an account.',
      'We do not ask for, collect, or store personal information. Your language preference is saved only in your own browser.',
      'When you follow a link to a provider, that provider’s own privacy policy applies.',
    ],
    terms: [
      'PAL-ONE lists Palestinian digital services to help people discover them. It does not provide, operate, or endorse the listed services.',
      'Listings are informational. Always confirm details, availability, and terms on the provider’s official platform.',
      'The content in this version of the site is demonstration data and may not be accurate.',
    ],
  },

  notFound: {
    title: 'This page took a different path.',
    text: 'The page you’re looking for doesn’t exist. Let’s get you back on track.',
    cta: 'Back to Discover',
  },
};

export type Dict = typeof en;
