import type { UserProfileDto, UpdateUserPayload } from "@/types/user.types";
import type { ApiResource, PagedResult } from "@/types/resource.types";
import { api } from "./api";

const PAGE_SIZE = 10;

export const userService = {
	getUserProfile: (userId: string): Promise<UserProfileDto> =>
		api.get<UserProfileDto>(`/user/${userId}/profile`),

	updateUserProfile: (
		userId: string,
		payload: UpdateUserPayload,
	): Promise<UserProfileDto> =>
		api.put<UserProfileDto>(`/user/${userId}`, payload),

	getLikedResources: (
		userId: string,
		page = 1,
		size = PAGE_SIZE,
	): Promise<PagedResult<ApiResource>> =>
		api.get<PagedResult<ApiResource>>(
			`/user/${userId}/liked-ressources`,
			true,
			{ page, size },
		),

	getFavResources: (
		userId: string,
		page = 1,
		size = PAGE_SIZE,
	): Promise<PagedResult<ApiResource>> =>
		api.get<PagedResult<ApiResource>>(`/user/${userId}/fav-ressources`, true, {
			page,
			size,
		}),

	getAuthoredResources: (
		userId: string,
		page = 1,
		size = PAGE_SIZE,
	): Promise<PagedResult<ApiResource>> =>
		api.get<PagedResult<ApiResource>>(
			`/user/${userId}/authored-ressources`,
			true,
			{ page, size },
		),

	getAsideResources: (
		userId: string,
		page = 1,
		size = PAGE_SIZE,
	): Promise<PagedResult<ApiResource>> =>
		api.get<PagedResult<ApiResource>>(
			`/user/${userId}/aside-ressources`,
			true,
			{ page, size },
		),

	getExploitedResources: (
		userId: string,
		page = 1,
		size = PAGE_SIZE,
	): Promise<PagedResult<ApiResource>> =>
		api.get<PagedResult<ApiResource>>(
			`/user/${userId}/exploited-ressources`,
			true,
			{ page, size },
		),
	
	confirmAccount: (
		token: string
	): Promise<void> => api.put(`/auth/confirm-account/${token}`,null,false,false)
};
