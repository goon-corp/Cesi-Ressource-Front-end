import type { ApiResource } from '@/types/resource.types';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const TYPE_TO_SLUG: Record<string, string> = {
  article: 'articles',
  event: 'evenements',
  evenement: 'evenements',
  évènement: 'evenements',
  événement: 'evenements',
  quiz: 'quiz',
  quizz: 'quiz',
  sondage: 'sondages',
  poll: 'sondages',
};

const SLUG_TO_TYPE: Record<string, string> = {
  articles: 'article',
  evenements: 'event',
  quiz: 'quiz',
  sondages: 'poll',
};

export function typeToSlug(typeLabel: string): string {
  const normalized = typeLabel
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return TYPE_TO_SLUG[normalized] ?? 'ressources';
}

export function slugToType(slug: string): string | null {
  return SLUG_TO_TYPE[slug] ?? null;
}

export function resourceUrl(resource: ApiResource): string {
  const type = typeToSlug(resource.type?.label ?? '');
  const slug = slugify(resource.title) || 'ressource';
  return `/resources/${type}/${slug}/${resource.id}`;
}
