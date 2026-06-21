// Peta palet tema untuk template switcher.
// Sumber: /home/mulyawan/Project/Admin/Template — 10 varian warna yang strukturnya
// identik, hanya berbeda 4 nilai warna (primary/secondary/light/dark) di tailwind.config.
// Folder "Flutter" dikecualikan karena itu proyek Flutter, bukan template web.
//
// Satu set view Tailwind (be/default) didorong oleh nilai-nilai ini via CSS variable +
// tailwind.config inline di head.ejs, sehingga ganti tema = ganti palet saat render
// tanpa menduplikasi view per warna.

export interface ThemePalette {
    primary: string
    secondary: string
    light: string
    dark: string
}

export const THEMES: { [name: string]: ThemePalette } = {
    Blue:   { primary: '#3B82F6', secondary: '#60A5FA', light: '#DBEAFE', dark: '#1E40AF' },
    Black:  { primary: '#374151', secondary: '#4B5563', light: '#6B7280', dark: '#1F2937' },
    Brown:  { primary: '#A16207', secondary: '#D97706', light: '#FEF3C7', dark: '#78350F' },
    Green:  { primary: '#10B981', secondary: '#34D399', light: '#D1FAE5', dark: '#047857' },
    Grey:   { primary: '#6B7280', secondary: '#9CA3AF', light: '#E5E7EB', dark: '#374151' },
    Orange: { primary: '#F59E0B', secondary: '#FBBF24', light: '#FEF3C7', dark: '#D97706' },
    Purple: { primary: '#8B5CF6', secondary: '#A78BFA', light: '#F3E8FF', dark: '#6D28D9' },
    Red:    { primary: '#EF4444', secondary: '#F87171', light: '#FECACA', dark: '#B91C1C' },
    Yellow: { primary: '#F59E0B', secondary: '#FCD34D', light: '#FEF3C7', dark: '#D97706' },
}

export const DEFAULT_THEME = 'Blue'

export const THEME_NAMES = Object.keys(THEMES)

export const getTheme = (name?: string): ThemePalette => {
    return (name && THEMES[name]) || THEMES[DEFAULT_THEME]
}
