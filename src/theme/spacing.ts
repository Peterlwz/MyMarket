export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

export const radius = {
  sm: 8,
  md: 8,
  lg: 8
} as const;

export const typography = {
  caption: 12,
  body: 14,
  bodyLarge: 15,
  title: 20,
  screenTitle: 28
} as const;

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: "#D8CBB8",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18
  },
  soft: {
    elevation: 1,
    shadowColor: "#D8CBB8",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12
  }
} as const;
