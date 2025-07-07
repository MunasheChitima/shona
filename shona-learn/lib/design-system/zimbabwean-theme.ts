/**
 * Zimbabwean Design System
 * Cultural theme inspired by Great Zimbabwe, traditional patterns, and natural landscapes
 */

export const zimbabweanColors = {
  // Zimbabwean Flag Colors
  flag: {
    green: '#009639',      // Agriculture, growth
    gold: '#FFD700',       // Mineral wealth, sunshine
    red: '#DA121A',        // Struggle, strength
    black: '#000000',      // Heritage, people
    white: '#FFFFFF',      // Peace, unity
  },
  
  // Natural Landscape Palette
  landscape: {
    kopjeBrown: '#8B4513',    // Granite kopjes
    baobabGrey: '#A0522D',    // Ancient baobab trees
    savannaGold: '#DAA520',   // Golden grasslands
    riverBlue: '#4682B4',     // Zambezi river
    sunsetOrange: '#FF8C69',  // African sunset
    dawnPink: '#FFB6C1',      // Dawn sky
  },
  
  // Cultural Artifacts
  cultural: {
    potteryTerracotta: '#CD853F',
    fabricIndigo: '#4B0082',
    beadworkCoral: '#FF7F50',
    stoneGrey: '#708090',
    earthBrown: '#8B4513',
  },
  
  // Modern Accessibility
  text: {
    primary: '#2D3748',
    secondary: '#4A5568',
    light: '#718096',
  },
  
  surface: {
    white: '#FFFFFF',
    light: '#F7FAFC',
    medium: '#EDF2F7',
  }
} as const;

export const zimbabweanGradients = {
  sunrise: 'linear-gradient(135deg, #FFB6C1 0%, #FF8C69 30%, #FFD700 60%, #009639 100%)',
  sunset: 'linear-gradient(225deg, #DA121A 0%, #FF8C69 40%, #FFD700 80%, #8B4513 100%)',
  savanna: 'linear-gradient(90deg, #009639 0%, #DAA520 50%, #FF8C69 100%)',
  river: 'linear-gradient(180deg, #4682B4 0%, #009639 100%)',
  kopje: 'linear-gradient(45deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
} as const;

export const zimbabweanPatterns = {
  chevron: `repeating-linear-gradient(
    45deg,
    #FFD700 0px,
    #FFD700 10px,
    #009639 10px,
    #009639 20px
  )`,
  checkerboard: `conic-gradient(
    #FFD700 0deg 90deg,
    #009639 90deg 180deg,
    #FFD700 180deg 270deg,
    #009639 270deg 360deg
  )`,
  waves: `radial-gradient(
    circle at 50% 100%,
    #4682B4 0%,
    transparent 70%
  )`,
  zimbabweBird: `
    radial-gradient(circle at 20% 20%, #FFD700 2px, transparent 2px),
    radial-gradient(circle at 80% 80%, #009639 1px, transparent 1px),
    radial-gradient(circle at 40% 60%, #DA121A 1.5px, transparent 1.5px)
  `,
} as const;

export const zimbabweanShadows = {
  gentle: '0 4px 16px rgba(0, 150, 57, 0.08)',
  zimbabwe: '0 10px 40px rgba(218, 18, 26, 0.1)',
  kopje: '0 8px 32px rgba(139, 69, 19, 0.15)',
  baobab: '0 12px 48px rgba(160, 82, 45, 0.12)',
  gold: '0 6px 24px rgba(255, 215, 0, 0.2)',
} as const;

export const zimbabweanAnimations = {
  mbiraShimmer: 'mbira-shimmer 2s ease-in-out infinite',
  baobabSway: 'baobab-sway 4s ease-in-out infinite',
  birdFlight: 'bird-flight 4s ease-in-out',
  waterRipple: 'water-ripple 1s ease-out',
  africanPulse: 'african-pulse 2s infinite',
  sunrise: 'sunrise-glow 3s ease-in-out infinite',
} as const;

export const zimbabweanFonts = {
  ubuntu: "'Ubuntu', -apple-system, BlinkMacSystemFont, sans-serif",
  nunito: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

// Cultural Animation Utilities
export const createCulturalAnimation = (type: keyof typeof zimbabweanAnimations) => ({
  animation: zimbabweanAnimations[type],
});

// Responsive Breakpoints with African naming
export const zimbabweanBreakpoints = {
  kopje: '480px',    // Small hills (mobile)
  baobab: '768px',   // Medium trees (tablet)
  river: '1024px',   // Wide rivers (desktop)
  mountain: '1280px', // Great mountains (large desktop)
} as const;

// Cultural Spacing System (based on traditional measurements)
export const zimbabweanSpacing = {
  grain: '2px',      // Smallest unit (grain of sand)
  pebble: '4px',     // Small stone
  stone: '8px',      // Regular stone
  rock: '16px',      // Large rock
  boulder: '32px',   // Boulder
  kopje: '64px',     // Small hill
  mountain: '128px', // Mountain
} as const;

// Traditional Measurements for Components
export const traditionalSizes = {
  // Minimum touch targets (accessibility)
  touchTarget: '44px',
  
  // Cultural component sizes
  mbiraTines: '6px',
  potSherd: '20px',
  basketWeave: '40px',
  housePost: '80px',
  granaryHeight: '120px',
} as const;

// Cultural Sound Effects Mapping
export const culturalSounds = {
  achievement: 'mbira-celebration',
  correct: 'water-drop',
  incorrect: 'gentle-tap',
  levelUp: 'horn-call',
  streak: 'bird-song',
  navigation: 'soft-click',
} as const;

// Theme Utilities
export class ZimbabweanTheme {
  // Get color with opacity
  static getColorWithOpacity(colorPath: string, opacity: number): string {
    const color = this.getNestedValue(zimbabweanColors, colorPath);
    return this.hexToRgba(color, opacity);
  }
  
  // Convert hex to rgba
  static hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Get nested object value by path
  static getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }
  
  // Generate cultural card styles
  static getCulturalCardStyles(variant: 'sunset' | 'sunrise' | 'savanna' | 'river' = 'savanna') {
    return {
      background: zimbabweanColors.surface.white,
      border: `1px solid ${this.getColorWithOpacity('flag.green', 0.1)}`,
      borderRadius: '16px',
      boxShadow: zimbabweanShadows.gentle,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: zimbabweanGradients[variant],
      },
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: zimbabweanShadows.zimbabwe,
      }
    };
  }
  
  // Generate Shona button styles
  static getShonaButtonStyles(variant: 'primary' | 'secondary' | 'accent' = 'primary') {
    const variants = {
      primary: {
        background: `linear-gradient(135deg, ${zimbabweanColors.flag.green}, ${zimbabweanColors.flag.gold})`,
        border: `2px solid ${zimbabweanColors.flag.gold}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${zimbabweanColors.flag.gold}, ${zimbabweanColors.flag.green})`,
        }
      },
      secondary: {
        background: `linear-gradient(135deg, ${zimbabweanColors.landscape.riverBlue}, ${zimbabweanColors.landscape.savannaGold})`,
        border: `2px solid ${zimbabweanColors.landscape.riverBlue}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${zimbabweanColors.landscape.savannaGold}, ${zimbabweanColors.landscape.riverBlue})`,
        }
      },
      accent: {
        background: `linear-gradient(135deg, ${zimbabweanColors.flag.red}, ${zimbabweanColors.landscape.sunsetOrange})`,
        border: `2px solid ${zimbabweanColors.flag.red}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${zimbabweanColors.landscape.sunsetOrange}, ${zimbabweanColors.flag.red})`,
        }
      }
    };
    
    return {
      ...variants[variant],
      color: zimbabweanColors.flag.white,
      fontWeight: 600,
      fontFamily: zimbabweanFonts.ubuntu,
      padding: '12px 24px',
      borderRadius: '12px',
      boxShadow: zimbabweanShadows.zimbabwe,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      cursor: 'pointer',
      minHeight: traditionalSizes.touchTarget,
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        transition: 'left 0.5s',
      },
      '&:hover::before': {
        left: '100%',
      },
      '&:hover': {
        transform: 'translateY(-2px) scale(1.02)',
        boxShadow: zimbabweanShadows.kopje,
      },
      '&:active': {
        transform: 'translateY(0) scale(1)',
      },
      '&:focus': {
        outline: `3px solid ${zimbabweanColors.flag.gold}`,
        outlineOffset: '2px',
      }
    };
  }
  
  // Generate progress baobab styles
  static getProgressBaobabStyles(progress: number) {
    const trunkHeight = Math.max(20, (progress / 100) * 80);
    const showBranches = progress > 50;
    
    return {
      container: {
        position: 'relative' as const,
        width: '100px',
        height: '120px',
        margin: '0 auto',
      },
      trunk: {
        position: 'absolute' as const,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: `${trunkHeight}px`,
        background: zimbabweanColors.landscape.baobabGrey,
        borderRadius: '10px 10px 0 0',
        transition: 'height 0.8s ease-out',
      },
      branches: {
        position: 'absolute' as const,
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '40px',
        background: `radial-gradient(circle, ${zimbabweanColors.flag.green} 30%, transparent 70%)`,
        borderRadius: '50%',
        opacity: showBranches ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }
    };
  }
}

// Cultural Context Provider Interface
export interface CulturalContext {
  region: 'mashonaland' | 'matabeleland' | 'masvingo' | 'midlands' | 'manicaland';
  season: 'dry' | 'wet' | 'harvest' | 'planting';
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'evening' | 'night';
  celebration?: 'independence' | 'harvest' | 'traditional' | 'modern';
}

// Generate contextual styles based on cultural context
export const getCulturalContextStyles = (context: CulturalContext) => {
  const seasonColors = {
    dry: zimbabweanGradients.sunset,
    wet: zimbabweanGradients.river,
    harvest: zimbabweanGradients.savanna,
    planting: zimbabweanGradients.sunrise,
  };
  
  const timeOfDayEffects = {
    dawn: { filter: 'sepia(0.1) brightness(1.1)' },
    morning: { filter: 'brightness(1.05)' },
    noon: { filter: 'contrast(1.05)' },
    evening: { filter: 'sepia(0.15) warmth(1.1)' },
    night: { filter: 'brightness(0.8) contrast(1.2)' },
  };
  
  return {
    background: seasonColors[context.season],
    ...timeOfDayEffects[context.timeOfDay],
    transition: 'all 1s ease-in-out',
  };
};

// Export complete theme object
export const zimbabweanTheme = {
  colors: zimbabweanColors,
  gradients: zimbabweanGradients,
  patterns: zimbabweanPatterns,
  shadows: zimbabweanShadows,
  animations: zimbabweanAnimations,
  fonts: zimbabweanFonts,
  breakpoints: zimbabweanBreakpoints,
  spacing: zimbabweanSpacing,
  sizes: traditionalSizes,
  sounds: culturalSounds,
  utils: ZimbabweanTheme,
} as const;

export default zimbabweanTheme;