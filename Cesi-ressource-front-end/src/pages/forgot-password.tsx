import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LockOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppAlert } from '@/components/ui/AppAlert';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setEmailError("L'adresse email est requise"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Adresse email invalide'); return; }

    setLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      // on ne révèle pas si l'email existe ou non
    } finally {
      setLoading(false);
      setSubmitted(true);
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
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 32,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.primary,
            fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={24} />
          <AppText variant="label" style={{ color: colors.primary }}>Retour</AppText>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: colors.primaryLight,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <LockOpen size={32} color={colors.primary} />
          </div>
          <AppText variant="h2" center>Mot de passe oublié</AppText>
          <AppText variant="body" muted center style={{ marginTop: 8 }}>
            Saisissez votre adresse email pour réinitialiser votre mot de passe.
          </AppText>
        </div>

        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {submitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AppAlert
                type="success"
                title="Email envoyé"
                message="Si un compte est associé à cette adresse, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe."
                visible
              />
              <AppButton
                label="Retour à la connexion"
                onClick={() => navigate('/login', { replace: true })}
                variant="secondary"
              />
            </div>
          ) : (
            <>
              <AppTextInput
                label="Adresse email"
                placeholder="nom@exemple.fr"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                type="email"
                autoComplete="email"
                error={emailError}
                required
              />
              <AppButton
                label="Envoyer le lien de réinitialisation"
                onClick={handleSubmit}
                loading={loading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
