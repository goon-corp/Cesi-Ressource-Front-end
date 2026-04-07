import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Mail, AtSign, User, ChevronRight, ChevronLeft, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/hooks/useTheme';
import { useDrawer } from '@/contexts/DrawerContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { DrawerMenu } from '@/components/layout/DrawerMenu';
import { Avatar } from '@/components/ui/Avatar';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ResourceCard, type ResourceCardActionsMode } from '@/components/ui/ResourceCard';
import { userService } from '@/services/user.service';
import { toast } from '@/components/ui/Toast';
import type { ApiResource, PagedResult } from '@/types/resource.types';

const PAGE_SIZE = 10;

type TabKey = 'info' | 'likes' | 'favorites' | 'resources';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Mes infos' },
  { key: 'likes', label: 'Mes likes' },
  { key: 'favorites', label: 'Mes favoris' },
  { key: 'resources', label: 'Mes ressources' },
];

type FetchFn = (userId: string, page: number, size: number) => Promise<PagedResult<ApiResource>>;

function ResourceListTab({ userId, fetchFn, emptyLabel, actionsMode = 'default' }: {
  userId: string;
  fetchFn: FetchFn;
  emptyLabel: string;
  actionsMode?: ResourceCardActionsMode;
}) {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [items, setItems] = useState<ApiResource[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const data = await fetchFn(userId, p, PAGE_SIZE);
      setItems(data.items ?? []);
      setTotalPages(data.total_pages ?? 1);
      setPage(p);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchFn]);

  useEffect(() => { load(1); }, [load]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <span style={{
          display: 'inline-block', width: 32, height: 32,
          border: `3px solid ${colors.primary}`, borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.6s linear infinite',
        }} />

      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48 }}>
        <FileText size={48} color={colors.textLight} />
        <AppText variant="body" muted center style={{ marginTop: 16 }}>{emptyLabel}</AppText>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>
        {items.map((item, index) => (
          <ResourceCard
            key={item.id}
            resource={item}
            index={index}
            actionsMode={actionsMode}
            onPress={() => navigate(`/resources/${item.id}`, { state: { resource: item } })}
          />
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderTop: `1px solid ${colors.borderLight}`,
      }}>
        <button
          onClick={() => load(page - 1)} disabled={page <= 1}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.35 : 1, fontFamily: 'inherit', padding: '6px 8px' }}
        >
          <ChevronLeft size={18} color={colors.primary} />
          <AppText variant="label" style={{ color: colors.primary }}>Précédent</AppText>
        </button>
        <AppText variant="label" muted>Page {page} / {totalPages}</AppText>
        <button
          onClick={() => load(page + 1)} disabled={page >= totalPages}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.35 : 1, fontFamily: 'inherit', padding: '6px 8px' }}
        >
          <AppText variant="label" style={{ color: colors.primary }}>Suivant</AppText>
          <ChevronRight size={18} color={colors.primary} />
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const { user, isLoadingUser, refetchUser } = useUser();
  const { colors } = useTheme();
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  useEffect(() => {
    refetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoadingUser && !user) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ display: 'inline-block', width: 32, height: 32, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie.');
    navigate('/', { replace: true });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <DrawerMenu isOpen={isOpen} onClose={closeDrawer} />
      <AppHeader title="Mon profil" onMenuPress={openDrawer} />

      <div style={{ backgroundColor: colors.primary, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', border: `3px solid ${colors.background}`, borderRadius: '50%', padding: 3, marginBottom: 16 }}>
          <Avatar name={`${user.first_name} ${user.last_name}`} size={88} backgroundColor="rgba(255,255,255,0.2)" textColor="#FFFFFF" />
        </div>
        <AppText style={{ color: colors.textOnPrimary, fontSize: 20, fontWeight: '700', display: 'block' }}>
          {user.first_name} {user.last_name}
        </AppText>
        <AppText style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: 4 }}>
          @{user.user_name}
        </AppText>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: 16, backgroundColor: colors.background }}>
        {[
          { value: user.authored_ressources_count, label: 'Ressources' },
          { value: user.liked_ressources_count, label: 'Likes' },
          { value: user.favorite_ressources_count, label: 'Favoris' },
        ].map(({ value, label }) => (
          <div key={label} style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            backgroundColor: colors.surface, borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <AppText style={{ color: colors.primary, fontSize: 24, fontWeight: '700', display: 'block' }}>{value}</AppText>
            <AppText variant="caption" muted center style={{ marginTop: 2 }}>{label}</AppText>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: colors.surface }}>
        <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 12px',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`,
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  marginRight: 8,
                }}
              >
                <AppText variant="label" style={{ color: isActive ? colors.primary : colors.textMuted, fontWeight: isActive ? '700' : '500' }}>
                  {tab.label}
                </AppText>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'info' && (
          <div style={{ padding: 16, paddingBottom: 32 }}>
            <button
              onClick={() => navigate('/edit-profile')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', padding: 16,
                borderRadius: 8, border: `1px solid ${colors.borderLight}`,
                backgroundColor: colors.surface, cursor: 'pointer',
                marginBottom: 24, background: colors.surface, fontFamily: 'inherit',
              }}
            >
              <Pencil size={20} color={colors.primary} />
              <AppText variant="body" style={{ flex: 1, color: colors.text, marginLeft: 16 }}>Modifier mon profil</AppText>
              <ChevronRight size={18} color={colors.textLight} />
            </button>

            <AppText variant="label" muted style={{ marginBottom: 8, letterSpacing: 0.5, display: 'block' }}>INFORMATIONS</AppText>
            <div style={{ backgroundColor: colors.surface, borderRadius: 8, border: `1px solid ${colors.borderLight}`, padding: '0 16px' }}>
              {[
                { Icon: Mail, label: 'Adresse email', value: user.email },
                { Icon: AtSign, label: "Nom d'utilisateur", value: `@${user.user_name}` },
                { Icon: User, label: 'Prénom', value: user.first_name },
                { Icon: User, label: 'Nom', value: user.last_name },
              ].map(({ Icon, label, value }, i, arr) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={colors.primary} />
                    </div>
                    <div>
                      <AppText variant="caption" muted style={{ display: 'block' }}>{label}</AppText>
                      <AppText variant="body" style={{ color: colors.text }}>{value}</AppText>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div style={{ height: 1, backgroundColor: colors.borderLight, marginLeft: 52 }} />}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <AppButton label="Se déconnecter" onClick={handleLogout} variant="danger" />
            </div>
          </div>
        )}

        {activeTab === 'likes' && (
          <ResourceListTab userId={user.id} fetchFn={userService.getLikedResources} emptyLabel="Vous n'avez encore liké aucune ressource." actionsMode="liked" />
        )}
        {activeTab === 'favorites' && (
          <ResourceListTab userId={user.id} fetchFn={userService.getFavResources} emptyLabel="Vous n'avez encore mis aucune ressource en favori." actionsMode="favorited" />
        )}
        {activeTab === 'resources' && (
          <ResourceListTab userId={user.id} fetchFn={userService.getAuthoredResources} emptyLabel="Vous n'avez encore publié aucune ressource." />
        )}
      </div>
    </div>
  );
}
