/**
 * Theme color utilities
 */

type ThemeColorName = 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'indigo' | 'teal' | 'orange' | 'cyan';

interface ThemeColorSet {
  bg: string;
  text: string;
  border: string;
  bgLight: string;
  bgDark: string;
  borderDark: string;
}

const themeColors: Record<ThemeColorName, ThemeColorSet> = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-500',
    border: 'border-blue-200',
    bgLight: 'bg-blue-50',
    bgDark: 'bg-blue-900/20',
    borderDark: 'border-blue-800/30'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-500',
    border: 'border-green-200',
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-900/20',
    borderDark: 'border-green-800/30'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-500',
    border: 'border-purple-200',
    bgLight: 'bg-purple-50',
    bgDark: 'bg-purple-900/20',
    borderDark: 'border-purple-800/30'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-500',
    border: 'border-pink-200',
    bgLight: 'bg-pink-50',
    bgDark: 'bg-pink-900/20',
    borderDark: 'border-pink-800/30'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-500',
    border: 'border-yellow-200',
    bgLight: 'bg-yellow-50',
    bgDark: 'bg-yellow-900/20',
    borderDark: 'border-yellow-800/30'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-500',
    border: 'border-red-200',
    bgLight: 'bg-red-50',
    bgDark: 'bg-red-900/20',
    borderDark: 'border-red-800/30'
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-500',
    border: 'border-indigo-200',
    bgLight: 'bg-indigo-50',
    bgDark: 'bg-indigo-900/20',
    borderDark: 'border-indigo-800/30'
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-500',
    border: 'border-teal-200',
    bgLight: 'bg-teal-50',
    bgDark: 'bg-teal-900/20',
    borderDark: 'border-teal-800/30'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-500',
    border: 'border-orange-200',
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-900/20',
    borderDark: 'border-orange-800/30'
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-500',
    border: 'border-cyan-200',
    bgLight: 'bg-cyan-50',
    bgDark: 'bg-cyan-900/20',
    borderDark: 'border-cyan-800/30'
  }
};

/**
 * Get color set for a theme
 */
export function getThemeColor(colorName: string): ThemeColorSet {
  return themeColors[colorName as ThemeColorName] || themeColors.blue;
}

/**
 * Utility to generate consistent colors for theme cards
 * Each theme should have consistent coloring across the application
 */

interface ThemeColorScheme {
  bgColor: string;
  textColor: string;
  metaColor: string;
  descriptionColor: string;
  iconColor: string;
  iconBgColor: string;
  borderColor: string;
}

// Array of predefined color schemes
const colorSchemes: ThemeColorScheme[] = [
  // Indigo theme (default)
  {
    bgColor: 'var(--color-indigo-50, #eef2ff)',
    textColor: 'var(--color-indigo-900, #312e81)',
    metaColor: 'var(--color-indigo-700, #4338ca)',
    descriptionColor: 'var(--color-indigo-600, #4f46e5)',
    iconColor: 'var(--color-indigo-500, #6366f1)',
    iconBgColor: 'var(--color-white, #ffffff)',
    borderColor: 'var(--color-indigo-100, #e0e7ff)'
  },
  // Red theme
  {
    bgColor: 'var(--color-red-50, #fef2f2)',
    textColor: 'var(--color-red-900, #7f1d1d)',
    metaColor: 'var(--color-red-700, #b91c1c)',
    descriptionColor: 'var(--color-red-600, #dc2626)',
    iconColor: 'var(--color-red-500, #ef4444)',
    iconBgColor: 'var(--color-white, #ffffff)',
    borderColor: 'var(--color-red-100, #fee2e2)'
  },
  // Green theme
  {
    bgColor: 'var(--color-green-50, #f0fdf4)',
    textColor: 'var(--color-green-900, #14532d)',
    metaColor: 'var(--color-green-700, #15803d)',
    descriptionColor: 'var(--color-green-600, #16a34a)',
    iconColor: 'var(--color-green-500, #22c55e)',
    iconBgColor: 'var(--color-white, #ffffff)',
    borderColor: 'var(--color-green-100, #dcfce7)'
  },
  // Blue theme
  {
    bgColor: 'var(--color-blue-50, #eff6ff)',
    textColor: 'var(--color-blue-900, #1e3a8a)',
    metaColor: 'var(--color-blue-700, #1d4ed8)',
    descriptionColor: 'var(--color-blue-600, #2563eb)',
    iconColor: 'var(--color-blue-500, #3b82f6)',
    iconBgColor: 'var(--color-white, #ffffff)',
    borderColor: 'var(--color-blue-100, #dbeafe)'
  },
  // Amber theme
  {
    bgColor: 'var(--color-amber-50, #fffbeb)',
    textColor: 'var(--color-amber-900, #78350f)',
    metaColor: 'var(--color-amber-700, #a16207)',
    descriptionColor: 'var(--color-amber-600, #d97706)',
    iconColor: 'var(--color-amber-500, #f59e0b)',
    iconBgColor: 'var(--color-white, #ffffff)',
    borderColor: 'var(--color-amber-100, #fef3c7)'
  },
  // Purple theme
  {
    bgColor: 'var(--color-purple-50, #faf5ff)',
    textColor: 'var(--color-purple-900, #581c87)',
    metaColor: 'var(--color-purple-700, #7e22ce)',
    descriptionColor: 'var(--color-purple-600, #9333ea)',
    iconColor: 'var(--color-purple-500, #a855f7)',
    iconBgColor: 'var(--color-white, #ffffff)',
    borderColor: 'var(--color-purple-100, #f3e8ff)'
  }
];

// Dark mode color schemes
const darkColorSchemes: ThemeColorScheme[] = [
  // Indigo theme (default)
  {
    bgColor: 'var(--color-gray-800, #1f2937)',
    textColor: 'var(--color-indigo-200, #c7d2fe)',
    metaColor: 'var(--color-indigo-300, #a5b4fc)',
    descriptionColor: 'var(--color-indigo-400, #818cf8)',
    iconColor: 'var(--color-indigo-500, #6366f1)',
    iconBgColor: 'var(--color-indigo-900, #312e81)',
    borderColor: 'var(--color-indigo-800, #3730a3)'
  },
  // Red theme
  {
    bgColor: 'var(--color-gray-800, #1f2937)',
    textColor: 'var(--color-red-200, #fecaca)',
    metaColor: 'var(--color-red-300, #fca5a5)',
    descriptionColor: 'var(--color-red-400, #f87171)',
    iconColor: 'var(--color-red-500, #ef4444)',
    iconBgColor: 'var(--color-red-900, #7f1d1d)',
    borderColor: 'var(--color-red-800, #991b1b)'
  },
  // Add other dark mode themes...
];

/**
 * Get a color scheme for a theme based on its ID
 */
export function getThemeColor(id: string | number): ThemeColorScheme {
  // Hash the ID to get a consistent index
  const hashCode = String(id)
    .split('')
    .reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
  // Make sure we always get a positive index within the array range
  const index = Math.abs(hashCode) % colorSchemes.length;
  
  // Detect if we're in dark mode
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return isDarkMode ? darkColorSchemes[index] || darkColorSchemes[0] : colorSchemes[index];
}

/**
 * Get a background class for a theme
 */
export function getThemeBackgroundClass(id: string | number): string {
  const hashCode = String(id)
    .split('')
    .reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
  const bgColors = [
    'bg-indigo-50 dark:bg-indigo-900/20',
    'bg-red-50 dark:bg-red-900/20',
    'bg-green-50 dark:bg-green-900/20',
    'bg-blue-50 dark:bg-blue-900/20',
    'bg-amber-50 dark:bg-amber-900/20',
    'bg-purple-50 dark:bg-purple-900/20',
  ];
  
  const index = Math.abs(hashCode) % bgColors.length;
  return bgColors[index];
}

/**