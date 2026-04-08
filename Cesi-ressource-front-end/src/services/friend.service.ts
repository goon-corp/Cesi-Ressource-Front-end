import { api } from './api';
import type { PagedResult } from '@/types/resource.types';

export interface FriendRequestDto {
  user_sender_id: string;
  user_receiver_id: string;
  request_status: string;
  creation_time: string;
  update_time?: string;
}

export const friendService = {
  getRequests: (params?: {
    UserSenderId?: string;
    UserReceiverId?: string;
    RequestStatus?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResult<FriendRequestDto>> =>
    api.get<PagedResult<FriendRequestDto>>('/friends-requests', true, params),

  getRequest: (senderId: string, receiverId: string): Promise<FriendRequestDto> =>
    api.get<FriendRequestDto>(`/friends-requests/${senderId}/${receiverId}`, true),

  send: (receiverId: string): Promise<FriendRequestDto> =>
    api.post<FriendRequestDto>('/friends-requests', { user_receiver_id: receiverId }, true),

  updateStatus: (senderId: string, receiverId: string, status: string): Promise<FriendRequestDto> =>
    api.put<FriendRequestDto>(`/friends-requests/${senderId}/${receiverId}`, { request_status: status }, true),

  remove: (senderId: string, receiverId: string): Promise<void> =>
    api.delete<void>(`/friends-requests/${senderId}/${receiverId}`, true),
};
