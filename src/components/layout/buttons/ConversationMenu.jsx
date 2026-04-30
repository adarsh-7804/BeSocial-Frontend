import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useConversationActions } from "../../../hooks/useConversationActions";
import {
  fetchConversations,
  fetchArchivedConversations,
} from "../../../features/conversationSlice";

import { IoVolumeMute, IoArchiveOutline } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";

export const ConversationMenu = ({
  conversation,
  onClose,
  position,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    handleMuteConversation,
    handleUnmuteConversation,
    handleArchiveConversation,
    handleUnarchiveConversation,
  } = useConversationActions();

  const isMuted = conversation?.isMutedByUser || false;
  const isArchived = conversation?.isArchivedByUser || false;

  const handleMute = async () => {
    setLoading(true);

    try {
      if (isMuted) {
        await handleUnmuteConversation(conversation._id);
      } else {
        await handleMuteConversation(conversation._id);
      }

      await dispatch(fetchConversations());
      await dispatch(fetchArchivedConversations());

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);

    try {
      if (isArchived) {
        await handleUnarchiveConversation(conversation._id);
      } else {
        await handleArchiveConversation(conversation._id);
      }

      await dispatch(fetchConversations());
      await dispatch(fetchArchivedConversations());

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="absolute bg-white border border-[#ddd] rounded-lg shadow-xl p-1 z-50"
      style={{
        top: position?.y,
        left: position?.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleMute}
        disabled={loading}
        className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f0f4ff]"
      >
        {isMuted ? (
          <span className="flex gap-3 items-center">
            <GoUnmute /> Unmute
          </span>
        ) : (
          <span className="flex gap-3 items-center">
            <IoVolumeMute /> Mute
          </span>
        )}
      </button>

      <button
        onClick={handleArchive}
        disabled={loading}
        className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f0f4ff]"
      >
        <span className="flex gap-3 items-center">
          <IoArchiveOutline />
          {isArchived ? "Unarchive" : "Archive"}
        </span>
      </button>
    </div>
  );
};