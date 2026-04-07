export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorScheme {
  background: string;
  backgroundAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  textLight: string;
  textOnPrimary: string;
  primary: string;
  primaryLight: string;
  primaryPressed: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  border: string;
  borderLight: string;
  divider: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocus: string;
  placeholder: string;
}
