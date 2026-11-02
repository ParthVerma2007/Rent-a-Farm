export const colors = {
  primary: '#176B3A', // Primary forest green
  primaryLight: '#23864B',
  secondary: '#2E8B57', // Secondary green
  background: '#F2F5DF', // Earthy warm background
  surface: '#FFFFFF',
  lightGreen: '#DCE9C7', // Soft green accent
  mint: '#EBF4DD',
  text: '#19251D', // Deep forest text
  secondaryText: '#68756A',
  muted: '#8D9B8E',
  border: '#D3DFBE',
  warning: '#E8B84A',
  warningBg: '#FFF7E6',
  error: '#C94C4C',
  errorBg: '#FDF0F0',
  success: '#176B3A',
  successBg: '#EAF6EE',
  tagBg: '#E3ECD2',
};

export const typography = {
  header: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subHeader: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.secondaryText,
  },
};
