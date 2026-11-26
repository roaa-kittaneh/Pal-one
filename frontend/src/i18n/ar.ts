import type { Dict } from './en';

/** Arabic counted noun: خدمة / خدمتان / خدمات / خدمة */
const arCount = (n: number, w: { one: string; two: string; few: string; many: string }) => {
  if (n === 0) return `0 ${w.few}`;
  if (n === 1) return `${w.one} واحدة`;
  if (n === 2) return w.two;
  if (n <= 10) return `${n} ${w.few}`;
  return `${n} ${w.many}`;
};
const services = (n: number) => arCount(n, { one: 'خدمة', two: 'خدمتان', few: 'خدمات', many: 'خدمة' });
const results = (n: number) => arCount(n, { one: 'نتيجة', two: 'نتيجتين', few: 'نتائج', many: 'نتيجة' });

export const ar: Dict = {
  brand: 'PAL-ONE',
  tagline: 'كل الخدمات الرقمية الفلسطينية، في مكان واحد.',
  taglineAlt: 'All Palestinian Digital Services. One Place.',
  skipToContent: 'انتقل إلى المحتوى',

  nav: {
    discover: 'اكتشف',
    categories: 'الفئات',
    explore: 'استكشف كل الخدمات',
    about: 'عن PAL-ONE',
    menu: 'فتح القائمة',
    close: 'إغلاق القائمة',
    openSearch: 'البحث في الدليل',
    home: 'الرئيسية',
    main: 'التنقل الرئيسي',
  },
  lang: {
    switchTo: 'English',
    switchAria: 'Switch to English',
  },

  search: {
    placeholder: 'ابحث عن خدمات أو تطبيقات أو مؤسسات…',
    button: 'بحث',
    label: 'البحث في الدليل',
    try: 'جرّب:',
    suggestions: ['بنك', 'بوابة الطلبة', 'الإنترنت', 'دعم الأعمال'],
  },

  serviceType: {
    website: 'موقع إلكتروني',
    'mobile-app': 'تطبيق جوال',
    'website-and-app': 'موقع إلكتروني · تطبيقات',
  },
  serviceTypeFilter: {
    website: 'موقع إلكتروني',
    'mobile-app': 'تطبيق جوال',
    'website-and-app': 'موقع وتطبيق',
  },
  location: {
    nationwide: 'فلسطين',
    ramallah: 'رام الله',
    jerusalem: 'القدس',
    nablus: 'نابلس',
    bethlehem: 'بيت لحم',
    hebron: 'الخليل',
    jenin: 'جنين',
    gaza: 'غزة',
    birzeit: 'بيرزيت',
  },
  languages: { ar: 'العربية', en: 'الإنجليزية', both: 'العربية والإنجليزية' },

  status: {
    loading: 'جارٍ التحميل…',
    errorTitle: 'تعذّر تحميل المحتوى الآن.',
    errorText: 'تحقّق من اتصالك وحاول مرة أخرى. إذا استمرت المشكلة فقد يكون الدليل غير متاح مؤقتًا.',
    retry: 'حاول مرة أخرى',
  },
  stats: (n: number, c: number) => `${services(n)} ضمن ${c} فئات`,

  card: {
    viewService: 'عرض الخدمة',
    recentlyAdded: 'أُضيفت حديثًا',
    featured: 'مميّزة',
  },

  sort: {
    label: 'الترتيب',
    recommended: 'الموصى بها',
    recent: 'الأحدث إضافة',
    alphabetical: 'أبجديًا',
  },

  home: {
    eyebrow: 'متجذّرة في فلسطين. قريبة منك.',
    titleLines: ['كل الخدمات', 'الرقمية الفلسطينية.', 'في مكان واحد.'],
    subtitle: 'اعثر على المواقع والتطبيقات والخدمات التي تجعل حياتك اليومية أسهل.',
    heroCard: {
      eyebrow: 'أقرب قليلًا إلى ما تحتاجه',
      title: 'اتصالك القادم يبدأ من هنا.',
      items: [
        { title: 'نظّم يومك', sub: 'المال والاتصالات والأساسيات', to: '/categories/banking-finance' },
        { title: 'تعلّم شيئًا جديدًا', sub: 'التعليم والفرص', to: '/categories/education' },
        { title: 'ابنِ فكرتك القادمة', sub: 'الأعمال والأدوات الرقمية', to: '/categories/business-services' },
      ],
    },
    categoriesEyebrow: 'استكشف الدليل',
    categoriesTitle: 'عمّ تبحث؟',
    viewAllCategories: 'عرض كل الفئات',
    featuredTitle: 'روابط مفيدة تستحق الاستكشاف.',
    featuredSub: 'نقطة انطلاق لحياتك الرقمية اليومية.',
    exploreAll: 'استكشف كل الخدمات',
    recentTitle: 'أُضيفت حديثًا',
    recentSub: 'أحدث الخدمات المُدرجة في الدليل.',
    howTitle: 'طريقة أبسط لتجد طريقك.',
    steps: [
      { title: 'اكتشف', text: 'ابحث بالاسم أو تصفّح إحدى الفئات.' },
      { title: 'اطّلع على الصورة كاملة', text: 'تعرّف على الخدمة وقنواتها والجهة المزوّدة.' },
      { title: 'تابع بثقة', text: 'افتح الموقع أو التطبيق الرسمي للجهة المزوّدة.' },
    ],
    howNote: 'PAL-ONE يساعدك على الاكتشاف، والجهة المزوّدة تقدّم الخدمة.',
    ctaTitle: 'هناك المزيد لتكتشفه.',
    ctaText: 'تصفّح كل الخدمات الفلسطينية في الدليل، في مكان واحد.',
    ctaButton: 'استكشف الدليل',
  },

  categoriesPage: {
    title: 'كل ما تحتاجه في حياتك اليومية.',
    subtitle: 'تصفّح الخدمات الرقمية الفلسطينية حسب الفئة وانتقل مباشرة إلى ما تحتاجه.',
    count: (n: number) => (n === 0 ? 'قريبًا' : services(n)),
    heading: 'كل الفئات',
    summary: (c: number, s: number) => `${c} فئات · ${services(s)}`,
    browse: 'تصفّح الفئة',
  },

  categoryPage: {
    heading: (name: string) => `خدمات ${name}`,
    countLine: (n: number, subs: string) => `${services(n)} · ${subs}`,
    searchPlaceholder: 'ابحث في هذه الفئة…',
    allSubcategories: 'الكل',
    serviceType: 'نوع الخدمة',
    allTypes: 'كل الأنواع',
    location: 'الموقع',
    allLocations: 'كل المواقع',
    notFoundTitle: 'لم نعثر على هذه الفئة.',
    notFoundText: 'ربما تغيّر اسمها. يمكنك تصفّح كل الفئات بدلًا من ذلك.',
    notFoundCta: 'عرض كل الفئات',
    disclaimer:
      'PAL-ONE مستقل عن المؤسسات المُدرجة. تحقّق دائمًا من التفاصيل وشروط الأهلية عبر الموقع الرسمي.',
    otherCategories: 'فئات أخرى',
  },

  explorePage: {
    title: 'اعثر على اتصالك القادم.',
    subtitle: 'استكشف المواقع والتطبيقات والمؤسسات الفلسطينية، كلها في دليل واحد.',
    sideNote: 'دليل رقمي متنامٍ يقوده المجتمع.',
    filterTitle: 'تصفية الخدمات',
    reset: 'إعادة تعيين',
    category: 'الفئة',
    allCategories: 'كل الفئات',
    subcategory: 'الفئة الفرعية',
    allSubcategories: 'كل الفئات الفرعية',
    serviceType: 'نوع الخدمة',
    location: 'الموقع',
    allLocations: 'كل المواقع',
    resultsCount: (n: number) => `${services(n)} للاستكشاف`,
    showing: (a: number, b: number, n: number) => `عرض ${a}–${b} من ${services(n)}`,
    next: 'التالي',
    previous: 'السابق',
    page: (n: number) => `الصفحة ${n}`,
    filters: 'التصفية',
    hideFilters: 'إخفاء التصفية',
    showResults: (n: number) => `عرض ${results(n)}`,
    note: 'تنقلك القوائم إلى الجهة المزوّدة. قد يختلف التوفّر والشروط.',
  },

  searchPage: {
    title: 'ابحث في الدليل.',
    resultsFor: (q: string) => `نتائج البحث عن «${q}»`,
    count: (n: number) => (n === 0 ? 'لم يتم العثور على خدمات' : `تم العثور على ${services(n)}`),
    promptTitle: 'عمّ تريد أن تبحث؟',
    promptText: 'ابحث باسم الخدمة بالعربية أو الإنجليزية، أو بالوصف، أو بالفئة.',
    popular: 'عمليات بحث شائعة',
    browseCategories: 'أو تصفّح حسب الفئة',
  },

  empty: {
    title: 'لا توجد خدمات تطابق بحثك.',
    text: 'جرّب كلمات مختلفة، أو تحقّق من الإملاء، أو أزل أحد عوامل التصفية.',
    clearSearch: 'مسح البحث',
    clearFilters: 'مسح عوامل التصفية',
  },

  detail: {
    closerLook: 'نظرة أقرب',
    intro: (name: string, category: string) =>
      `${name} مُدرجة ضمن فئة ${category}. استخدم هذه الصفحة للتعرّف على الجهة المزوّدة واستكشاف قنواتها الرقمية، ثم تابع إلى المصدر الرسمي للحصول على أحدث المعلومات.`,
    whatExplore: 'ما يمكنك استكشافه',
    genericHighlights: [
      { title: 'الخدمات والمعلومات', text: 'تعرّف على ما تقدّمه الجهة المزوّدة ولمن.' },
      { title: 'القنوات الرقمية الرسمية', text: 'اعثر على الموقع والتطبيقات الرسمية للجهة المزوّدة.' },
      { title: 'التواصل والدعم', text: 'تواصل مع الجهة المزوّدة مباشرة للمساعدة والتحديثات.' },
    ],
    safetyTitle: 'أنت في المكان المناسب للاكتشاف، لا لإجراء المعاملات.',
    safetyText:
      'لا يدير PAL-ONE الحسابات أو المدفوعات أو خدمة العملاء. لا تشارك أبدًا كلمات المرور أو بياناتك الشخصية في صفحة دليل.',
    accessEyebrow: 'تابع إلى الجهة المزوّدة',
    accessTitle: 'الوصول إلى هذه الخدمة',
    visitWebsite: 'زيارة الموقع الرسمي',
    linkPending: 'الرابط الرسمي قيد التحقق',
    linkPendingText: 'هذه بيانات تجريبية. ستتم إضافة الرابط الرسمي للجهة المزوّدة بعد التأكد منه.',
    appEyebrow: 'تبحث عن التطبيق؟',
    appText: 'اعثر على روابط iOS وAndroid عبر الموقع الرسمي للجهة المزوّدة لتجنّب التطبيقات غير الرسمية.',
    external: 'ينقلك إلى منصة خارجية تابعة للجهة المزوّدة',
    providerInfo: 'معلومات الجهة المزوّدة',
    organization: 'المؤسسة',
    sector: 'القطاع',
    type: 'نوع الخدمة',
    location: 'الموقع',
    languages: 'اللغات',
    availability: 'التوفّر',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    checkOfficial: 'راجع الموقع الرسمي',
    keepExploring: 'تابع الاستكشاف',
    keepExploringSub: 'خدمات ذات صلة وأساسيات يومية.',
    notFoundTitle: 'لم نعثر على هذه الخدمة.',
    notFoundText: 'ربما نُقلت هذه الصفحة. ابحث في الدليل للعثور عليها.',
    share: 'نسخ الرابط',
    copied: 'تم نسخ الرابط',
  },

  footer: {
    discover: 'اكتشف الخدمات',
    categories: 'الفئات',
    explore: 'كل الخدمات',
    about: 'من نحن',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الاستخدام',
    copyright: '© 2026 PAL-ONE. منصة اكتشاف مستقلة.',
    external: 'تُفتح الخدمات عبر المنصات الرسمية للجهات المزوّدة.',
    demo: 'القوائم المعروضة محتوى تجريبي.',
    nav: 'روابط التذييل',
  },

  legal: {
    privacyTitle: 'سياسة الخصوصية',
    termsTitle: 'شروط الاستخدام',
    draft: 'مسودة — لأغراض العرض التجريبي',
    privacy: [
      'PAL-ONE دليل عام يمكنك استخدامه دون إنشاء حساب.',
      'لا نطلب أي معلومات شخصية ولا نجمعها ولا نخزّنها. يُحفظ تفضيل اللغة في متصفحك فقط.',
      'عند انتقالك إلى موقع جهة مزوّدة، تسري سياسة الخصوصية الخاصة بتلك الجهة.',
    ],
    terms: [
      'يُدرج PAL-ONE الخدمات الرقمية الفلسطينية لمساعدة الناس على اكتشافها، ولا يقدّم الخدمات المُدرجة أو يشغّلها أو يتبنّاها.',
      'القوائم لأغراض المعلومات فقط. تحقّق دائمًا من التفاصيل والتوفّر والشروط عبر المنصة الرسمية للجهة المزوّدة.',
      'المحتوى في هذه النسخة من الموقع بيانات تجريبية وقد لا يكون دقيقًا.',
    ],
  },

  notFound: {
    title: 'هذه الصفحة سلكت طريقًا آخر.',
    text: 'الصفحة التي تبحث عنها غير موجودة. لنُعِدك إلى المسار الصحيح.',
    cta: 'العودة إلى الصفحة الرئيسية',
  },
};
