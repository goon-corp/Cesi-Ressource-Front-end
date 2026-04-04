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

export default function MentionsLegalesPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <AppHeader title="Mentions légales" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 32 }}>
        <AppText variant="caption" muted style={{ display: 'block', marginBottom: 24 }}>
          Dernière mise à jour : mars 2026
        </AppText>

        <Section title="Éditeur de l'application">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'application <strong>Ressources Relationnelles</strong> est éditée dans le cadre d'un projet pédagogique au sein de l'école CESI.
          </AppText>
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginTop: 8 }}>
            École CESI — 30 Rue Cambronne, 75015 Paris — contact@cesi.fr
          </AppText>
        </Section>

        <Section title="Hébergement">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'application et ses données sont hébergées sur des serveurs sécurisés conformes aux réglementations en vigueur. Les informations relatives à l'hébergeur seront communiquées lors de la mise en production.
          </AppText>
        </Section>

        <Section title="Directeur de la publication">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Le directeur de la publication est le responsable pédagogique du projet désigné par l'école CESI.
          </AppText>
        </Section>

        <Section title="Propriété intellectuelle">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'ensemble des éléments constituant cette application (textes, images, design, code source) est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, est interdite sans autorisation préalable.
          </AppText>
        </Section>

        <Section title="Limitation de responsabilité">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de l'application, ni des interruptions ou indisponibilités du service.
          </AppText>
        </Section>

        <Section title="Droit applicable">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.
          </AppText>
        </Section>
      </div>
    </div>
  );
}
