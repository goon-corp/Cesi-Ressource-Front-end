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

export default function ConditionsUtilisationPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <AppHeader title="Conditions d'utilisation" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 32 }}>
        <AppText variant="caption" muted style={{ display: 'block', marginBottom: 24 }}>
          Dernière mise à jour : mars 2026
        </AppText>

        <Section title="Objet">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de l'application <strong>Ressources Relationnelles</strong>, plateforme de partage de ressources relationnelles développée dans un cadre pédagogique au sein de l'école CESI.
          </AppText>
        </Section>

        <Section title="Accès au service">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'accès à certaines fonctionnalités de l'application est réservé aux utilisateurs ayant créé un compte. L'inscription est ouverte à toute personne disposant d'une adresse email valide.
          </AppText>
        </Section>

        <Section title="Obligations de l'utilisateur">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginBottom: 8 }}>
            En utilisant l'application, l'utilisateur s'engage à :
          </AppText>
          <BulletItem text="Fournir des informations exactes lors de l'inscription" />
          <BulletItem text="Ne pas usurper l'identité d'une autre personne" />
          <BulletItem text="Ne pas publier de contenu illicite, offensant ou contraire aux bonnes mœurs" />
          <BulletItem text="Ne pas tenter de porter atteinte à la sécurité de la plateforme" />
          <BulletItem text="Respecter les droits des autres utilisateurs" />
        </Section>

        <Section title="Contenus publiés">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'utilisateur est seul responsable des contenus qu'il publie sur la plateforme. En publiant du contenu, l'utilisateur accorde à la plateforme une licence non-exclusive d'affichage et de diffusion au sein de l'application.
          </AppText>
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginTop: 8 }}>
            La plateforme se réserve le droit de supprimer tout contenu jugé inapproprié, sans préavis.
          </AppText>
        </Section>

        <Section title="Compte utilisateur">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation frauduleuse signalée sera traitée dans les meilleurs délais.
          </AppText>
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6', display: 'block', marginTop: 8 }}>
            La plateforme se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.
          </AppText>
        </Section>

        <Section title="Disponibilité du service">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            La plateforme s'efforce d'assurer la disponibilité continue du service. Des interruptions ponctuelles peuvent intervenir pour des raisons de maintenance ou techniques. Aucune garantie de disponibilité n'est contractuellement engagée dans ce cadre pédagogique.
          </AppText>
        </Section>

        <Section title="Modification des CGU">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés de toute modification significative. La poursuite de l'utilisation de l'application après modification vaut acceptation des nouvelles conditions.
          </AppText>
        </Section>

        <Section title="Droit applicable">
          <AppText variant="body" style={{ color: colors.text, lineHeight: '1.6' }}>
            Les présentes conditions sont régies par le droit français. Tout litige sera soumis à la compétence des tribunaux français.
          </AppText>
        </Section>
      </div>
    </div>
  );
}
