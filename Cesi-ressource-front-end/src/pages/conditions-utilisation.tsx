import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Target, UserCog, ShieldAlert, FileImage, KeyRound, Wifi, RefreshCw, Scale } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppText } from '@/components/ui/AppText';

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderLeft: `4px solid ${colors.info}`,
      padding: '16px 20px',
      marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: colors.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={colors.info} />
        </div>
        <AppText variant="label" style={{ color: colors.info, fontSize: 15 }}>{title}</AppText>
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
      <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.info, flexShrink: 0, marginTop: 8 }} />
      <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>{text}</AppText>
    </div>
  );
}

export default function ConditionsUtilisationPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <AppHeader title="Conditions d'utilisation" onMenuPress={() => navigate(-1)} showBack />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Hero */}
          <div style={{ backgroundColor: colors.infoLight, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.info, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={26} color="#fff" />
            </div>
            <div>
              <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.info, display: 'block' }}>Conditions d'utilisation</AppText>
              <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 99, backgroundColor: colors.info, fontSize: 11, color: '#fff', fontWeight: 600 }}>
                Mise à jour : mars 2026
              </span>
            </div>
          </div>

          {/* Intro notice */}
          <div style={{ margin: '16px 16px 4px', padding: '10px 14px', borderRadius: 6, backgroundColor: colors.warningLight, border: `1px solid ${colors.warning}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={16} color={colors.warning} style={{ flexShrink: 0 }} />
            <AppText variant="caption" style={{ color: colors.warning, lineHeight: '1.5' }}>
              En utilisant l'application, vous acceptez pleinement les présentes conditions générales d'utilisation.
            </AppText>
          </div>

          <div style={{ padding: '8px 16px 32px' }}>
            <Section icon={Target} title="Objet">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de l'application <strong>Ressources Relationnelles</strong>, plateforme de partage de ressources relationnelles développée dans un cadre pédagogique au sein de l'école CESI.
              </AppText>
            </Section>

            <Section icon={KeyRound} title="Accès au service">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'accès à certaines fonctionnalités de l'application est réservé aux utilisateurs ayant créé un compte. L'inscription est ouverte à toute personne disposant d'une adresse email valide.
              </AppText>
            </Section>

            <Section icon={UserCog} title="Obligations de l'utilisateur">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7', display: 'block', marginBottom: 10 }}>
                En utilisant l'application, l'utilisateur s'engage à :
              </AppText>
              <BulletItem text="Fournir des informations exactes lors de l'inscription" />
              <BulletItem text="Ne pas usurper l'identité d'une autre personne" />
              <BulletItem text="Ne pas publier de contenu illicite, offensant ou contraire aux bonnes mœurs" />
              <BulletItem text="Ne pas tenter de porter atteinte à la sécurité de la plateforme" />
              <BulletItem text="Respecter les droits des autres utilisateurs" />
            </Section>

            <Section icon={FileImage} title="Contenus publiés">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'utilisateur est seul responsable des contenus qu'il publie sur la plateforme. En publiant du contenu, l'utilisateur accorde à la plateforme une licence non-exclusive d'affichage et de diffusion au sein de l'application.
              </AppText>
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, backgroundColor: colors.infoLight }}>
                <AppText variant="caption" style={{ color: colors.info }}>
                  La plateforme se réserve le droit de supprimer tout contenu jugé inapproprié, sans préavis.
                </AppText>
              </div>
            </Section>

            <Section icon={ShieldAlert} title="Compte utilisateur">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation frauduleuse signalée sera traitée dans les meilleurs délais.
              </AppText>
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7', display: 'block', marginTop: 8 }}>
                La plateforme se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.
              </AppText>
            </Section>

            <Section icon={Wifi} title="Disponibilité du service">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                La plateforme s'efforce d'assurer la disponibilité continue du service. Des interruptions ponctuelles peuvent intervenir pour des raisons de maintenance ou techniques. Aucune garantie de disponibilité n'est contractuellement engagée dans ce cadre pédagogique.
              </AppText>
            </Section>

            <Section icon={RefreshCw} title="Modification des CGU">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés de toute modification significative. La poursuite de l'utilisation de l'application après modification vaut acceptation des nouvelles conditions.
              </AppText>
            </Section>

            <Section icon={Scale} title="Droit applicable">
              <AppText variant="body" style={{ color: colors.text, lineHeight: '1.7' }}>
                Les présentes conditions sont régies par le droit français. Tout litige sera soumis à la compétence des tribunaux français.
              </AppText>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
