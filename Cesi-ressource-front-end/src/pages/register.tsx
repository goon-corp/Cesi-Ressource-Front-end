import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppAlert } from '@/components/ui/AppAlert';
import { ApiError } from '@/services/api';
import { toast } from '@/components/ui/Toast';

interface FieldErrors {
  email?: string;
  password?: string;
  confirm_password?: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
}

const PASSWORD_RULES = [
  { label: 'Entre 5 et 20 caractères', test: (p: string) => p.length >= 5 && p.length <= 20 },
  { label: 'Au moins une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Au moins un chiffre', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Au moins un symbole', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function isPasswordValid(p: string) {
  return PASSWORD_RULES.every(({ test }) => test(p));
}

function PasswordRules({ password }: { password: string }) {
  const { colors } = useTheme();
  if (!password) return null;
  return (
    <div style={{ marginTop: -8, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {PASSWORD_RULES.map(({ label, test }) => {
        const ok = test(password);
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {ok
              ? <CheckCircle size={14} color={colors.success} />
              : <Circle size={14} color={colors.textMuted} />
            }
            <AppText variant="caption" style={{ color: ok ? colors.success : colors.textMuted }}>
              {label}
            </AppText>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmPasswordMatch({ password, confirm }: { password: string; confirm: string }) {
  const { colors } = useTheme();
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 16 }}>
      {match
        ? <CheckCircle size={14} color={colors.success} />
        : <XCircle size={14} color={colors.error} />
      }
      <AppText variant="caption" style={{ color: match ? colors.success : colors.error }}>
        {match ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
      </AppText>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  const { colors } = useTheme();
  const LABELS = ['Compte', 'Profil'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: `2px solid ${isDone || isActive ? colors.primary : colors.border}`,
                  backgroundColor: isDone || isActive ? colors.primary : colors.backgroundAlt,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <CheckCircle size={13} color={colors.textOnPrimary} />
                ) : (
                  <span style={{
                    color: isActive ? colors.textOnPrimary : colors.textMuted,
                    fontSize: 12,
                    fontWeight: 700,
                  }}>{step}</span>
                )}
              </div>
              <AppText variant="caption" style={{
                color: isActive ? colors.primary : isDone ? colors.success : colors.textMuted,
                fontWeight: isActive ? '600' : '400',
                marginTop: 4,
              }}>
                {LABELS[i]}
              </AppText>
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                marginTop: 15,
                backgroundColor: isDone ? colors.primary : colors.border,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    user_name: '',
    first_name: '',
    last_name: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const isStep1Valid =
    /\S+@\S+\.\S+/.test(form.email) &&
    isPasswordValid(form.password) &&
    form.confirm_password === form.password;

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goNext = () => {
    const errors: FieldErrors = {};
    if (!form.email) errors.email = "L'adresse email est requise";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Adresse email invalide';
    if (!form.password) errors.password = 'Le mot de passe est requis';
    else if (!isPasswordValid(form.password)) errors.password = 'Le mot de passe ne respecte pas les règles';
    if (!form.confirm_password) errors.confirm_password = 'La confirmation est requise';
    else if (form.password !== form.confirm_password) errors.confirm_password = 'Les mots de passe ne correspondent pas';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setCurrentStep(2);
  };

  const handleRegister = async () => {
    const errors: FieldErrors = {};
    if (!form.user_name) errors.user_name = "Le nom d'utilisateur est requis";
    else if (form.user_name.length < 3) errors.user_name = 'Minimum 3 caractères';
    if (!form.first_name) errors.first_name = 'Le prénom est requis';
    if (!form.last_name) errors.last_name = 'Le nom est requis';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setApiError('');
    setLoading(true);
    try {
      await register(form);
      toast.success('Compte créé avec succès ! Regardez vos emails pour valider votre compte.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.status === 409 ? 'Cette adresse email est déjà utilisée' : err.message);
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
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 16,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} color={colors.primary} />
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
          <AppText variant="h2" center>Créer un compte</AppText>
          <AppText variant="body" muted center style={{ marginTop: 4 }}>
            Rejoignez Ressources Relationnelles
          </AppText>
        </div>

        <StepIndicator current={currentStep} total={2} />

        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <AppText variant="h3" style={{ marginBottom: 16 }}>
            {currentStep === 1 ? 'Informations de connexion' : 'Votre profil'}
          </AppText>

          {currentStep === 1 ? (
            <>
              <AppTextInput
                label="Adresse email"
                placeholder="nom@exemple.fr"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                type="email"
                autoComplete="email"
                error={fieldErrors.email}
                required
              />
              <AppTextInput
                label="Mot de passe"
                placeholder="5 à 20 caractères"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                isPassword
                autoComplete="new-password"
                error={fieldErrors.password}
                required
              />
              <PasswordRules password={form.password} />
              <AppTextInput
                label="Confirmer le mot de passe"
                placeholder="Répétez votre mot de passe"
                value={form.confirm_password}
                onChange={(e) => update('confirm_password', e.target.value)}
                isPassword
                autoComplete="new-password"
                error={fieldErrors.confirm_password}
                required
              />
              <ConfirmPasswordMatch password={form.password} confirm={form.confirm_password} />
              <AppButton label="Suivant" onClick={goNext} disabled={!isStep1Valid} />
            </>
          ) : (
            <>
              <AppAlert type="error" message={apiError} visible={!!apiError} />
              <AppTextInput
                label="Nom d'utilisateur"
                placeholder="pseudonyme"
                value={form.user_name}
                onChange={(e) => update('user_name', e.target.value)}
                autoComplete="username"
                error={fieldErrors.user_name}
                required
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <AppTextInput
                    label="Prénom"
                    placeholder="Jean"
                    value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                    autoComplete="given-name"
                    error={fieldErrors.first_name}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <AppTextInput
                    label="Nom"
                    placeholder="Dupont"
                    value={form.last_name}
                    onChange={(e) => update('last_name', e.target.value)}
                    autoComplete="family-name"
                    error={fieldErrors.last_name}
                    required
                  />
                </div>
              </div>
              <AppButton label="Créer mon compte" onClick={handleRegister} loading={loading} />
              <button
                onClick={() => setCurrentStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  width: '100%',
                  marginTop: 8,
                  padding: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <ArrowLeft size={16} color={colors.primary} />
                <AppText variant="label" style={{ color: colors.primary }}>Retour</AppText>
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <AppText variant="body" muted>Déjà un compte ?</AppText>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <AppText variant="link" style={{ color: colors.primary }}>Se connecter</AppText>
          </Link>
        </div>
      </div>
    </div>
  );
}
