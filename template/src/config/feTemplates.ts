/**
 * Katalog template frontend (landing) — kurasi dari opentailwind
 * (https://github.com/lindoai/opentailwind, MIT). Tiap template self-contained
 * (HTML + Tailwind v4 CDN). Hanya DEFAULT yang di-bundle; lainnya di-download
 * on-demand saat admin memilihnya (lihat FeTemplateService).
 */
export interface FeTemplate {
    /** Nama file opentailwind (tanpa .html) = id unik. */
    slug: string
    /** Nama tampil di switcher. */
    name: string
    /** Kategori (untuk pengelompokan). */
    category: string
}

/** Basis URL raw GitHub opentailwind untuk download on-demand. */
export const FE_TEMPLATE_BASE_URL =
    'https://raw.githubusercontent.com/lindoai/opentailwind/master/landings'

/** Folder cache lokal (relatif root app). */
export const FE_TEMPLATE_DIR = 'public/fe/templates'

/** Katalog kurasi (~15 dari 640 landing opentailwind). */
export const FE_TEMPLATES: FeTemplate[] = [
    { slug: 'agency-consulting-002-creative-agency', name: 'Creative Agency', category: 'Agency' },
    { slug: 'agency-consulting-001-digital-marketing-agency', name: 'Digital Marketing Agency', category: 'Agency' },
    { slug: 'technology-saas-001-hero-focused-conversion-page', name: 'SaaS — Hero Focused', category: 'Technology' },
    { slug: 'technology-saas-002-feature-rich-multi-section', name: 'SaaS — Feature Rich', category: 'Technology' },
    { slug: 'ecommerce-retail-001-fashion-boutique', name: 'Fashion Boutique', category: 'E-commerce' },
    { slug: 'ecommerce-retail-002-luxury-fashion-brand', name: 'Luxury Fashion', category: 'E-commerce' },
    { slug: 'portfolio-creative-001-creative-portfolio', name: 'Creative Portfolio', category: 'Portfolio' },
    { slug: 'portfolio-creative-002-minimal-portfolio', name: 'Minimal Portfolio', category: 'Portfolio' },
    { slug: 'professional-services-001-law-firm', name: 'Law Firm', category: 'Professional' },
    { slug: 'real-estate-property-001-real-estate-agency', name: 'Real Estate Agency', category: 'Real Estate' },
    { slug: 'food-hospitality-001-fine-dining-restaurant', name: 'Fine Dining', category: 'Food' },
    { slug: 'healthcare-wellness-001-family-doctor-clinic', name: 'Family Clinic', category: 'Healthcare' },
    { slug: 'education-training-001-private-school', name: 'Private School', category: 'Education' },
    { slug: 'fitness-sports-001-fitness-center', name: 'Fitness Center', category: 'Fitness' },
    { slug: 'travel-tourism-001-travel-agency', name: 'Travel Agency', category: 'Travel' },
]

/** Template default (di-bundle, app jalan offline). */
export const DEFAULT_FE_TEMPLATE = 'agency-consulting-002-creative-agency'

/** Slug valid untuk validasi (Joi). */
export const FE_TEMPLATE_SLUGS = FE_TEMPLATES.map((t) => t.slug)

/** Cari metadata template berdasarkan slug. */
export const getFeTemplate = (slug?: string): FeTemplate => {
    return FE_TEMPLATES.find((t) => t.slug === slug)
        || FE_TEMPLATES.find((t) => t.slug === DEFAULT_FE_TEMPLATE)!
}
