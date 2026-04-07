import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Building2, Server, User, BookLock, AlertTriangle, Scale } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppText } from '@/components/ui/AppText';

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderLeft: `4px solid ${colors.primary}`,
      padding: '16px 20px',
      marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={colors.primary} />
        </div>
        <AppText variant="label" style={{ color: colors.primary, fontSize: 15 }}>{title}</AppText>
      </div>
      <div style={{ paddingLeft: 42 }}>
        {children}
      </div>
    </div>
  );
}

export default function MentionsLegalesPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <AppHeader title="Mentions légales" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Hero */}
          <div style={{ backgroundColor: colors.primaryLight, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Info size={26} color={colors.textOnPrimary} />
            </div>
            <div>
              <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.primary, display: 'block' }}>Mentions légales</AppText>
              <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 99, backgroundColor: colors.primary, fontSize: 11, color: colors.textOnPrimary, fontWeight: 600 }}>
                Mise à jour : mars 2026
              </span>
            </div>
          </div>

          <div style={{ padding: '16px 16px 32px' }}>
            <Section icon={Building2} title="Éditeur de l'application">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'application <strong>Ressources Relationnelles</strong> est éditée dans le cadre d'un projet pédagogique au sein de l'école CESI.
              </AppText>
              <AppText variant="body" style={{ color: colors.textMuted, lineHeight: '1.7', display: 'block', marginTop: 8 }}>
                École CESI — 30 Rue Cambronne, 75015 Paris
              </AppText>
              <AppText variant="body" style={{ color: colors.primary, display: 'block', marginTop: 4 }}>
                contact@cesi.fr
              </AppText>
            </Section>

            <Section icon={Server} title="Hébergement">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'application et ses données sont hébergées sur des serveurs sécurisés conformes aux réglementations en vigueur. Les informations relatives à l'hébergeur seront communiquées lors de la mise en production.
              </AppText>
            </Section>

            <Section icon={User} title="Directeur de la publication">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Le directeur de la publication est le responsable pédagogique du projet désigné par l'école CESI.
              </AppText>
            </Section>

            <Section icon={BookLock} title="Propriété intellectuelle">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'ensemble des éléments constituant cette application (textes, images, design, code source) est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, est interdite sans autorisation préalable.
              </AppText>
            </Section>

            <Section icon={AlertTriangle} title="Limitation de responsabilité">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de l'application, ni des interruptions ou indisponibilités du service.
              </AppText>
            </Section>

            <Section icon={Scale} title="Droit applicable">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.
              </AppText>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
