# PAL-ONE — API Documentation

- **Base URL:** `/api`. In development that's `http://localhost:5173/api` through the Vite proxy, or `http://localhost:4000/api` directly.
- **Format:** JSON (UTF-8). Every endpoint is a read-only `GET`.
- **Contract:** the TypeScript types live in [`shared/api.ts`](../shared/api.ts).

## Conventions

| Topic | Rule |
|---|---|
| Success body | `{ "data": … }`, plus `pagination` / `facets` / `related` where noted |
| Error body | `{ "error": { "status", "code", "message", "details?" } }` |
| Identifiers | resources are addressed by **slug** (`^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 100 chars); internal ids are never returned |
| Bilingual fields | every text field comes in pairs: `nameAr` / `nameEn`, `descriptionAr` / `descriptionEn`, … |
| Visibility | only services with `status = published` in active categories are returned |
| Caching | successful responses: `Cache-Control: public, max-age=30`; errors and `/health`: `no-store` |
| Rate limit | `RATE_LIMIT_PER_MINUTE` per IP (default 120); `RateLimit-*` headers (draft-7) |
| CORS | origins from `CORS_ORIGIN`; methods `GET, HEAD, OPTIONS` |
| Repeated params | for scalar params only the first value is used; `type` accepts repeats or a comma list |

## Endpoints

| Method & path | Description |
|---|---|
| `GET /api/health` | API and database status |
| `GET /api/statistics` | Public aggregate counts |
| `GET /api/categories` | All active categories with subcategories and counts |
| `GET /api/categories/:slug` | One category, its subcategories and its services |
| `GET /api/services` | Paged, filtered and sorted list of services |
| `GET /api/services/featured` | Featured services |
| `GET /api/services/recent` | Most recently added services |
| `GET /api/services/:slug` | Full details of one service, plus related services |
| `GET /api/search` | Full-text style search (same filters as `/services`) |
| `/api/admin/*` | Reserved admin API; currently always `403` |

---

### GET /api/health

**200** `{ "data": { "status": "ok", "database": "up" }` · **503** `{ "data": { "status": "degraded", "database": "down" } }`

### GET /api/statistics

```json
{ "data": { "totalServices": 25, "totalCategories": 10, "totalSubcategories": 21, "totalVerified": 0, "lastUpdated": "2026-11-26T13:39:44.795Z" } }
```

Only aggregate public counts. Nothing about drafts or administrators is included.

### GET /api/categories

Active categories in display order. Each one includes its subcategories and the number of published services.

```json
{
  "data": [
    {
      "slug": "banking-finance",
      "nameAr": "البنوك والخدمات المالية",
      "nameEn": "Banking & finance",
      "taglineAr": "البنوك والمحافظ الرقمية",
      "taglineEn": "Banking & digital wallets",
      "icon": "finance",
      "tint": "mist",
      "descriptionAr": "البنوك ومزوّدو الدفع الإلكتروني والمحافظ الرقمية في فلسطين.",
      "descriptionEn": "Palestinian banks, electronic payment providers, and digital wallets.",
      "headlineAr": "إدارة أموالك بوضوح أكبر.",
      "headlineEn": "Manage your money with more clarity.",
      "image": null,
      "serviceCount": 2,
      "subcategories": [
        { "slug": "banks", "nameAr": "البنوك", "nameEn": "Banks", "descriptionAr": "", "descriptionEn": "", "serviceCount": 1 }
      ]
    }
  ]
}
```

### GET /api/categories/:slug

| Param | In | Type | Default | Rules |
|---|---|---|---|---|
| `slug` | path | string | — | slug format |
| `servicesLimit` | query | integer | `100` | `0`–`100`; `0` returns the category without services |

**200** returns the same object as one item of `/categories`, plus `services: ServiceDTO[]` (curated order). **404** `NOT_FOUND` for an unknown or inactive category. **400** for a malformed slug or limit.

### GET /api/services

| Param | Type | Default | Rules / meaning |
|---|---|---|---|
| `q` | string | — | ≤ 100 chars; every word must match (see *Search*) |
| `category` | slug | — | category slug |
| `subcategory` | slug | — | subcategory slug |
| `type` | list | — | `website`, `mobile-app`, `website-and-app`; comma list or repeated. `website` and `mobile-app` also match `website-and-app`; raw value ≤ 100 chars |
| `location` | enum | — | `nationwide`, `jerusalem`, `ramallah`, `birzeit`, `nablus`, `bethlehem`, `hebron`, `jenin`, `gaza` |
| `featured` | `true` / `false` | — | |
| `sort` | enum | `recommended` | `recommended` (relevance to `q`, then featured, then curated order) · `recent` (newest first) · `alphabetical` |
| `lang` | `ar` / `en` | `ar` | which name `alphabetical` sorts by |
| `page` | integer | `1` | 1–10 000 |
| `pageSize` | integer | `12` | 1–50 |

Example: `GET /api/services?category=communication&pageSize=1&lang=en`

```json
{
  "data": [
    {
      "slug": "jawwal",
      "nameAr": "جوّال",
      "nameEn": "Jawwal",
      "descriptionAr": "اكتشف باقات الهاتف المحمول والاتصال ودعم العملاء من جوّال.",
      "descriptionEn": "Discover mobile plans, connectivity, and customer support from Jawwal.",
      "logo": null,
      "serviceType": "website-and-app",
      "location": "nationwide",
      "languages": ["ar", "en"],
      "isFeatured": true,
      "isVerified": false,
      "isDemo": true,
      "dateAdded": "2026-01-15T09:00:00.000Z",
      "category": { "slug": "communication", "nameAr": "الاتصالات والإنترنت", "nameEn": "Communication", "taglineAr": "ابقَ على اتصال", "taglineEn": "Telecom & internet", "icon": "telecom", "tint": "sky" },
      "subcategory": { "slug": "mobile", "nameAr": "الاتصالات الخلوية", "nameEn": "Mobile" }
    }
  ],
  "pagination": { "page": 1, "pageSize": 1, "total": 3, "totalPages": 3 },
  "facets": {
    "categories": [{ "slug": "banking-finance", "count": 2 }, { "slug": "education", "count": 6 }, { "slug": "communication", "count": 3 }],
    "locations": [{ "location": "nationwide", "count": 1 }]
  }
}
```

`facets.categories` counts ignore the category and subcategory filters, and `facets.locations` counts ignore the location filter. That lets a filter UI show how many results each option would give. A `page` past the end returns `data: []` with the real `total`.

### GET /api/services/featured · GET /api/services/recent

| Param | Type | Default | Rules |
|---|---|---|---|
| `limit` | integer | `6` | 1–24 |

**200** `{ "data": ServiceDTO[] }`. Featured services come back in curated order; recent ones newest first.

### GET /api/services/:slug

**200** returns the full detail object and up to 3 related services (same category first):

```json
{
  "data": {
    "slug": "bank-of-palestine",
    "nameAr": "بنك فلسطين",
    "nameEn": "Bank of Palestine",
    "serviceType": "website-and-app",
    "location": "nationwide",
    "languages": ["ar", "en"],
    "category": { "slug": "banking-finance", "…": "…" },
    "subcategory": { "slug": "banks", "nameAr": "البنوك", "nameEn": "Banks" },
    "officialWebsite": null,
    "googlePlayUrl": null,
    "appStoreUrl": null,
    "contactEmail": null,
    "contactPhone": null,
    "highlights": [
      { "titleAr": "الخدمات المصرفية للأفراد والشركات", "titleEn": "Personal & business banking", "textAr": "…", "textEn": "…" }
    ],
    "isDemo": true,
    "updatedAt": "2026-11-26T13:39:44.795Z"
  },
  "related": [ "ServiceDTO", "ServiceDTO", "ServiceDTO" ]
}
```

**404** for an unknown, draft or archived service.

### GET /api/search

Same parameters and response as `GET /api/services`, but `q` is **required** (1–100 chars).

Search behaviour:

- **Fields searched:** Arabic and English names and descriptions, plus category names, category taglines and subcategory names in both languages.
- **Case and accents:** case-insensitive for Latin text; Latin accents are ignored.
- **Arabic handling:** diacritics and tatweel are ignored. Letter variants are folded (أ/إ/آ/ٱ→ا, ة→ه, ى→ي, ؤ→و, ئ→ي), and the definite article `ال` is dropped from words longer than 3 letters.
- **Multiple words:** every word must match somewhere in the listing.
- **Ranking:** with `sort=recommended`, name matches come first.
- **Symbols-only queries:** a query made only of punctuation or wildcards (`%`, `_`) returns no results.

```bash
curl "http://localhost:4000/api/search?q=%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9%D9%87&pageSize=5"   # الجامعه → 5 universities
curl "http://localhost:4000/api/search?q=university&location=nablus"                              # An-Najah University
```

### /api/admin/*

This is a separate router for future administration. Until authentication is implemented, every request gets **403** `FORBIDDEN`.

---

## Error codes

| HTTP | `code` | When | Example `message` |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | invalid query or path parameter (see `details`) | `Invalid request parameters` |
| 400 | `BAD_REQUEST` | malformed request body | `Malformed JSON body` |
| 403 | `FORBIDDEN` | admin API | `The admin API is not enabled yet.` |
| 404 | `NOT_FOUND` | unknown category, service or endpoint | `Service "nope" was not found` |
| 429 | `RATE_LIMITED` | per-IP limit exceeded | `Too many requests. Please slow down and try again shortly.` |
| 500 | `INTERNAL_ERROR` | unexpected failure (details logged on the server only) | `Something went wrong. Please try again later.` |

Validation example: `GET /api/services?page=0&type=fax`

```json
{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      { "path": "type.0", "message": "Invalid option: expected one of \"website\"|\"mobile-app\"|\"website-and-app\"" },
      { "path": "page", "message": "Too small: expected number to be >=1" }
    ]
  }
}
```
