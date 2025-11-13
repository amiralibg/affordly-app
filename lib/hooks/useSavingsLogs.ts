import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  savingsLogApi,
  CreateSavingsLogData,
  GetSavingsLogsParams,
  GetAnalyticsParams,
} from '../api/savingsLog';

// Query keys
export const savingsLogKeys = {
  all: ['savingsLogs'] as const,
  lists: () => [...savingsLogKeys.all, 'list'] as const,
  list: (params?: GetSavingsLogsParams) => [...savingsLogKeys.lists(), params] as const,
  analytics: (params?: GetAnalyticsParams) => [...savingsLogKeys.all, 'analytics', params] as const,
};

/**
 * Hook to fetch all savings logs
 */
export const useSavingsLogs = (params?: GetSavingsLogsParams) => {
  return useQuery({
    queryKey: savingsLogKeys.list(params),
    queryFn: () => savingsLogApi.getAll(params),
  });
};

/**
 * Hook to fetch savings analytics
 */
export const useSavingsAnalytics = (params?: GetAnalyticsParams) => {
  return useQuery({
    queryKey: savingsLogKeys.analytics(params),
    queryFn: () => savingsLogApi.getAnalytics(params),
  });
};

/**
 * Hook to create a new savings log
 */
export const useCreateSavingsLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavingsLogData) => savingsLogApi.create(data),
    onSuccess: () => {
      // Invalidate all savings logs and analytics queries
      void queryClient.invalidateQueries({ queryKey: savingsLogKeys.all });
    },
  });
};

/**
 * Hook to delete a savings log
 */
export const useDeleteSavingsLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savingsLogApi.delete(id),
    onSuccess: () => {
      // Invalidate all savings logs and analytics queries
      void queryClient.invalidateQueries({ queryKey: savingsLogKeys.all });
    },
  });
};
