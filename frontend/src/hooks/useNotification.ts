import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appNotificationApi } from '@/lib/api/endpoints';
import { useAppNotificationStore } from '@/store/notificationsStore';

export const useAppNotifications = (params?: { page?: number; limit?: number }) => {
  const queryClient = useQueryClient();
  const { setAppNotifications, setUnreadCount } = useAppNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['AppNotifications', params],
    queryFn: async () => {
      const response = await appNotificationApi.getNotifications(params);
      const data = response.data.data;
      if (data) {
        setAppNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount);
      }
      return data;
    },
  });

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const response = await appNotificationApi.getUnreadCount();
      const count = response.data.data?.count || 0;
      setUnreadCount(count);
      return count;
    },
    refetchInterval: 30000, 
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => appNotificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AppNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => appNotificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AppNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const deleteAppNotificationMutation = useMutation({
    mutationFn: (id: string) => appNotificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AppNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: () => appNotificationApi.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AppNotifications'] });
    },
  });

  return {
    AppNotifications: data?.notifications || [],
    unreadCount: unreadData || data?.unreadCount || 0,
    pagination: data?.pagination,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteAppNotification: deleteAppNotificationMutation.mutate,
    deleteAllRead: deleteAllReadMutation.mutate,
  };
};