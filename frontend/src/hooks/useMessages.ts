import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageApi } from "@/lib/api/endpoints";
import { useMessageStore } from "@/store/messageStore";
import { Conversation, Message } from "@/types";

export const useConversations = () => {
  const { conversations, setConversations } = useMessageStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messageApi.getConversations();
      return response.data.data as Conversation[];
    },
  });

  useEffect(() => {
    if (data) {
      setConversations(data);
    }
  }, [data, setConversations]);

  return {
    conversations,
    isLoading,
    error,
  };
};

export const useConversationMessages = (otherUserId?: string) => {
  const queryClient = useQueryClient();
  const { currentMessages, setCurrentMessages } = useMessageStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["messages", otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [] as Message[];
      const response = await messageApi.getMessageHistory(otherUserId);
      return response.data.data as Message[];
    },
    enabled: !!otherUserId,
  });

  useEffect(() => {
    if (data) {
      setCurrentMessages(data);
    }
  }, [data, setCurrentMessages]);

  const markConversationAsReadMutation = useMutation({
    mutationFn: (userId: string) => messageApi.markConversationAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (otherUserId) {
        queryClient.invalidateQueries({ queryKey: ["messages", otherUserId] });
      }
    },
  });

  return {
    messages: currentMessages,
    isLoading,
    error,
    markConversationAsRead: (userId: string) =>
      markConversationAsReadMutation.mutate(userId),
  };
};
