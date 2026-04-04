import React from 'react';
import { useTheme } from '@/hooks/useTheme';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'link';

interface AppTextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  numberOfLines?: number;
}

const TAG_MAP: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  label: 'span',
  link: 'span',
};

const CLASS_MAP: Record<TextVariant, string> = {
  h1: 'text-3xl font-bold leading-tight',
  h2: 'text-2xl font-bold leading-tight',
  h3: 'text-xl font-semibold leading-snug',
  body: 'text-base font-normal leading-relaxed',
  bodySmall: 'text-sm font-normal leading-relaxed',
  caption: 'text-xs font-normal leading-relaxed',
  label: 'text-sm font-medium leading-snug',
  link: 'text-base font-medium underline cursor-pointer',
};

export function AppText({
  variant = 'body',
  color,
  muted = false,
  center = false,
  numberOfLines,
  style,
  className,
  children,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();

  const Tag = TAG_MAP[variant] as React.ElementType;
  const baseColor = color ?? (muted ? colors.textMuted : colors.text);

  const clampStyle = numberOfLines
    ? {
        display: '-webkit-box' as const,
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }
    : {};

  return (
    <Tag
      className={[CLASS_MAP[variant], center ? 'text-center' : '', className ?? ''].join(' ').trim()}
      style={{ color: baseColor, ...clampStyle, ...style }}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}
