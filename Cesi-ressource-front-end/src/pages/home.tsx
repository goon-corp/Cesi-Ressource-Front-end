import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, PlusCircle, LogIn, FileText, Shield, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { HeaderAuthAction } from '@/components/layout/HeaderAuthAction';
import { DrawerMenu } from '@/components/layout/DrawerMenu';
import { AppText } from '@/components/ui/AppText';

interface QuickCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  accent?: boolean;
}

function QuickCard({ icon: Icon, title, description, onClick, accent = false }: QuickCardProps) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        width: '100%', padding: 16,
        backgroundColor: accent ? colors.primary : colors.surface,
        border: `1px solid ${accent ? colors.primary : colors.border}`,
        borderRadius: 8,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 10px rgba(0,0,0,0.13)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 8, flexShrink: 0,
        backgroundColor: accent ? 'rgba(255,255,255,0.15)' : colors.primaryLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={accent ? '#fff' : colors.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="label" style={{ display: 'block', color: accent ? '#fff' : colors.text, marginBottom: 2 }}>
          {title}
        </AppText>
        <AppText variant="caption" style={{ color: accent ? 'rgba(255,255,255,0.75)' : colors.textMuted }}>
          {description}
        </AppText>
      </div>
      <ChevronRight size={18} color={accent ? 'rgba(255,255,255,0.6)' : colors.textLight} style={{ flexShrink: 0 }} />
    </button>
  );
}

function SectionTitle({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <AppText variant="label" style={{ display: 'block', color: colors.textMuted, fontSize: 11, letterSpacing: 0.8, marginBottom: 10 }}>
      {children}
    </AppText>
  );
}

export default function HomePage() {
  const { colors } = useTheme();
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const greeting = isAuthenticated && user
    ? `Bonjour, ${user.first_name}\u00A0!`
    : 'Bienvenue\u00A0!';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <DrawerMenu isOpen={isOpen} onClose={closeDrawer} />

      <AppHeader title="Accueil" onMenuPress={openDrawer} rightAction={<HeaderAuthAction />} />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', boxSizing: 'border-box', paddingBottom: 32 }}>

          {/* Hero */}
          <div style={{ padding: '36px 24px 32px', borderBottom: `1px solid ${colors.borderLight}` }}>
            <AppText style={{ fontSize: 26, fontWeight: '700', color: colors.text, display: 'block', lineHeight: '1.25' }}>
              {greeting}
            </AppText>
            <AppText style={{ color: colors.textMuted, display: 'block', marginTop: 8, fontSize: 15, lineHeight: '1.5' }}>
              La plateforme de ressources pour mieux vivre ensemble.
            </AppText>
          </div>

          <div style={{ padding: '0 16px' }}>
            {/* Explorer */}
            <div style={{ paddingTop: 28 }}>
              <SectionTitle>EXPLORER</SectionTitle>
              <QuickCard
                icon={BookOpen}
                title="Toutes les ressources"
                description="Articles, événements, quiz et sondages"
                onClick={() => navigate('/resources')}
                accent
              />
            </div>

            {/* Mon espace */}
            <div style={{ paddingTop: 24 }}>
              <SectionTitle>MON ESPACE</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {isAuthenticated ? (
                  <>
                    <QuickCard
                      icon={User}
                      title="Mon profil"
                      description="Mes ressources, ma watchlist, mes favoris"
                      onClick={() => navigate('/profile')}
                    />
                    <QuickCard
                      icon={PlusCircle}
                      title="Créer une ressource"
                      description="Partagez un contenu avec la communauté"
                      onClick={() => navigate('/resources/create')}
                    />
                  </>
                ) : (
                  <QuickCard
                    icon={LogIn}
                    title="Se connecter"
                    description="Accédez à toutes les fonctionnalités"
                    onClick={() => navigate('/login')}
                  />
                )}
              </div>
            </div>

            {/* Informations */}
            <div style={{ paddingTop: 24 }}>
              <SectionTitle>INFORMATIONS</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <QuickCard
                  icon={FileText}
                  title="Mentions légales"
                  description="Informations légales sur l'application"
                  onClick={() => navigate('/mentions-legales')}
                />
                <QuickCard
                  icon={Shield}
                  title="Politique de confidentialité"
                  description="Comment nous protégeons vos données"
                  onClick={() => navigate('/politique-confidentialite')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
