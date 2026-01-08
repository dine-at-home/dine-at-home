import { getApiUrl } from './api-config';
import { Dinner } from '@/types';

export interface FavoriteResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class FavoriteService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  async addFavorite(dinnerId: string): Promise<FavoriteResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(getApiUrl('/favorites'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ dinnerId }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Add favorite error:', error);
      return { success: false, error: error.message || 'Failed to add favorite' };
    }
  }

  async removeFavorite(dinnerId: string): Promise<FavoriteResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(getApiUrl(`/favorites/${dinnerId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Remove favorite error:', error);
      return { success: false, error: error.message || 'Failed to remove favorite' };
    }
  }

  async getFavorites(page: number = 1, limit: number = 20): Promise<{ success: boolean; data?: Dinner[]; pagination?: any; error?: string }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(getApiUrl(`/favorites?page=${page}&limit=${limit}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Get favorites error:', error);
      return { success: false, error: error.message || 'Failed to fetch favorites' };
    }
  }

  async checkFavorite(dinnerId: string): Promise<{ success: boolean; data?: { isFavorited: boolean }; error?: string }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, data: { isFavorited: false } };
      }

      const response = await fetch(getApiUrl(`/favorites/${dinnerId}/check`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Check favorite error:', error);
      return { success: false, data: { isFavorited: false } };
    }
  }
}

export const favoriteService = new FavoriteService();

