import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, FileText, UserPlus, UserCheck, Clock, X as XIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { Avatar } from '@/components/ui/Avatar';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { toast } from '@/components/ui/Toast';
import { userService } from '@/services/user.service';
import { friendService, type FriendRequestDto } from '@/services/friend.service';
import { resourceUrl } from '@/utils/resource-url';
import type { UserProfileDto } from '@/types/user.types';
import type { ApiResource, PagedResult } from '@/types/resource.types';

const PAGE_SIZE = 10;

type TabKey = 'resources' | 'likes' | 'favorites';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'resources', label: 'Ressources' },
  { key: 'likes', label: 'Likes' },
  { key: 'favorites', label: 'Favoris' },
];

type FetchFn = (userId: string, page: number, size: number) => Promise<PagedResult<ApiResource>>;

function ResourceListTab({ userId, fetchFn, emptyLabel }: {
  userId: string; fetchFn: FetchFn; emptyLabel: string;
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
        <span style={{ display: 'inline-block', width: 32, height: 32, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
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
          <ResourceCard key={item.id} resource={item} index={index} onPress={() => navigate(resourceUrl(item))} />
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: `1px solid ${colors.borderLight}` }}>
          <button onClick={() => load(page - 1)} disabled={page <= 1} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.35 : 1, fontFamily: 'inherit', padding: '6px 8px' }}>
            <ChevronLeft size={18} color={colors.primary} />
            <AppText variant="label" style={{ color: colors.primary }}>Pr&eacute;c&eacute;dent</AppText>
          </button>
          <AppText variant="label" muted>Page {page} / {totalPages}</AppText>
          <button onClick={() => load(page + 1)} disabled={page >= totalPages} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.35 : 1, fontFamily: 'inherit', padding: '6px 8px' }}>
            <AppText variant="label" style={{ color: colors.primary }}>Suivant</AppText>
            <ChevronRight size={18} color={colors.primary} />
          </button>
        </div>
      )}
    </div>
  );
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'self';

export default function PublicProfilePage() {
  const { id: profileUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { isAuthenticated, userId } = useAuth();

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('resources');

  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [friendLoading, setFriendLoading] = useState(false);

  const isSelf = isAuthenticated && userId === profileUserId;

  useEffect(() => {
    if (!profileUserId) return;
    if (isSelf) { navigate('/profile', { replace: true }); return; }
    setIsLoading(true);
    userService.getUserProfile(profileUserId)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, [profileUserId, isSelf, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !userId || !profileUserId || isSelf) return;
    // Check both directions
    friendService.getRequests({ UserSenderId: userId, UserReceiverId: profileUserId, size: 1 })
      .then((res) => {
        if (res.items.length > 0) {
          const status = res.items[0].request_status;
          setFriendStatus(status === 'Accepted' ? 'accepted' : 'pending_sent');
          return;
        }
        return friendService.getRequests({ UserSenderId: profileUserId, UserReceiverId: userId, size: 1 });
      })
      .then((res) => {
        if (!res) return;
        if (res.items.length > 0) {
          const status = res.items[0].request_status;
          setFriendStatus(status === 'Accepted' ? 'accepted' : 'pending_received');
        }
      })
      .catch(() => {});
  }, [isAuthenticated, userId, profileUserId, isSelf]);

  const handleSendRequest = async () => {
    if (!profileUserId) return;
    setFriendLoading(true);
    try {
      await friendService.send(profileUserId);
      setFriendStatus('pending_sent');
      toast.success('Demande d\'ami envoyée.');
    } catch {
      toast.error('Impossible d\'envoyer la demande.');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!profileUserId || !userId) return;
    setFriendLoading(true);
    try {
      await friendService.updateStatus(profileUserId, userId, 'Accepted');
      setFriendStatus('accepted');
      toast.success('Demande acceptée !');
    } catch {
      toast.error('Impossible d\'accepter la demande.');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profileUserId || !userId) return;
    setFriendLoading(true);
    try {
      // Try both directions
      try { await friendService.remove(userId, profileUserId); } catch { await friendService.remove(profileUserId, userId); }
      setFriendStatus('none');
      toast.success('Ami retiré.');
    } catch {
      toast.error('Impossible de retirer l\'ami.');
    } finally {
      setFriendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <AppHeader title="Profil" onMenuPress={() => navigate(-1)} showBack />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ display: 'inline-block', width: 32, height: 32, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
        <AppHeader title="Profil" onMenuPress={() => navigate(-1)} showBack />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <AppText variant="h3" muted>Utilisateur introuvable</AppText>
        </div>
      </div>
    );
  }

  const renderFriendButton = () => {
    if (!isAuthenticated) return null;

    switch (friendStatus) {
      case 'accepted':
        return (
          <button onClick={handleRemoveFriend} disabled={friendLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.success}`, backgroundColor: `${colors.success}15`, cursor: 'pointer', fontFamily: 'inherit' }}>
            <UserCheck size={16} color={colors.success} />
            <AppText variant="label" style={{ color: colors.success }}>Amis</AppText>
          </button>
        );
      case 'pending_sent':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.textMuted}`, backgroundColor: colors.backgroundAlt }}>
            <Clock size={16} color={colors.textMuted} />
            <AppText variant="label" muted>Demande envoyée</AppText>
          </div>
        );
      case 'pending_received':
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAcceptRequest} disabled={friendLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: colors.primary, cursor: 'pointer', fontFamily: 'inherit' }}>
              <UserCheck size={16} color={colors.textOnPrimary} />
              <AppText variant="label" style={{ color: colors.textOnPrimary }}>Accepter</AppText>
            </button>
            <button onClick={handleRemoveFriend} disabled={friendLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, backgroundColor: colors.surface, cursor: 'pointer', fontFamily: 'inherit' }}>
              <XIcon size={16} color={colors.textMuted} />
            </button>
          </div>
        );
      default:
        return (
          <button onClick={handleSendRequest} disabled={friendLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: colors.primary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <UserPlus size={16} color={colors.textOnPrimary} />
            <AppText variant="label" style={{ color: colors.textOnPrimary }}>Ajouter en ami</AppText>
          </button>
        );
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <AppHeader title={`@${profile.user_name}`} onMenuPress={() => navigate(-1)} showBack />

      <div style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: colors.surface }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', padding: '20px 16px 16px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ border: `3px solid ${colors.primary}`, borderRadius: '50%', padding: 2, flexShrink: 0 }}>
              <Avatar name={`${profile.first_name} ${profile.last_name}`} size={64} backgroundColor={colors.primaryLight} textColor={colors.primary} />
            </div>
            <div style={{ flex: 1 }}>
              <AppText style={{ fontSize: 18, fontWeight: '700', display: 'block', color: colors.text }}>
                {profile.first_name} {profile.last_name}
              </AppText>
              <AppText style={{ color: colors.textMuted, display: 'block', marginTop: 2, fontSize: 14 }}>
                @{profile.user_name}
              </AppText>
            </div>
            {renderFriendButton()}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: profile.authored_ressources_count, label: 'Ressources' },
              { value: profile.liked_ressources_count, label: 'Likes' },
              { value: profile.favorite_ressources_count, label: 'Favoris' },
            ].map(({ value, label }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', padding: '8px 0', backgroundColor: colors.background, borderRadius: 8, border: `1px solid ${colors.borderLight}` }}>
                <AppText style={{ color: colors.primary, fontSize: 20, fontWeight: '700', display: 'block' }}>{value}</AppText>
                <AppText variant="caption" muted style={{ marginTop: 1 }}>{label}</AppText>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: colors.surface }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '12px 12px', border: 'none', borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`, background: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', marginRight: 8 }}>
                  <AppText variant="label" style={{ color: isActive ? colors.primary : colors.textMuted, fontWeight: isActive ? '700' : '500' }}>{tab.label}</AppText>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
          {activeTab === 'resources' && profileUserId && (
            <ResourceListTab userId={profileUserId} fetchFn={userService.getAuthoredResources} emptyLabel="Aucune ressource publiée." />
          )}
          {activeTab === 'likes' && profileUserId && (
            <ResourceListTab userId={profileUserId} fetchFn={userService.getLikedResources} emptyLabel="Aucun like." />
          )}
          {activeTab === 'favorites' && profileUserId && (
            <ResourceListTab userId={profileUserId} fetchFn={userService.getFavResources} emptyLabel="Aucun favori." />
          )}
        </div>
      </div>
    </div>
  );
}
