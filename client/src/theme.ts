// ============================================================
// Entab Analytics — Brand Theme
// Single source of truth for all chart and UI colors.
// Import this in every page instead of defining local COLORS.
// ============================================================

export const theme = {
  palette: {
    background: {
      default: '#FFFFFF',
      paper: '#F8F9FA',
      soft: '#F1F5F9',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#CBD5E1',
    },
    brand: {
      indigo: '#2F2483',
      green: '#008B43',
    },
    status: {
      success: '#008B43',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    },
    charts: [
      '#2F2483', // 1. Brand Indigo — primary metric
      '#008B43', // 2. Brand Green — secondary metric
      '#6366F1', // 3. Soft Indigo/Lavender
      '#14B8A6', // 4. Muted Teal
      '#94A3B8', // 5. Cool Slate — baseline/average
      '#8B5CF6', // 6. Deep Violet
    ],
    borders: {
      light: '#E2E8F0',
      strong: '#CBD5E1',
    },
  },

  chartConfig: {
    grid: '#E2E8F0',
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    tooltipBg: '#1E293B',
    tooltipText: '#FFFFFF',
    borderWidth: 2,
    barRadius: 4,
  },
} as const;

// Convenience aliases used in Recharts props
export const CHART_COLORS = theme.palette.charts;
export const BRAND_INDIGO = theme.palette.brand.indigo;
export const BRAND_GREEN = theme.palette.brand.green;
export const STATUS = theme.palette.status;
export const GRID_COLOR = theme.chartConfig.grid;

// Standard Recharts tooltip style
export const tooltipStyle = {
  backgroundColor: theme.chartConfig.tooltipBg,
  border: 'none',
  borderRadius: '8px',
  color: theme.chartConfig.tooltipText,
  fontSize: 12,
  fontFamily: theme.chartConfig.fontFamily,
};

// Standard Recharts tick style
export const tickStyle = {
  fontSize: 11,
  fill: theme.palette.text.secondary,
  fontFamily: theme.chartConfig.fontFamily,
};
