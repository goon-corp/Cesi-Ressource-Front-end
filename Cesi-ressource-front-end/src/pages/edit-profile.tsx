import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppAlert } from '@/components/ui/AppAlert';
import { Avatar } from '@/components/ui/Avatar';
import { ApiError } from '@/services/api';
import { toast } from '@/components/ui/Toast';

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  user_name?: string;
}

function validate(first_name: string, last_name: string, user_name: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!first_name.trim()) errors.first_name = 'Le prénom est requis';
  if (!last_name.trim()) errors.last_name = 'Le nom est requis';
  if (!user_name.trim()) errors.user_name = "Le nom d'utilisateur est requis";
  else if (user_name.length < 3) errors.user_name = 'Minimum 3 caractères';
  return errors;
}

export default function EditProfilePage() {
  const { user, updateUser } = useUser();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [first_name, setFirstName] = useState(user?.first_name ?? '');
  const [last_name, setLastName] = useState(user?.last_name ?? '');
  const [user_name, setUserName] = useState(user?.user_name ?? '');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const hasChanges =
    first_name !== user.first_name ||
    last_name !== user.last_name ||
    user_name !== user.user_name;

  const handleSave = async () => {
    const errors = validate(first_name, last_name, user_name);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true);
    setErrorMsg('');
    try {
      await updateUser({ first_name, last_name, user_name });
      toast.success('Profil mis à jour avec succès.');
      navigate(-1);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <AppHeader title="Modifier mon profil" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 32 }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ display: 'inline-block', border: `3px solid ${colors.primary}`, borderRadius: '50%', padding: 3 }}>
            <Avatar
              name={`${first_name || user.first_name} ${last_name || user.last_name}`}
              size={80}
              backgroundColor={colors.primaryLight}
              textColor={colors.primary}
            />
          </div>
          <AppText variant="caption" muted style={{ display: 'block', marginTop: 8 }}>{user.email}</AppText>
        </div>

        <AppAlert type="error" message={errorMsg} visible={!!errorMsg} />

        <div style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <AppText variant="label" muted style={{ display: 'block', marginBottom: 16, letterSpacing: 0.5 }}>INFORMATIONS PERSONNELLES</AppText>

          <AppTextInput
            label="Prénom"
            placeholder="Votre prénom"
            value={first_name}
            onChange={(e) => { setFirstName(e.target.value); clearError('first_name'); }}
            error={fieldErrors.first_name}
            required
          />
          <AppTextInput
            label="Nom"
            placeholder="Votre nom"
            value={last_name}
            onChange={(e) => { setLastName(e.target.value); clearError('last_name'); }}
            error={fieldErrors.last_name}
            required
          />
          <AppTextInput
            label="Nom d'utilisateur"
            placeholder="votre_pseudo"
            value={user_name}
            onChange={(e) => { setUserName(e.target.value); clearError('user_name'); }}
            error={fieldErrors.user_name}
            required
          />
          <AppTextInput
            label="Adresse email"
            value={user.email}
            readOnly
            hint="L'email ne peut pas être modifié ici."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AppButton label="Enregistrer les modifications" onClick={handleSave} loading={loading} disabled={!hasChanges} />
          <AppButton label="Annuler" onClick={() => navigate(-1)} variant="secondary" />
        </div>
      </div>
    </div>
  );
}
