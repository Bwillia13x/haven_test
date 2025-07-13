import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('aether-theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let resolvedTheme: 'dark' | 'light';
      
      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolvedTheme = theme;
      }
      
      setActualTheme(resolvedTheme);
      
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      
      // Store the theme preference
      localStorage.setItem('aether-theme', theme);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware component variants
export const themeVariants = {
  panel: {
    base: "glass-panel rounded-xl border transition-smooth",
    dark: "bg-surface/80 border-border/20",
    light: "bg-surface/80 border-border/30"
  },
  button: {
    primary: {
      base: "gradient-primary text-primary-foreground font-medium rounded-lg transition-smooth hover:scale-105 active:scale-95",
      dark: "shadow-elevation-2 hover:shadow-elevation-3",
      light: "shadow-elevation-1 hover:shadow-elevation-2"
    },
    secondary: {
      base: "bg-secondary/10 text-secondary border border-secondary/20 font-medium rounded-lg transition-smooth hover:bg-secondary/20",
      dark: "hover:border-secondary/40",
      light: "hover:border-secondary/50"
    },
    ghost: {
      base: "text-on-surface-variant hover:bg-surface-variant/50 font-medium rounded-lg transition-smooth",
      dark: "hover:text-on-surface",
      light: "hover:text-on-surface"
    }
  },
  input: {
    base: "bg-surface border border-border rounded-lg px-3 py-2 text-on-surface placeholder:text-on-surface-variant transition-smooth focus:ring-2 focus:ring-primary/50 focus:border-primary",
    dark: "focus:bg-surface-variant/50",
    light: "focus:bg-surface/80"
  },
  card: {
    base: "glass-panel rounded-xl p-6 transition-smooth",
    dark: "hover:bg-surface-variant/30",
    light: "hover:bg-surface-variant/50"
  }
};

// Utility function to get theme-aware classes
export function getThemeClasses(variant: keyof typeof themeVariants, subVariant?: string) {
  const { actualTheme } = useTheme();
  
  if (subVariant && themeVariants[variant][subVariant]) {
    const variantConfig = themeVariants[variant][subVariant];
    return `${variantConfig.base} ${variantConfig[actualTheme] || ''}`;
  }
  
  const variantConfig = themeVariants[variant];
  if (typeof variantConfig === 'object' && 'base' in variantConfig) {
    return `${variantConfig.base} ${variantConfig[actualTheme] || ''}`;
  }
  
  return '';
}

// Theme-aware color utilities
export const themeColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  surface: 'hsl(var(--surface))',
  surfaceVariant: 'hsl(var(--surface-variant))',
  onSurface: 'hsl(var(--on-surface))',
  onSurfaceVariant: 'hsl(var(--on-surface-variant))',
  border: 'hsl(var(--border))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))'
};

// Animation presets
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  glow: 'animate-glow',
  smooth: 'transition-smooth',
  fast: 'transition-fast',
  slow: 'transition-slow'
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Spacing scale
export const spacing = {
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)'
};

// Shadow utilities
export const shadows = {
  elevation1: 'var(--shadow-elevation-1)',
  elevation2: 'var(--shadow-elevation-2)',
  elevation3: 'var(--shadow-elevation-3)',
  elevation4: 'var(--shadow-elevation-4)'
};
