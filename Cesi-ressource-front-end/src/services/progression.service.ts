import { api } from './api';
import type { ApiRessourceProgression } from '@/types/resource.types';

export const progressionService = {
  getProgression: (ressourceId: string, userId: string): Promise<ApiRessourceProgression> =>
    api.get<ApiRessourceProgression>(
      `/ressource-progressions/ressources/${ressourceId}/users/${userId}`,
      true,
    ),

  createProgression: (
    ressourceId: string,
    userId: string,
    isAside: boolean,
    isExploited: boolean,
  ): Promise<ApiRessourceProgression> =>
    api.post<ApiRessourceProgression>('/ressource-progressions', {
      ressource_id: ressourceId,
      user_id: userId,
      is_aside: isAside,
      is_exploited: isExploited,
    }, true),

  updateProgression: (
    ressourceId: string,
    userId: string,
    isAside: boolean,
    isExploited: boolean,
  ): Promise<ApiRessourceProgression> =>
    api.put<ApiRessourceProgression>(
      `/ressource-progressions/ressources/${ressourceId}/users/${userId}`,
      { is_aside: isAside, is_exploited: isExploited },
      true,
    ),
};
