import { apiClient } from './client';
import { Post, Reel, Reply, PaginatedResponse } from '../types';

export const getLikedPosts = async (page: number, limit: number = 12): Promise<PaginatedResponse<Post>> => {
  const { data } = await apiClient.get(`/api/users/me/liked/posts?page=${page}&limit=${limit}`);
  return data;
};

export const getLikedReels = async (page: number, limit: number = 12): Promise<PaginatedResponse<Reel>> => {
  const { data } = await apiClient.get(`/api/users/me/liked/reels?page=${page}&limit=${limit}`);
  return data;
};

export const getUserComments = async (page: number, limit: number = 20): Promise<PaginatedResponse<Reply>> => {
  const { data } = await apiClient.get(`/api/users/me/comments?page=${page}&limit=${limit}`);
  return data;
};

export const getSavedPosts = async (page: number, limit: number = 12): Promise<PaginatedResponse<Post>> => {
  const { data } = await apiClient.get(`/api/users/saved/posts?page=${page}&limit=${limit}`);
  return data;
};
