import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppAlert } from '@/components/ui/AppAlert';
import { ApiError } from '@/services/api';

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email) errors.email = "L'adresse email est requise";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Adresse email invalide';
  if (!password) errors.password = 'Le mot de passe est requis';
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { fetchUser } = useUser();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleLogin = async () => {
    const errors = validate(email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setApiError('');
    setLoading(true);
    try {
      const userId = await login({ email, password });
      if (userId) await fetchUser(userId);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 16,
            textDecoration: 'none',
            color: colors.primary,
          }}
        >
          <ArrowLeft size={16} />
          <AppText variant="label" style={{ color: colors.primary }}>Accueil</AppText>
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              backgroundColor: colors.primary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <AppText style={{ color: colors.textOnPrimary, fontSize: 28, fontWeight: '700' }}>RL</AppText>
          </div>
          <AppText variant="h2" center>Connexion</AppText>
          <AppText variant="body" muted center style={{ marginTop: 4 }}>
            Accédez à votre espace personnel
          </AppText>
        </div>

        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <AppAlert type="error" message={apiError} visible={!!apiError} />

          <AppTextInput
            label="Adresse email"
            placeholder="nom@exemple.fr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
            type="email"
            autoComplete="email"
            error={fieldErrors.email}
            required
          />

          <AppTextInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
            isPassword
            autoComplete="current-password"
            error={fieldErrors.password}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, marginTop: -8 }}>
            <Link to="/forgot-password" style={{ color: colors.primary, textDecoration: 'none' }}>
              <AppText variant="link" style={{ color: colors.primary }}>Mot de passe oublié ?</AppText>
            </Link>
          </div>

          <AppButton
            label="Se connecter"
            onClick={handleLogin}
            loading={loading}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <AppText variant="body" muted>Pas encore de compte ?</AppText>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <AppText variant="link" style={{ color: colors.primary }}>Créer un compte</AppText>
          </Link>
        </div>
      </div>
    </div>
  );
}
