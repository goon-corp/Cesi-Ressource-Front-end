import { api } from './api';
import type { ApiPoll, ApiPollOption } from '@/types/resource.types';

export interface CreatePollPayload {
  title: string;
  description: string;
  statusId: string;
  confidentialityTypeId: string;
  typeId: string;
  tags: string[];
  thumbnail?: File;
}

export interface CreatePollOptionPayload {
  option: string;
  pollId: string;
}

export const pollService = {
  createPoll: (payload: CreatePollPayload): Promise<ApiPoll> => {
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
    return api.upload<ApiPoll>('POST', '/polls', formData, true);
  },

  createPollOption: (payload: CreatePollOptionPayload): Promise<ApiPollOption> =>
    api.post<ApiPollOption>('/PollOption', {
      option: payload.option,
      pollId: payload.pollId,
    }, true),
};
