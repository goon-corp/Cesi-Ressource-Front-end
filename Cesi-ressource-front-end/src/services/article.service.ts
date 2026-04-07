import { api } from './api';
import type { ApiArticle } from '@/types/resource.types';

export interface UpdateArticleRessource {
  title: string;
  description: string;
  tags: string[];
  statusId: string;
  confidentialityTypeId: string;
  typeId: string;
}

export interface UpdateArticlePayload {
  content: string;
  ressource: UpdateArticleRessource;
}

export interface CreateArticlePayload {
  title: string;
  description: string;
  statusId: string;
  confidentialityTypeId: string;
  typeId: string;
  tags: string[];
  content: string;
  thumbnail?: File;
}

export const articleService = {
  getArticleByResourceId: (resourceId: string): Promise<ApiArticle> =>
    api.get<ApiArticle>(`/articles/${resourceId}`, false),

  createArticle: (payload: CreateArticlePayload): Promise<ApiArticle> => {
    const formData = new FormData();
    formData.append('Ressource.Title', payload.title);
    formData.append('Ressource.Description', payload.description);
    formData.append('Ressource.StatusId', payload.statusId);
    formData.append('Ressource.ConfidentialityTypeId', payload.confidentialityTypeId);
    formData.append('Ressource.TypeId', payload.typeId);
    payload.tags.forEach((tagId, i) => {
      formData.append(`Ressource.Tags[${i}]`, tagId);
    });
    if (payload.thumbnail) {
      formData.append('Ressource.Thumbnail', payload.thumbnail);
    }
    formData.append('Content', payload.content);
    return api.upload<ApiArticle>('POST', '/articles', formData, true);
  },

  updateArticle: (articleId: string, payload: UpdateArticlePayload): Promise<ApiArticle> =>
    api.put<ApiArticle>(`/articles/${articleId}`, {
      content: payload.content,
      ressource: {
        title: payload.ressource.title,
        description: payload.ressource.description,
        tags: payload.ressource.tags,
        status_id: payload.ressource.statusId,
        confidentiality_type_id: payload.ressource.confidentialityTypeId,
        type_id: payload.ressource.typeId,
      },
    }, true),

  deleteArticle: (articleId: string): Promise<void> =>
    api.delete<void>(`/articles/${articleId}`, true),
};
