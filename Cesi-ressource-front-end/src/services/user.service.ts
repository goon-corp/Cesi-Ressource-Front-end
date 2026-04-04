import type { UserProfileDto, UpdateUserPayload } from '@/types/user.types';
import type { ApiResource } from '@/types/resource.types';
import { api } from './api';

const PAGE_SIZE = 10;

export const userService = {
  getUserProfile: (userId: string): Promise<UserProfileDto> =>
    api.get<UserProfileDto>(`/user/${userId}/profile`),

  updateUserProfile: (userId: string, payload: UpdateUserPayload): Promise<UserProfileDto> =>
    api.patch<UserProfileDto>(`/user/profile/${userId}`, payload),

  getLikedResources: (userId: string, page = 1, size = PAGE_SIZE): Promise<ApiResource[]> =>
    api.get<ApiResource[]>(`/user/${userId}/liked-ressources`, true, { page, size }),

  getFavResources: (userId: string, page = 1, size = PAGE_SIZE): Promise<ApiResource[]> =>
    api.get<ApiResource[]>(`/user/${userId}/fav-ressources`, true, { page, size }),

  getAuthoredResources: (userId: string, page = 1, size = PAGE_SIZE): Promise<ApiResource[]> =>
    api.get<ApiResource[]>(`/user/${userId}/authored-ressources`, true, { page, size }),
};
