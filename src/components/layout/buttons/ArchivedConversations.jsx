import React, { useEffect, useState } from 'react';
import { getArchivedConversations } from '../../../api/conversationApi';
import { useConversationActions } from '../../../hooks/useConversationActions';

export const ArchivedConversations = () => {
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleUnarchiveConversation } = useConversationActions();

  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    try {
      const response = await getArchivedConversations();
      setArchived(response.data);
    } catch (error) {
      console.error("Error fetching archived:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (conversationId) => {
    try {
      await handleUnarchiveConversation(conversationId);
      setArchived(archived.filter((c) => c._id !== conversationId));
    } catch (error) {
      console.error("Error unarchiving:", error);
    }
  };

  if (loading) return <div>Loading archived conversations...</div>;

  if (archived.length === 0) {
    return <div className="empty-state">No archived conversations</div>;
  }

  return (
    <div className="archived-section">
      <h2>Archived Conversations ({archived.length})</h2>
      <div className="archived-list">
        {archived.map((conv) => (
          <div key={conv._id} className="archived-item">
            <div className="archived-info">
              <h4>
                {conv.groupName ||
                  conv.participants
                    ?.map((p) => p.firstName)
                    ?.join(', ')}
              </h4>
              <p>{conv.lastMessage?.text || 'No messages'}</p>
            </div>

            <button
              onClick={() => handleUnarchive(conv._id)}
              className="unarchive-btn"
            >
              Unarchive
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};