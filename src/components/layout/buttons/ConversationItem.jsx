import React, { useState } from 'react';
import { ConversationMenu } from './ConversationMenu';

export const ConversationItem = ({ conversation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMuted = conversation?.isMutedByUser || false;

  const participantName =
    conversation.groupName ||
    conversation.participants
      ?.filter((p) => p._id !== localStorage.getItem('userId'))
      ?.map((p) => p.firstName)
      ?.join(', ') ||
    'Unknown';

  return (
    <div className="conversation-item">
      <div className="conversation-header">
        <div className="conversation-info">
          {isMuted && <span className="mute-badge" title="Muted"><IoVolumeMute /></span>}
          <h3>{participantName}</h3>
        </div>

        <div className="conversation-menu-btn">
          <button
            className="menu-trigger"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>

          {showMenu && (
            <ConversationMenu
              conversation={conversation}
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>

      <div className="conversation-preview">
        <p>
          {conversation.lastMessage?.text || 'No messages yet'}
        </p>
      </div>
    </div>
  );
};