import { api } from './api';
import type { TagDto, PagedResult } from '@/types/resource.types';

export const tagService = {
  getTags: (params?: { page?: number; size?: number }): Promise<PagedResult<TagDto>> =>
    api.get<PagedResult<TagDto>>('/tags', false, params),

  createTag: (label: string): Promise<TagDto> =>
    api.post<TagDto>('/tags', { label }, true),
};
