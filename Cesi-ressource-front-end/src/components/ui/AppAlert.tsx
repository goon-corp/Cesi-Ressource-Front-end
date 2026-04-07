import { useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';
import type { ColorScheme } from '@/types/theme.types';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AppAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  visible: boolean;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function getColors(type: AlertType, colors: ColorScheme): { bg: string; fg: string } {
  const map: Record<AlertType, { bg: string; fg: string }> = {
    success: { bg: colors.successLight, fg: colors.success },
    error: { bg: colors.errorLight, fg: colors.error },
    warning: { bg: colors.warningLight, fg: colors.warning },
    info: { bg: colors.infoLight, fg: colors.info },
  };
  return map[type];
}

export function AppAlert({ type, title, message, visible }: AppAlertProps) {
  const { colors } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = visible ? '1' : '0';
    ref.current.style.transform = visible ? 'translateY(0)' : 'translateY(-8px)';
  }, [visible]);

  if (!visible) return null;

  const { bg, fg } = getColors(type, colors);
  const Icon = ICONS[type];

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: 16,
        borderRadius: 4,
        marginBottom: 16,
        backgroundColor: bg,
        opacity: 0,
        transform: 'translateY(-8px)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}
    >
      <Icon size={20} color={fg} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && (
          <AppText variant="label" style={{ color: fg }}>
            {title}
          </AppText>
        )}
        <AppText variant="bodySmall" style={{ color: fg }}>
          {message}
        </AppText>
      </div>
    </div>
  );
}
