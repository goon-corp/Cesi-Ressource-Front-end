import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { AppText } from '@/components/ui/AppText';

export function HeaderAuthAction() {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const { colors } = useTheme();
  const navigate = useNavigate();

  if (isAuthenticated) {
    const displayName = user ? `${user.first_name} ${user.last_name}` : '';
    return (
      <button
        onClick={() => navigate('/profile')}
        aria-label="Mon profil"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Avatar
          name={displayName}
          size={34}
          backgroundColor="rgba(255,255,255,0.2)"
          textColor={colors.textOnPrimary}
        />
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/login')}
      aria-label="Se connecter"
      style={{
        background: 'none',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: 4,
        padding: '4px 8px',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <AppText
        variant="label"
        style={{
          color: colors.textOnPrimary,
          fontSize: 14,
          fontWeight: '600',
        }}
      >
        Connexion
      </AppText>
    </button>
  );
}
