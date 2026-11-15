// FireGuard Cochabamba - Color Palette
// Based on Material Design 3 with high-contrast for field use
// Meets WCAG 2.1 AA (minimum contrast ratio 4.5:1)

export const Colors = {
  // Primary brand colors
  primaryRed: '#D32F2F',
  primaryRedDark: '#B71C1C',
  primaryRedLight: '#EF5350',

  // Severity levels
  alertOrange: '#F57C00',
  alertOrangeDark: '#E65100',
  alertOrangeLight: '#FF9800',

  warningYellow: '#FBC02D',
  warningYellowDark: '#F57F17',
  warningYellowLight: '#FFEE58',

  safeGreen: '#388E3C',
  safeGreenDark: '#1B5E20',
  safeGreenLight: '#66BB6A',

  // Backgrounds
  darkBackground: '#212121',
  darkSurface: '#303030',

  // Surfaces
  white: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',

  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FAFAFA',

  // UI Elements
  divider: '#E0E0E0',
  border: '#BDBDBD',
  disabled: '#9E9E9E',
  placeholder: '#9E9E9E',

  // Severity map (for dynamic use)
  severity: {
    critica: '#D32F2F',
    alta: '#F57C00',
    media: '#FBC02D',
    baja: '#388E3C',
  } as const,

  severityBackground: {
    critica: '#FFEBEE',
    alta: '#FFF3E0',
    media: '#FFFDE7',
    baja: '#E8F5E9',
  } as const,

  // Map marker colors
  marker: {
    critica: '#D32F2F',
    alta: '#F57C00',
    media: '#FBC02D',
    baja: '#388E3C',
  } as const,
} as const;

export type SeveridadType = 'critica' | 'alta' | 'media' | 'baja';
export type OrigenType = 'movis' | 'viir' | 'modelo_ia';
export type EstadoType = 'activa' | 'atendida' | 'cerrada';
