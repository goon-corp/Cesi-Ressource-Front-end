import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const PAGE_SIZE = 12;

interface ChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryChip({ label, isActive, onClick }: ChipProps) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: 9999,
        border: `1px solid ${isActive ? colors.primary : colors.border}`,
        backgroundColor: isActive ? colors.primary : colors.surface,
        color: isActive ? colors.textOnPrimary : colors.textMuted,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.15s, border-color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function ResourcesPage() {
  const { colors } = useTheme();
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const [resources, setResources] = useState<ApiResource[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const { data: resourceTypes } = useQuery(
    ['resource-types'],
    () => resourceService.getResourceTypes(),
  );

  const { data: tagsData } = useQuery(
    ['tags-list'],
    () => tagService.getTags({ size: 100 }),
  );

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
      setResources(result?.items ?? []);
      setTotalPages(result?.total_pages ?? 1);
      setPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // silently handled
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activeFilter, selectedTagIds]);

  useEffect(() => {
    fetchResources(1);
  }, [fetchResources]);

  const filters = useMemo<string[]>(
    () => (resourceTypes ?? []).map((t) => t.label),
    [resourceTypes],
  );

  const searchBorderColor = searchFocused ? colors.inputBorderFocus : colors.border;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <DrawerMenu isOpen={isOpen} onClose={closeDrawer} />

      <AppHeader
        title="Ressources"
        onMenuPress={openDrawer}
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/resources/create')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', color: colors.textOnPrimary,
                  fontSize: 24, fontWeight: 700, fontFamily: 'inherit',
                }}
                aria-label="Créer une ressource"
              >
                +
              </button>
            )}
            <HeaderAuthAction />
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '0 16px 32px' }}>
          {/* Search + filters */}
          <div style={{ paddingTop: 20, paddingBottom: 8 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                backgroundColor: colors.surface,
                border: `2px solid ${searchBorderColor}`,
                borderRadius: 9999,
                padding: '8px 16px',
                marginBottom: 12,
                maxWidth: 560,
              }}
            >
              <Search size={16} color={colors.placeholder} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 14,
                  color: colors.text, fontFamily: 'inherit',
                }}
              />
              {search.length > 0 && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={16} color={colors.textMuted} />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <CategoryChip
                label="Tous"
                isActive={activeFilter === null}
                onClick={() => setActiveFilter(null)}
              />
              {filters.map((f) => (
                <CategoryChip
                  key={f}
                  label={f}
                  isActive={activeFilter === f}
                  onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                />
              ))}
            </div>

            {/* Tag chips */}
            {allTags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() =>
                        setSelectedTagIds(
                          isSelected
                            ? selectedTagIds.filter((id) => id !== tag.id)
                            : [...selectedTagIds, tag.id],
                        )
                      }
                      style={{
                        padding: '4px 12px',
                        borderRadius: 9999,
                        border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                        backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                        color: isSelected ? colors.primary : colors.textMuted,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ paddingTop: 8, paddingBottom: 12, borderBottom: `1px solid ${colors.borderLight}` }}>
              <AppText variant="caption" style={{ color: colors.textMuted }}>
                {isLoading ? 'Chargement...' : `${resources.length} ressource${resources.length !== 1 ? 's' : ''}`}
              </AppText>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `3px solid ${colors.primary}`, borderTopColor: 'transparent',
                animation: 'spin 0.6s linear infinite',
              }} />
            </div>
          ) : resources.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 64, gap: 8 }}>
              <Search size={48} color={colors.textLight} />
              <AppText variant="h3" style={{ color: colors.textMuted, marginTop: 16 }}>Aucun résultat</AppText>
              <AppText variant="body" style={{ color: colors.textMuted }}>Modifiez votre recherche ou changez de catégorie.</AppText>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
              paddingTop: 16,
            }}>
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

          {/* Pagination */}
          {!isLoading && resources.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 24, borderTop: `1px solid ${colors.borderLight}`, marginTop: 24,
            }}>
              <button
                onClick={() => fetchResources(page - 1)}
                disabled={page <= 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 16px', borderRadius: 4,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: page <= 1 ? colors.backgroundAlt : colors.surface,
                  color: page <= 1 ? colors.textLight : colors.primary,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={16} />
                Précédent
              </button>
              <AppText variant="label" style={{ color: colors.textMuted }}>
                Page {page} / {totalPages}
              </AppText>
              <button
                onClick={() => fetchResources(page + 1)}
                disabled={page >= totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 16px', borderRadius: 4,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: page >= totalPages ? colors.backgroundAlt : colors.surface,
                  color: page >= totalPages ? colors.textLight : colors.primary,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
