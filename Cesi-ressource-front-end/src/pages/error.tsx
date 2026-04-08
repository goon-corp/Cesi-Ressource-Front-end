import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/ui/AppText';

export default function ErrorPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const message = searchParams.get('msg') ?? 'La page que vous cherchez est introuvable ou a été déplacée.';

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: '24px',
      minHeight: '100dvh',
      boxSizing: 'border-box',
    }}>

      <AppText style={{
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 2,
        color: colors.primary,
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 24,
      }}>
        Erreur 404
      </AppText>

      <AppText style={{
        fontSize: 42,
        fontWeight: '700',
        color: colors.text,
        display: 'block',
        textAlign: 'center',
        lineHeight: '1.15',
        marginBottom: 16,
      }}>
        Ressource{'\n'}Relationnelle
      </AppText>

      <div style={{
        width: 40,
        height: 2,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginBottom: 20,
      }} />

      <AppText style={{
        fontSize: 15,
        color: colors.textMuted,
        display: 'block',
        textAlign: 'center',
        lineHeight: '1.6',
        maxWidth: 300,
        marginBottom: 40,
      }}>
        {message}
      </AppText>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 20px',
            backgroundColor: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Home size={17} />
          Retour à l'accueil
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 20px',
            backgroundColor: 'transparent',
            color: colors.textMuted,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 15,
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.surface)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft size={17} />
          Page précédente
        </button>
      </div>
    </div>
  );
}