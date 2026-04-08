import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, Tag } from 'lucide-react';
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
import { resourceUrl } from '@/utils/resource-url';
import type { ApiResource } from '@/types/resource.types';

const PAGE_SIZE = 12;

interface TagDropdownProps {
  tags: { id: string; label: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function TagDropdown({ tags, selectedIds, onChange }: TagDropdownProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const filtered = search.trim()
    ? tags.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()))
    : tags;

  const label = selectedIds.length === 0
    ? 'Tags'
    : selectedIds.length === 1
      ? tags.find((t) => t.id === selectedIds[0])?.label ?? 'Tags'
      : `${selectedIds.length} tags`;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px',
          borderRadius: 9999,
          border: `1px solid ${selectedIds.length > 0 ? colors.primary : colors.border}`,
          backgroundColor: selectedIds.length > 0 ? colors.primaryLight : colors.surface,
          color: selectedIds.length > 0 ? colors.primary : colors.textMuted,
          fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        <Tag size={13} />
        {label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        {selectedIds.length > 0 && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            style={{ marginLeft: 2, display: 'flex', alignItems: 'center' }}
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          minWidth: 220, maxWidth: 280,
        }}>
          <div style={{
            padding: '8px 10px',
            borderBottom: `1px solid ${colors.borderLight}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Search size={13} color={colors.placeholder} style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: 13,
                color: colors.text, fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <X size={12} color={colors.textMuted} />
              </button>
            )}
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: '6px 0' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 13, color: colors.textMuted }}>Aucun résultat</div>
            )}
          {filtered.map((tag) => {
            const selected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggle(tag.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, textAlign: 'left',
                  color: selected ? colors.primary : colors.text,
                  backgroundColor: selected ? colors.primaryLight : 'transparent',
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                  border: `2px solid ${selected ? colors.primary : colors.border}`,
                  backgroundColor: selected ? colors.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected && <X size={10} color="#fff" strokeWidth={3} />}
                </span>
                {tag.label}
              </button>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
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
        RessourceStatus: 'Validé',
        ...(debouncedSearch ? { RessourceTitle: debouncedSearch } : {}),
        ...(activeFilter ? { RessourceType: activeFilter } : {}),
        ...(selectedTagIds.length > 0 ? { RessourceTags: selectedTagIds } : {}),
        ...(showFriendsOnly ? { RessourceConfidentialityType: 'Interne Citoyen' } : {}),
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
  }, [debouncedSearch, activeFilter, selectedTagIds, showFriendsOnly]);

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
              {isAuthenticated && (
                <CategoryChip
                  label="Mes amis"
                  isActive={showFriendsOnly}
                  onClick={() => setShowFriendsOnly((v) => !v)}
                />
              )}
            </div>

            {/* Tag dropdown */}
            {allTags.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <TagDropdown
                  tags={allTags}
                  selectedIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                />
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
                  onPress={() => navigate(resourceUrl(resource))}
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
