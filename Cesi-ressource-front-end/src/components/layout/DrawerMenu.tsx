import React, { useEffect, useRef, useState } from 'react';
import { Home, BookOpen, Users, User, Settings, LogOut, LogIn, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { AppText } from '@/components/ui/AppText';

const DRAWER_WIDTH = Math.min(window.innerWidth * 0.78, 320);

interface NavItem {
  key: string;
  label: string;
  Icon: React.ElementType;
  route: string;
  requireAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Accueil', Icon: Home, route: '/' },
  { key: 'resources', label: 'Ressources', Icon: BookOpen, route: '/' },
  { key: 'community', label: 'Communauté', Icon: Users, route: '/' },
  { key: 'profile', label: 'Mon profil', Icon: User, route: '/profile', requireAuth: true },
  { key: 'settings', label: 'Paramètres', Icon: Settings, route: '/settings' },
];

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const { colors } = useTheme();
  const { logout, isAuthenticated } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        if (drawerRef.current) drawerRef.current.style.transform = 'translateX(0)';
        if (backdropRef.current) backdropRef.current.style.opacity = '1';
      });
    } else if (visible) {
      if (drawerRef.current) drawerRef.current.style.transform = `translateX(-${DRAWER_WIDTH}px)`;
      if (backdropRef.current) backdropRef.current.style.opacity = '0';
      const timer = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible]);

  if (!visible) return null;

  const handleNav = (item: NavItem) => {
    onClose();
    const target = item.requireAuth && !isAuthenticated ? '/login' : item.route;
    navigate(target);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <>
      <div
        ref={backdropRef}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          opacity: 0,
          transition: 'opacity 0.28s',
        }}
      />
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: colors.surface,
          zIndex: 110,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
          transform: `translateX(-${DRAWER_WIDTH}px)`,
          transition: 'transform 0.28s ease',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AppText style={{ color: colors.textOnPrimary, fontWeight: '700', fontSize: 20 }}>
              RL
            </AppText>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {isAuthenticated && user ? (
              <>
                <AppText variant="label" numberOfLines={1}>
                  {user.first_name} {user.last_name}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {user.email}
                </AppText>
              </>
            ) : (
              <>
                <AppText variant="label">Invité</AppText>
                <AppText variant="caption" muted>
                  Connectez-vous pour accéder à toutes les fonctionnalités
                </AppText>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={24} color={colors.textMuted} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 8px' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNav(item)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '10px 16px',
                borderRadius: 4,
                marginBottom: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primaryLight;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <item.Icon size={22} color={colors.primary} />
              <AppText variant="body" style={{ color: colors.text, fontWeight: '500', flex: 1 }}>
                {item.label}
              </AppText>
              {item.requireAuth && !isAuthenticated && (
                <Lock size={14} color={colors.textLight} />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '8px 8px', borderTop: `1px solid ${colors.divider}` }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '10px 16px',
                borderRadius: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.errorLight;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={22} color={colors.error} />
              <AppText variant="body" style={{ color: colors.error, fontWeight: '500' }}>
                Se déconnecter
              </AppText>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '10px 16px',
                borderRadius: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primaryLight;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <LogIn size={22} color={colors.primary} />
              <AppText variant="body" style={{ color: colors.primary, fontWeight: '500' }}>
                Se connecter
              </AppText>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
