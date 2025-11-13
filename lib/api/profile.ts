import apiClient from './client';

export interface Profile {
  _id: string;
  userId: string;
  monthlySalary: number;
  monthlySavingsPercentage: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  monthlySalary?: number;
  monthlySavingsPercentage?: number;
  currency?: string;
}

export const profileApi = {
  get: async (): Promise<Profile> => {
    const response = await apiClient.get<{ profile: Profile }>('/profile');
    return response.data.profile;
  },

  update: async (data: UpdateProfileData): Promise<Profile> => {
    const response = await apiClient.put<{ profile: Profile }>('/profile', data);
    return response.data.profile;
  },
};
