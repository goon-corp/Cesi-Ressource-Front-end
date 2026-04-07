import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/ui/AppText';

interface AppHeaderProps {
  title: string;
  onMenuPress: () => void;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

export function AppHeader({ title, onMenuPress, rightAction, showBack = false }: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <header
      style={{
        width: '100%',
        backgroundColor: colors.primary,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          minHeight: 56,
          gap: 8,
        }}
      >
        <button
          onClick={onMenuPress}
          aria-label={showBack ? 'Retour' : 'Ouvrir le menu'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            minWidth: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showBack
            ? <ArrowLeft size={26} color={colors.textOnPrimary} />
            : <Menu size={26} color={colors.textOnPrimary} />
          }
        </button>

        <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden' }}>
          <AppText
            variant="label"
            numberOfLines={1}
            style={{
              color: colors.textOnPrimary,
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            {title}
          </AppText>
        </div>

        <div style={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>
          {rightAction ?? <div style={{ width: 40 }} />}
        </div>
      </div>
    </header>
  );
}
