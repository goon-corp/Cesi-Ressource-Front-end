import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, User, Lock, Bell, Info, Shield, FileText, ChevronRight, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useDrawer } from '@/contexts/DrawerContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { HeaderAuthAction } from '@/components/layout/HeaderAuthAction';
import { DrawerMenu } from '@/components/layout/DrawerMenu';
import { AppText } from '@/components/ui/AppText';
import type { ThemeMode } from '@/types/theme.types';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: React.ElementType }[] = [
  { mode: 'light', label: 'Clair', Icon: Sun },
  { mode: 'dark', label: 'Sombre', Icon: Moon },
  { mode: 'system', label: 'Système', Icon: Monitor },
];

interface SettingRowProps {
  Icon: React.ElementType;
  label: string;
  onClick?: () => void;
  withDivider?: boolean;
  disabled?: boolean;
}

function SettingRow({ Icon, label, onClick, withDivider, disabled = false }: SettingRowProps) {
  const { colors } = useTheme();
  return (
    <>
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', padding: '10px 0',
          background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.38 : 1, fontFamily: 'inherit', borderRadius: 4,
          transition: 'background-color 0.15s',
        }}
      >
        <Icon size={20} color={disabled ? colors.textLight : colors.textMuted} />
        <AppText variant="body" style={{ flex: 1, marginLeft: 16, color: disabled ? colors.textLight : colors.text }}>
          {label}
        </AppText>
        {disabled
          ? <Lock size={15} color={colors.textLight} />
          : <ChevronRight size={18} color={colors.textLight} />
        }
      </button>
      {withDivider && <div style={{ height: 1, backgroundColor: colors.borderLight, marginLeft: 36 }} />}
    </>
  );
}

export default function SettingsPage() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <DrawerMenu isOpen={isOpen} onClose={closeDrawer} />
      <AppHeader title="Paramètres" onMenuPress={openDrawer} rightAction={<HeaderAuthAction />} />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', padding: 16, paddingBottom: 32, boxSizing: 'border-box' }}>
        <AppText variant="label" muted style={{ display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>APPARENCE</AppText>
        <div style={{ backgroundColor: colors.surface, borderRadius: 8, border: `1px solid ${colors.borderLight}`, padding: 16, marginBottom: 24 }}>
          <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>Thème de l'application</AppText>
          <div style={{ display: 'flex', gap: 8 }}>
            {THEME_OPTIONS.map(({ mode, label, Icon }) => {
              const isActive = themeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '12px 0', borderRadius: 4,
                    border: `${isActive ? 2 : 1}px solid ${isActive ? colors.primary : colors.border}`,
                    backgroundColor: isActive ? colors.primaryLight : colors.backgroundAlt,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={22} color={isActive ? colors.primary : colors.textMuted} />
                  <AppText variant="caption" style={{ color: isActive ? colors.primary : colors.textMuted, marginTop: 4, fontWeight: isActive ? '600' : '400' }}>
                    {label}
                  </AppText>
                </button>
              );
            })}
          </div>
        </div>

        <AppText variant="label" muted style={{ display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>COMPTE</AppText>
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: 10,
              borderRadius: 4, border: `1px solid ${colors.info}`, backgroundColor: colors.infoLight,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
            }}
          >
            <Info size={18} color={colors.info} />
            <AppText variant="bodySmall" style={{ flex: 1, color: colors.info }}>
              Connectez-vous pour accéder aux paramètres de compte.
            </AppText>
            <AppText variant="label" style={{ color: colors.info }}>Connexion →</AppText>
          </button>
        )}
        <div style={{ backgroundColor: colors.surface, borderRadius: 8, border: `1px solid ${colors.borderLight}`, padding: '0 16px', marginBottom: 24 }}>
          <SettingRow Icon={User} label="Modifier mon profil" onClick={() => navigate('/edit-profile')} disabled={!isAuthenticated} withDivider />
          <SettingRow Icon={Lock} label="Changer mon mot de passe" disabled withDivider />
          <SettingRow Icon={Bell} label="Notifications" disabled />
        </div>

        <AppText variant="label" muted style={{ display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>À PROPOS</AppText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { Icon: Info, label: 'Mentions légales', description: 'Informations légales et éditeur du site', route: '/mentions-legales', color: colors.info, colorLight: colors.infoLight },
            { Icon: Shield, label: 'Politique de confidentialité', description: 'Comment vos données sont collectées et utilisées', route: '/politique-confidentialite', color: colors.success, colorLight: colors.successLight },
            { Icon: FileText, label: "Conditions d'utilisation", description: "Règles d'usage de la plateforme", route: '/conditions-utilisation', color: colors.primary, colorLight: colors.primaryLight },
          ].map(({ Icon, label, description, route, color, colorLight }) => (
            <button
              key={route}
              onClick={() => navigate(route)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                padding: 16, borderRadius: 8,
                border: `1px solid ${colors.borderLight}`,
                backgroundColor: colors.surface,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="label" style={{ display: 'block', color: colors.text }}>{label}</AppText>
                <AppText variant="caption" muted style={{ display: 'block', marginTop: 2 }}>{description}</AppText>
              </div>
              <ArrowRight size={16} color={colors.textLight} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
