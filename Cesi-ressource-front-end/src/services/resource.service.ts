import { api } from './api';
import type {
  ApiResource,
  ResourceTypeInfo,
  ResourceStatusInfo,
  ResourceConfidentialityTypeInfo,
  PagedResult,
} from '@/types/resource.types';

export interface ResourceQueryParams {
  page?: number;
  size?: number;
  RessourceTitle?: string;
  RessourceType?: string;
  RessourceTags?: string[];
  [key: string]: string | number | boolean | null | undefined | string[];
}

export const resourceService = {
  getResources: (params?: ResourceQueryParams): Promise<PagedResult<ApiResource>> =>
    api.get<PagedResult<ApiResource>>('/ressources', false, params),

  getResourceTypes: (): Promise<ResourceTypeInfo[]> =>
    api.get<ResourceTypeInfo[]>('/ressource-types', false),

  getConfidentialityTypes: (): Promise<ResourceConfidentialityTypeInfo[]> =>
    api.get<ResourceConfidentialityTypeInfo[]>('/ressource-confidentiality-types', false),

  getStatuses: (): Promise<ResourceStatusInfo[]> =>
    api.get<ResourceStatusInfo[]>('/ressource-statuses', false),

  likeResource: (id: string): Promise<void> =>
    api.post<void>(`/ressources/${id}/like`, {}, true),

  favoriteResource: (id: string): Promise<void> =>
    api.post<void>(`/ressources/${id}/favorite`, {}, true),

  getUserStatus: (id: string): Promise<{ is_liked: boolean; is_favorited: boolean }> =>
    api.get<{ is_liked: boolean; is_favorited: boolean }>(`/ressources/${id}/user-status`, true),
};
