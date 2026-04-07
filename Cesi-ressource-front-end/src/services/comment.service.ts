import { api } from './api';
import type { CommentDto, PagedResult } from '@/types/resource.types';

export const commentService = {
  getByRessource: (ressourceId: string, page = 1, size = 10): Promise<PagedResult<CommentDto>> =>
    api.get<PagedResult<CommentDto>>(`/comments/ressource/${ressourceId}`, false, { page, size }),

  create: (payload: { content: string; ressourceId: string; userId: string; commentId?: string }): Promise<CommentDto> =>
    api.post<CommentDto>('/comments', {
      content: payload.content,
      ressource_id: payload.ressourceId,
      user_id: payload.userId,
      comment_id: payload.commentId,
    }, true),

  update: (id: string, content: string): Promise<CommentDto> =>
    api.put<CommentDto>(`/comments/${id}`, { content }, true),

  delete: (id: string): Promise<void> =>
    api.delete<void>(`/comments/${id}`, true),
};
