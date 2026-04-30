import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchConversations } from '../features/conversationSlice';
import {
  muteConversation,
  unmuteConversation,
  archiveConversation,
  unarchiveConversation,
} from '../api/conversationApi';

export const useConversationActions = () => {
  const dispatch = useDispatch();

  const handleMuteConversation = useCallback(
    async (conversationId) => {
      try {
        await muteConversation(conversationId);
        dispatch(fetchConversations());
      } catch (error) {
        console.error("Error muting:", error.response?.data?.message || error.message);
      }
    },
    [dispatch]
  );

  const handleUnmuteConversation = useCallback(
    async (conversationId) => {
      try {
        await unmuteConversation(conversationId);
        dispatch(fetchConversations());
      } catch (error) {
        console.error("Error unmuting:", error.response?.data?.message || error.message);
      }
    },
    [dispatch]
  );

  const handleArchiveConversation = useCallback(
    async (conversationId) => {
      try {
        await archiveConversation(conversationId);
        dispatch(fetchConversations());
      } catch (error) {
        console.error("Error archiving:", error.response?.data?.message || error.message);
      }
    },
    [dispatch]
  );

  const handleUnarchiveConversation = useCallback(
    async (conversationId) => {
      try {
        await unarchiveConversation(conversationId);
        dispatch(fetchConversations());
      } catch (error) {
        console.error("Error unarchiving:", error.response?.data?.message || error.message);
      }
    },
    [dispatch]
  );

  return {
    handleMuteConversation,
    handleUnmuteConversation,
    handleArchiveConversation,
    handleUnarchiveConversation,
  };
};