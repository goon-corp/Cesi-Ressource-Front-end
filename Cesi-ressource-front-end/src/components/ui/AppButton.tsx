import React from 'react';
import { useTheme } from '@/hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  style,
  ...props
}: AppButtonProps) {
  const { colors } = useTheme();
  const isDisabled = !!(disabled || loading);

  const bgColor = {
    primary: colors.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    danger: colors.error,
  }[variant];

  const borderColor = {
    primary: 'transparent',
    secondary: colors.primary,
    ghost: 'transparent',
    danger: 'transparent',
  }[variant];

  const labelColor =
    variant === 'primary' || variant === 'danger'
      ? colors.textOnPrimary
      : variant === 'secondary'
        ? colors.primary
        : colors.text;

  const padding = {
    sm: '6px 16px',
    md: '10px 16px',
    lg: '14px 24px',
  }[size];

  const fontSize = { sm: 14, md: 16, lg: 18 }[size];
  const minHeight = { sm: 36, md: 44, lg: 52 }[size];

  return (
    <button
      type="button"
      disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: leftIcon ? 8 : 0,
        width: fullWidth ? '100%' : 'auto',
        padding,
        fontSize,
        fontWeight: 600,
        minHeight,
        backgroundColor: bgColor,
        color: labelColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.4 : 1,
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            border: `2px solid ${labelColor}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        <>
          {leftIcon}
          {label}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
