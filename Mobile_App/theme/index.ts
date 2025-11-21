import { palette, spacing, radii, typography, shadows } from './tokens';

export type CafeTheme = {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
};

export const baseTheme = {
  palette,
  spacing,
  radii,
  typography,
  shadows,
};

export const buildCafeTheme = (overrides?: {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
}): CafeTheme => {
  if (!overrides) {
    return {
      primary: palette.brandAmber,
      secondary: palette.brandBrown,
      accent: palette.peach,
      surface: palette.cream,
      text: palette.textPrimary,
    };
  }

  return {
    primary: overrides.primaryColor || palette.brandAmber,
    secondary: overrides.secondaryColor || palette.brandBrown,
    accent: overrides.accentColor || palette.peach,
    surface: palette.creamLight,
    text: palette.textPrimary,
  };
};

