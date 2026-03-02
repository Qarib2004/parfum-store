'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useMessages';
import { Conversation } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { formatRelativeDate } from '@/lib/utils';
import { MessageSquare, User } from 'lucide-react';
import style from './messages-page.module.scss';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { conversations, isLoading } = useConversations();
  const { onlineUsers } = useSocket();

  if (!user) {
    return (
      <div className={style.statePage}>
        <p className={style.stateText}>Please log in to view your messages.</p>
      </div>
    );
  }

  const sortedConversations: Conversation[] = [...conversations].sort((a, b) =>
    b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt)
  );

  return (
    <div className={style.page}>

      <div className={style.header}>
        <h1 className={style.headerTitle}>Messages</h1>
        <p className={style.headerSub}>Chat with buyers and sellers</p>
      </div>

      {isLoading ? (
        <div className={style.list}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={style.skeleton} />
          ))}
        </div>
      ) : sortedConversations.length === 0 ? (
        <div className={style.empty}>
          <div className={style.emptyIcon}>
            <MessageSquare size={24} />
          </div>
          <h3 className={style.emptyTitle}>No conversations yet</h3>
          <p className={style.emptyDesc}>
            You can start a conversation from a product page or seller profile.
          </p>
        </div>
      ) : (
        <ul className={style.list}>
          {sortedConversations.map((conv) => {
            const isOnline = onlineUsers.includes(conv.user.id);
            const last = conv.lastMessage;
            const isUnread = !last.read && last.senderId !== user.id;

            return (
              <li
                key={conv.user.id}
                className={`${style.item} ${isUnread ? style.itemUnread : ''}`}
                onClick={() => router.push(`/dashboard/messages/${conv.user.id}`)}
              >
                <div className={style.avatarWrap}>
                  {conv.user.avatar ? (
                    <img className={style.avatarImg} src={conv.user.avatar} alt={conv.user.username} />
                  ) : (
                    <div className={style.avatarFallback}>
                      <User size={16} />
                    </div>
                  )}
                  {isOnline && <span className={style.onlineDot} />}
                </div>
                <div className={style.body}>
                  <div className={style.rowTop}>
                    <p className={style.name}>{conv.user.username}</p>
                    <span className={style.date}>{formatRelativeDate(last.createdAt)}</span>
                  </div>
                  <div className={style.rowBottom}>
                    <p className={style.preview}>
                      {last.senderId === user.id ? 'You: ' : ''}{last.content}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className={style.badge}>{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}

