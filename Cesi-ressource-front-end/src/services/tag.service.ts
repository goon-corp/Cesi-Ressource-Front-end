import { api } from './api';
import type { TagDto } from '@/types/resource.types';

export const tagService = {
  getTags: (params?: { page?: number; size?: number }): Promise<TagDto[]> =>
    api.get<TagDto[]>('/tags', false, params),

  createTag: (label: string): Promise<TagDto> =>
    api.post<TagDto>('/tags', { label }, true),
};
