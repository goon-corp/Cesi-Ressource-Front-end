import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppText } from '@/components/ui/AppText';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ marginBottom: 24 }}>
      <AppText variant="label" style={{ color: colors.primary, display: 'block', marginBottom: 4 }}>{title}</AppText>
      {children}
    </div>
  );
}

function BulletItem({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 4 }}>
      <AppText variant="body" style={{ color: colors.primary, marginRight: 6, flexShrink: 0 }}>•</AppText>
      <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>{text}</AppText>
    </div>
  );
}

export default function PolitiqueConfidentialitePage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <AppHeader title="Politique de confidentialité" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 32 }}>
        <AppText variant="caption" muted style={{ display: 'block', marginBottom: 24 }}>
          Dernière mise à jour : mars 2026
        </AppText>

        <Section title="Introduction">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'application Ressources Relationnelles s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD).
          </AppText>
        </Section>

        <Section title="Données collectées">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginBottom: 8 }}>
            Lors de l'inscription et de l'utilisation de l'application, nous collectons les données suivantes :
          </AppText>
          <BulletItem text="Nom et prénom" />
          <BulletItem text="Nom d'utilisateur" />
          <BulletItem text="Adresse email" />
          <BulletItem text="Données de connexion (date, heure, adresse IP)" />
          <BulletItem text="Contenus publiés (ressources, commentaires)" />
        </Section>

        <Section title="Finalités du traitement">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginBottom: 8 }}>
            Vos données sont traitées pour :
          </AppText>
          <BulletItem text="Gérer votre compte et votre authentification" />
          <BulletItem text="Vous permettre d'accéder aux fonctionnalités de la plateforme" />
          <BulletItem text="Assurer la sécurité de l'application" />
          <BulletItem text="Améliorer les services proposés" />
        </Section>

        <Section title="Base légale">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Le traitement de vos données repose sur votre consentement lors de l'inscription, ainsi que sur l'exécution du contrat de service liant l'utilisateur à la plateforme.
          </AppText>
        </Section>

        <Section title="Durée de conservation">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Vos données sont conservées pendant toute la durée de votre utilisation de l'application, et supprimées dans un délai de 30 jours suivant la suppression de votre compte.
          </AppText>
        </Section>

        <Section title="Vos droits">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginBottom: 8 }}>
            Conformément au RGPD, vous disposez des droits suivants :
          </AppText>
          <BulletItem text="Droit d'accès à vos données" />
          <BulletItem text="Droit de rectification" />
          <BulletItem text="Droit à l'effacement (« droit à l'oubli »)" />
          <BulletItem text="Droit à la portabilité des données" />
          <BulletItem text="Droit d'opposition au traitement" />
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginTop: 8 }}>
            Pour exercer ces droits, contactez-nous à : contact@cesi.fr
          </AppText>
        </Section>

        <Section title="Sécurité">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction.
          </AppText>
        </Section>

        <Section title="Contact">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Pour toute question relative à cette politique, vous pouvez nous contacter à l'adresse : contact@cesi.fr
          </AppText>
        </Section>
      </div>
    </div>
  );
}
