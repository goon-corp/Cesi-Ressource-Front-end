import React, { useState } from 'react';
import { Heart, Bookmark, ImageOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { resourceService } from '@/services/resource.service';
import { AppText } from './AppText';
import type { ApiResource } from '@/types/resource.types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const TYPE_COLORS: Record<string, string> = {
  Article: '#0063CB',
  'Vidéo': '#CE0500',
  Exercice: '#18753C',
  Jeu: '#B34000',
  'Méditation': '#6A6AF4',
  'Activité': '#009081',
  'Événement': '#B34000',
  Event: '#B34000',
};

export type ResourceCardActionsMode = 'default' | 'liked' | 'favorited';

interface ResourceCardProps {
  resource: ApiResource;
  index: number;
  onPress?: () => void;
  actionsMode?: ResourceCardActionsMode;
}

export function ResourceCard({ resource, onPress, actionsMode = 'default' }: ResourceCardProps) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();

  const [liked, setLiked] = useState(actionsMode === 'liked');
  const [favorited, setFavorited] = useState(actionsMode === 'favorited');
  const [likePending, setLikePending] = useState(false);
  const [favPending, setFavPending] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likePending) return;
    const next = !liked;
    setLiked(next);
    setLikePending(true);
    try {
      await resourceService.likeResource(resource.id);
    } catch {
      setLiked(!next);
    } finally {
      setLikePending(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favPending) return;
    const next = !favorited;
    setFavorited(next);
    setFavPending(true);
    try {
      await resourceService.favoriteResource(resource.id);
    } catch {
      setFavorited(!next);
    } finally {
      setFavPending(false);
    }
  };

  const typeLabel = resource.type?.label ?? '';
  const typeColor = TYPE_COLORS[typeLabel] ?? colors.primary;
  const thumbnailUrl = resource.thumbnail_id
    ? `${API_URL}/ressource-medias/${resource.thumbnail_id}`
    : null;

  const renderActions = () => {
    if (!isAuthenticated) return null;

    const buttonBase: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: '10px 0',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
    };

    if (actionsMode === 'liked') {
      return (
        <div style={{ borderTop: `1px solid ${colors.borderLight}` }}>
          <button style={buttonBase} onClick={handleLike} disabled={likePending}>
            <Heart size={18} color={liked ? colors.error : colors.textMuted} fill={liked ? colors.error : 'none'} />
            <AppText variant="caption" style={{ color: liked ? colors.error : colors.textMuted }}>
              {liked ? 'Retiré des likes' : 'Retirer des likes'}
            </AppText>
          </button>
        </div>
      );
    }

    if (actionsMode === 'favorited') {
      return (
        <div style={{ borderTop: `1px solid ${colors.borderLight}` }}>
          <button style={buttonBase} onClick={handleFavorite} disabled={favPending}>
            <Bookmark size={18} color={favorited ? '#B34000' : colors.textMuted} fill={favorited ? '#B34000' : 'none'} />
            <AppText variant="caption" style={{ color: favorited ? '#B34000' : colors.textMuted }}>
              {favorited ? 'Retirer des favoris' : 'Retiré des favoris'}
            </AppText>
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${colors.borderLight}`,
        }}
      >
        <button style={buttonBase} onClick={handleLike} disabled={likePending}>
          <Heart size={18} color={liked ? colors.error : colors.textMuted} fill={liked ? colors.error : 'none'} />
          <AppText variant="caption" style={{ color: liked ? colors.error : colors.textMuted }}>
            J'aime
          </AppText>
        </button>
        <div style={{ width: 1, backgroundColor: colors.borderLight, margin: '6px 0' }} />
        <button style={buttonBase} onClick={handleFavorite} disabled={favPending}>
          <Bookmark size={18} color={favorited ? '#B34000' : colors.textMuted} fill={favorited ? '#B34000' : 'none'} />
          <AppText variant="caption" style={{ color: favorited ? '#B34000' : colors.textMuted }}>
            Favoris
          </AppText>
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        cursor: onPress ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onClick={onPress}
      onMouseEnter={(e) => {
        if (onPress) {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{ position: 'relative' }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={resource.title}
            style={{ width: '100%', height: 175, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.backgroundAlt,
            }}
          >
            <ImageOff size={36} color={colors.textLight} />
          </div>
        )}
        {typeLabel && (
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: typeColor,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
            }}
          >
            {typeLabel}
          </span>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <AppText variant="h3" numberOfLines={2} style={{ marginBottom: 4 }}>
          {resource.title}
        </AppText>
        <AppText variant="bodySmall" muted numberOfLines={2} style={{ marginBottom: 8 }}>
          {resource.description}
        </AppText>
        {resource.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.backgroundAlt,
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {renderActions()}
    </div>
  );
}
