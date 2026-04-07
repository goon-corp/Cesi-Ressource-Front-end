import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Info, Database, Target, FileCheck, Clock, UserCheck, Lock, Mail } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppText } from '@/components/ui/AppText';

function Section({ icon: Icon, title, children, accentColor }: { icon: React.ElementType; title: string; children: React.ReactNode; accentColor?: string }) {
  const { colors } = useTheme();
  const accent = accentColor ?? colors.success;
  const accentLight = colors.successLight;
  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderLeft: `4px solid ${accent}`,
      padding: '16px 20px',
      marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={accent} />
        </div>
        <AppText variant="label" style={{ color: accent, fontSize: 15 }}>{title}</AppText>
      </div>
      <div style={{ paddingLeft: 42 }}>
        {children}
      </div>
    </div>
  );
}

function BulletItem({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, flexShrink: 0, marginTop: 8 }} />
      <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>{text}</AppText>
    </div>
  );
}

export default function PolitiqueConfidentialitePage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <AppHeader title="Politique de confidentialité" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Hero */}
          <div style={{ backgroundColor: colors.successLight, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={26} color="#fff" />
            </div>
            <div>
              <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.success, display: 'block' }}>Politique de confidentialité</AppText>
              <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 99, backgroundColor: colors.success, fontSize: 11, color: '#fff', fontWeight: 600 }}>
                Mise à jour : mars 2026
              </span>
            </div>
          </div>

          {/* RGPD badge */}
          <div style={{ margin: '16px 16px 4px', padding: '10px 14px', borderRadius: 6, backgroundColor: colors.infoLight, border: `1px solid ${colors.info}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck size={16} color={colors.info} style={{ flexShrink: 0 }} />
            <AppText variant="caption" style={{ color: colors.info, lineHeight: '1.5' }}>
              Cette politique est conforme au <strong>Règlement Général sur la Protection des Données (RGPD)</strong>.
            </AppText>
          </div>

          <div style={{ padding: '8px 16px 32px' }}>
            <Section icon={Info} title="Introduction" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'application Ressources Relationnelles s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles.
              </AppText>
            </Section>

            <Section icon={Database} title="Données collectées" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7', display: 'block', marginBottom: 10 }}>
                Lors de l'inscription et de l'utilisation de l'application, nous collectons :
              </AppText>
              <BulletItem text="Nom et prénom" />
              <BulletItem text="Nom d'utilisateur" />
              <BulletItem text="Adresse email" />
              <BulletItem text="Données de connexion (date, heure, adresse IP)" />
              <BulletItem text="Contenus publiés (ressources, commentaires)" />
            </Section>

            <Section icon={Target} title="Finalités du traitement" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7', display: 'block', marginBottom: 10 }}>
                Vos données sont traitées pour :
              </AppText>
              <BulletItem text="Gérer votre compte et votre authentification" />
              <BulletItem text="Vous permettre d'accéder aux fonctionnalités de la plateforme" />
              <BulletItem text="Assurer la sécurité de l'application" />
              <BulletItem text="Améliorer les services proposés" />
            </Section>

            <Section icon={FileCheck} title="Base légale" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Le traitement de vos données repose sur votre consentement lors de l'inscription, ainsi que sur l'exécution du contrat de service liant l'utilisateur à la plateforme.
              </AppText>
            </Section>

            <Section icon={Clock} title="Durée de conservation" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Vos données sont conservées pendant toute la durée de votre utilisation de l'application, et supprimées dans un délai de <strong>30 jours</strong> suivant la suppression de votre compte.
              </AppText>
            </Section>

            <Section icon={UserCheck} title="Vos droits" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7', display: 'block', marginBottom: 10 }}>
                Conformément au RGPD, vous disposez des droits suivants :
              </AppText>
              <BulletItem text="Droit d'accès à vos données" />
              <BulletItem text="Droit de rectification" />
              <BulletItem text="Droit à l'effacement (« droit à l'oubli »)" />
              <BulletItem text="Droit à la portabilité des données" />
              <BulletItem text="Droit d'opposition au traitement" />
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, backgroundColor: colors.successLight }}>
                <AppText variant="caption" style={{ color: colors.success }}>
                  Pour exercer ces droits : <strong>contact@cesi.fr</strong>
                </AppText>
              </div>
            </Section>

            <Section icon={Lock} title="Sécurité" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction.
              </AppText>
            </Section>

            <Section icon={Mail} title="Contact" accentColor={colors.success}>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Pour toute question relative à cette politique :
              </AppText>
              <AppText variant="body" style={{ color: colors.success, display: 'block', marginTop: 4, fontWeight: '600' }}>
                contact@cesi.fr
              </AppText>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
