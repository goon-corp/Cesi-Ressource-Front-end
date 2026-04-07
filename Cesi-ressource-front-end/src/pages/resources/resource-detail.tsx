import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Globe, MapPin, Link2, Calendar, Bookmark, BookmarkCheck, Eye, AlertCircle, FileText } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { AppText } from '@/components/ui/AppText';
import { AppHeader } from '@/components/layout/AppHeader';
import { useQuery } from '@/hooks/useQuery';
import { eventService } from '@/services/event.service';
import { articleService } from '@/services/article.service';
import { progressionService } from '@/services/progression.service';
import { ApiError } from '@/services/api';
import type { ApiEvent, ApiArticle, ApiResource } from '@/types/resource.types';

function normalizeLabel(label: string): string {
  return label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isEventLabel(label: string): boolean {
  const n = normalizeLabel(label);
  return n.includes('event') || n.includes('venement');
}

function isArticleLabel(label: string): boolean {
  return normalizeLabel(label).includes('article');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventDetail({ event }: { event: ApiEvent }) {
  const { colors } = useTheme();
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
        {event.is_virtual
          ? <Globe size={18} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
          : <MapPin size={18} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
        }
        <AppText variant="body" style={{ flex: 1 }}>
          {event.is_virtual ? 'Événement en ligne' : event.location}
        </AppText>
      </div>

      {event.is_virtual && event.event_link && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
          <Link2 size={18} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
          <AppText variant="body" style={{ flex: 1, wordBreak: 'break-all' }}>{event.event_link}</AppText>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
        <Calendar size={18} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <AppText variant="caption" muted style={{ display: 'block' }}>Début</AppText>
          <AppText variant="body">{formatDate(event.date_start)}</AppText>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
        <Calendar size={18} color={colors.info} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <AppText variant="caption" muted style={{ display: 'block' }}>Fin</AppText>
          <AppText variant="body">{formatDate(event.date_end)}</AppText>
        </div>
      </div>
    </div>
  );
}

function ArticleDetail({ article }: { article: ApiArticle }) {
  const { colors } = useTheme();
  return (
    <div style={{ padding: 16, borderRadius: 4, border: `1px solid ${colors.borderLight}`, backgroundColor: colors.surface }}>
      <AppText variant="body" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{article.content}</AppText>
    </div>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  iconActive: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  activeColor: string;
  pending: boolean;
  onPress: () => void;
}

function ToggleRow({ icon, iconActive, label, sublabel, active, activeColor, pending, onPress }: ToggleRowProps) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onPress}
      disabled={pending}
      style={{
        display: 'flex', alignItems: 'center', padding: 16,
        background: 'none', border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        width: '100%', fontFamily: 'inherit', textAlign: 'left',
        opacity: pending ? 0.7 : 1,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 22, flexShrink: 0,
        backgroundColor: active ? activeColor + '22' : colors.backgroundAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-color 0.15s',
      }}>
        {pending
          ? <span style={{ display: 'inline-block', width: 20, height: 20, border: `2px solid ${active ? activeColor : colors.textMuted}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          : (active ? iconActive : icon)
        }
      </div>
      <div style={{ flex: 1, marginLeft: 16 }}>
        <AppText variant="label" style={{ color: active ? activeColor : colors.text, display: 'block' }}>{label}</AppText>
        <AppText variant="caption" muted>{sublabel}</AppText>
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${active ? activeColor : colors.border}`, backgroundColor: active ? activeColor : 'transparent', flexShrink: 0 }} />
    </button>
  );
}

function WatchlistSection({ ressourceId, userId }: { ressourceId: string; userId: string }) {
  const { colors } = useTheme();

  const [localState, setLocalState] = useState<{ isAside: boolean; isExploited: boolean; exists: boolean } | null>(null);
  const [asidePending, setAsidePending] = useState(false);
  const [exploitedPending, setExploitedPending] = useState(false);

  const { data: progression, error: progressionError, isLoading } = useQuery(
    ['progression', ressourceId, userId],
    () => progressionService.getProgression(ressourceId, userId),
  );

  useEffect(() => {
    if (progression) {
      setLocalState({ isAside: progression.is_aside, isExploited: progression.is_exploited, exists: true });
    } else if (progressionError instanceof ApiError && progressionError.status === 404) {
      setLocalState({ isAside: false, isExploited: false, exists: false });
    }
  }, [progression, progressionError]);

  const toggle = async (field: 'isAside' | 'isExploited', setPending: (v: boolean) => void) => {
    if (!localState) return;
    const next = !localState[field];
    const optimistic = { ...localState, [field]: next };
    setLocalState(optimistic);
    setPending(true);
    try {
      if (!localState.exists) {
        await progressionService.createProgression(ressourceId, userId, optimistic.isAside, optimistic.isExploited);
        setLocalState((s) => s ? { ...s, exists: true } : s);
      } else {
        await progressionService.updateProgression(ressourceId, userId, optimistic.isAside, optimistic.isExploited);
      }
    } catch {
      setLocalState((s) => s ? { ...s, [field]: !next } : s);
    } finally {
      setPending(false);
    }
  };

  if (isLoading || localState === null) {
    return (
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
        <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>Ma progression</AppText>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <span style={{ display: 'inline-block', width: 24, height: 24, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
      <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>Ma progression</AppText>
      <div style={{ borderRadius: 8, border: `1px solid ${colors.border}`, backgroundColor: colors.surface, overflow: 'hidden' }}>
        <ToggleRow
          icon={<Bookmark size={22} color={colors.textMuted} />}
          iconActive={<BookmarkCheck size={22} color={colors.primary} />}
          label="Mettre de côté"
          sublabel="Ajouter à ma liste de lecture"
          active={localState.isAside}
          activeColor={colors.primary}
          pending={asidePending}
          onPress={() => toggle('isAside', setAsidePending)}
        />
        <div style={{ height: 1, backgroundColor: colors.borderLight, marginLeft: 16, marginRight: 16 }} />
        <ToggleRow
          icon={<Eye size={22} color={colors.textMuted} />}
          iconActive={<Eye size={22} color={colors.success} />}
          label="Marquer comme consulté"
          sublabel="J'ai lu / regardé cette ressource"
          active={localState.isExploited}
          activeColor={colors.success}
          pending={exploitedPending}
          onPress={() => toggle('isExploited', setExploitedPending)}
        />
      </div>
    </div>
  );
}

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { isAuthenticated, userId } = useAuth();

  const passedResource = (location.state as { resource?: ApiResource } | null)?.resource ?? null;
  const resourceType = passedResource?.type?.label ?? '';

  const isEvent = isEventLabel(resourceType);
  const isArticle = isArticleLabel(resourceType);

  const { data: eventData, isLoading: loadingEvent, error: errorEvent } = useQuery(
    ['resource-detail-event', id],
    () => eventService.getEventByResourceId(id!),
    { enabled: !!id && isEvent },
  );

  const { data: articleData, isLoading: loadingArticle, error: errorArticle } = useQuery(
    ['resource-detail-article', id],
    () => articleService.getArticleByResourceId(id!),
    { enabled: !!id && isArticle },
  );

  const isLoading = loadingEvent || loadingArticle;
  const hasError = (isEvent && errorEvent) || (isArticle && errorArticle);
  const hasFetcher = isEvent || isArticle;

  const resource: ApiResource | null = eventData?.ressource ?? articleData?.ressource ?? passedResource ?? null;

  const renderSpecificContent = () => {
    if (isEvent && eventData) return <EventDetail event={eventData} />;
    if (isArticle && articleData) return <ArticleDetail article={articleData} />;
    return null;
  };

  const renderContent = () => {
    if (hasFetcher && isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 48 }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />

        </div>
      );
    }

    if (hasFetcher && hasError && !resource) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <AlertCircle size={48} color={colors.error} />
          <AppText variant="body" muted center style={{ marginTop: 16 }}>Impossible de charger la ressource.</AppText>
        </div>
      );
    }

    if (!resource) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <FileText size={48} color={colors.textLight} />
          <AppText variant="body" muted center style={{ marginTop: 16 }}>Ressource introuvable.</AppText>
        </div>
      );
    }

    const specificContent = renderSpecificContent();

    return (
      <div style={{ padding: 16, paddingBottom: 32 }}>

        {resourceType && (
          <span style={{ display: 'inline-block', backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 9999, marginBottom: 12 }}>
            {resourceType}
          </span>
        )}

        <AppText variant="h2" style={{ display: 'block', marginBottom: 8 }}>{resource.title}</AppText>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {resource.confidentiality_type && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 9999, border: `1px solid ${colors.border}`, backgroundColor: colors.backgroundAlt }}>
              <AppText variant="caption" muted>{resource.confidentiality_type.label}</AppText>
            </span>
          )}
          {resource.status && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 9999, border: `1px solid ${colors.success}`, backgroundColor: colors.successLight }}>
              <AppText variant="caption" style={{ color: colors.success }}>{resource.status.label}</AppText>
            </span>
          )}
        </div>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
          <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Description</AppText>
          <AppText variant="body" style={{ lineHeight: '1.6' }}>{resource.description}</AppText>
        </div>

        {specificContent && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
            <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>
              {isArticle ? 'Contenu' : 'Informations spécifiques'}
            </AppText>
            {specificContent}
          </div>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
            <AppText variant="label" style={{ display: 'block', marginBottom: 8 }}>Tags</AppText>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {resource.tags.map((tag) => (
                <span key={tag.id} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, border: `1px solid ${colors.primary}`, backgroundColor: colors.primaryLight }}>
                  <AppText variant="caption" style={{ color: colors.primary }}>{tag.label}</AppText>
                </span>
              ))}
            </div>
          </div>
        )}

        {isAuthenticated && userId && id && (
          <WatchlistSection ressourceId={id} userId={userId} />
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <AppHeader title={resource?.title ?? 'Détails'} onMenuPress={() => navigate(-1)} showBack />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}
