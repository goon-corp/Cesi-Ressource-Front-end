import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { HeaderAuthAction } from '@/components/layout/HeaderAuthAction';
import { DrawerMenu } from '@/components/layout/DrawerMenu';
import { AppText } from '@/components/ui/AppText';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { resourceService } from '@/services/resource.service';
import { tagService } from '@/services/tag.service';
import { useQuery } from '@/hooks/useQuery';
import type { ApiResource } from '@/types/resource.types';

const PAGE_SIZE = 10;

function CategoryChip({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onPress}
      style={{
        padding: '6px 16px',
        borderRadius: 9999,
        border: `1px solid ${isActive ? colors.primary : colors.border}`,
        backgroundColor: isActive ? colors.primary : colors.surface,
        color: isActive ? colors.textOnPrimary : colors.textMuted,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 500,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

export default function HomePage() {
  const { colors } = useTheme();
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const [resources, setResources] = useState<ApiResource[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const { data: resourceTypes } = useQuery(['resource-types'], () => resourceService.getResourceTypes());
  const { data: tagsData } = useQuery(['tags-list'], () => tagService.getTags({ size: 100 }));
  const allTags = useMemo(() => tagsData?.items ?? [], [tagsData]);

  const fetchResources = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await resourceService.getResources({
        page: pageNum,
        size: PAGE_SIZE,
        ...(debouncedSearch ? { RessourceTitle: debouncedSearch } : {}),
        ...(activeFilter ? { RessourceType: activeFilter } : {}),
        ...(selectedTagIds.length > 0 ? { RessourceTags: selectedTagIds } : {}),
      });
      setResources(result.items ?? []);
      setTotalPages(result.total_pages ?? 1);
      setPage(pageNum);
    } catch {
      // silently handled
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activeFilter, selectedTagIds]);

  useEffect(() => { fetchResources(1); }, [fetchResources]);

  const filters = useMemo<string[]>(() => (resourceTypes ?? []).map((t) => t.label), [resourceTypes]);

  const toggleTag = useCallback((id: string) => {
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <DrawerMenu isOpen={isOpen} onClose={closeDrawer} />

      <AppHeader
        title="Ressources Relationnelles"
        onMenuPress={openDrawer}
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/resources/create')}
                aria-label="Créer une ressource"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <Plus size={24} color="white" />
              </button>
            )}
            <HeaderAuthAction />
          </div>
        }
      />

      <div style={{ padding: '16px 16px 0', backgroundColor: colors.background, maxWidth: 1200, margin: '0 auto', width: '100%', alignSelf: 'center', boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: `1px solid ${searchFocused ? colors.inputBorderFocus : colors.border}`,
            borderRadius: 20,
            padding: '6px 14px',
            backgroundColor: colors.surface,
            marginBottom: 10,
            boxShadow: searchFocused ? `0 0 0 3px ${colors.primaryLight}` : '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.15s, border-color 0.15s',
          }}
        >
          <Search size={15} color={colors.placeholder} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ressource..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: colors.text,
              fontSize: 13,
              fontFamily: 'inherit',
              padding: 0,
              lineHeight: '20px',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={14} color={colors.textMuted} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          <CategoryChip label="Tous" isActive={activeFilter === null} onPress={() => setActiveFilter(null)} />
          {filters.map((f) => (
            <CategoryChip
              key={f}
              label={f}
              isActive={activeFilter === f}
              onPress={() => setActiveFilter(activeFilter === f ? null : f)}
            />
          ))}
        </div>

        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {allTags.map((tag) => (
              <CategoryChip
                key={tag.id}
                label={tag.label}
                isActive={selectedTagIds.includes(tag.id)}
                onPress={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: `1px solid ${colors.borderLight}`,
          marginBottom: 16,
        }}>
          <AppText variant="caption" muted>
            {isLoading ? 'Chargement...' : `${resources.length} ressource${resources.length !== 1 ? 's' : ''}`}
          </AppText>
          {selectedTagIds.length > 0 && (
            <button
              onClick={() => setSelectedTagIds([])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <AppText variant="caption" style={{ color: colors.primary }}>Effacer les tags</AppText>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 16px', maxWidth: 1200, margin: '0 auto', width: '100%', alignSelf: 'center', boxSizing: 'border-box' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <span style={{
              display: 'inline-block',
              width: 32,
              height: 32,
              border: `3px solid ${colors.primary}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />

          </div>
        ) : resources.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 300, padding: '32px 0' }}>
            <Search size={52} color={colors.textLight} />
            <AppText variant="h3" muted center style={{ marginTop: 16 }}>Aucun résultat</AppText>
            <AppText variant="body" muted center style={{ marginTop: 4 }}>
              Modifiez votre recherche ou changez de catégorie.
            </AppText>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, paddingBottom: 32 }}>
            {resources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                index={index}
                onPress={() => navigate(`/resources/${resource.id}`, { state: { resource } })}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderTop: `1px solid ${colors.borderLight}`,
        backgroundColor: colors.background,
      }}>
        <button
          onClick={() => fetchResources(page - 1)}
          disabled={page <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            opacity: page <= 1 ? 0.35 : 1,
            fontFamily: 'inherit',
            padding: '6px 8px',
          }}
        >
          <ChevronLeft size={18} color={colors.primary} />
          <AppText variant="label" style={{ color: colors.primary }}>Précédent</AppText>
        </button>
        <AppText variant="label" muted>Page {page} / {totalPages}</AppText>
        <button
          onClick={() => fetchResources(page + 1)}
          disabled={page >= totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            opacity: page >= totalPages ? 0.35 : 1,
            fontFamily: 'inherit',
            padding: '6px 8px',
          }}
        >
          <AppText variant="label" style={{ color: colors.primary }}>Suivant</AppText>
          <ChevronRight size={18} color={colors.primary} />
        </button>
      </div>
    </div>
  );
}
