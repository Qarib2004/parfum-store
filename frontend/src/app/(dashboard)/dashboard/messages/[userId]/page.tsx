"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useConversationMessages } from "@/hooks/useMessages";
import { useSocket } from "@/hooks/useSocket";
import { useMessageStore } from "@/store/messageStore";
import { Message } from "@/types";
import { ArrowLeft, Send, User } from "lucide-react";
import style from "./conversation-page.module.scss";

export default function ConversationPage() {
  const params = useParams<{ userId: string }>();
  const otherUserId = params?.userId;
  const { user } = useAuth();
  const { messages, isLoading, markConversationAsRead } =
    useConversationMessages(otherUserId);
  const { typingUsers, addMessage } = useMessageStore();
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const [content, setContent] = useState("");
  const [lastTypedAt, setLastTypedAt] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (otherUserId) {
      markConversationAsRead(otherUserId);
    }
  }, [otherUserId, markConversationAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!otherUserId) return;
    if (content && content.trim().length > 0) {
      startTyping(otherUserId);
      setLastTypedAt(Date.now());
    } else {
      stopTyping(otherUserId);
    }
  }, [content, otherUserId, startTyping, stopTyping]);

  useEffect(() => {
    if (!otherUserId) return;
    if (lastTypedAt === null) return;

    const interval = setInterval(() => {
      if (lastTypedAt && Date.now() - lastTypedAt > 2000) {
        stopTyping(otherUserId);
        setLastTypedAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTypedAt, otherUserId, stopTyping]);

  if (!user) {
    return (
      <div className={style.statePage}>
        <p className={style.stateText}>
          Please log in to view the conversation.
        </p>
      </div>
    );
  }

  const handleSend = () => {
    if (!content.trim() || !otherUserId) return;

    const now = new Date().toISOString();
    const optimisticMessage: Message = {
      id: `temp_${now}`,
      content: content.trim(),
      senderId: user.id,
      sender: user,
      receiverId: otherUserId,
      receiver: user, 
      read: false,
      createdAt: now,
    };

 
    addMessage(optimisticMessage);
    sendMessage(otherUserId, content.trim());
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOtherTyping = otherUserId ? typingUsers.has(otherUserId) : false;

  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === user.id;
    return (
      <div
        key={message.id}
        className={`${style.messageRow} ${isOwn ? style.messageRowOwn : style.messageRowOther}`}
      >
        {!isOwn && (
          <div className={style.messageAvatar}>
            <User size={16} />
          </div>
        )}
        <div className={style.messageBubble}>
          <p className={style.messageText}>{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={style.page}>
      <div className={style.header}>
        <Link href="/dashboard/messages" className={style.backLink}>
          <ArrowLeft size={16} />
          Back to messages
        </Link>
      </div>

      <div className={style.chatCard}>
        <div className={style.messages} ref={scrollRef}>
          {isLoading ? (
            <div className={style.loading}>
              <div className={style.skeleton} />
              <div className={style.skeleton} />
            </div>
          ) : messages.length === 0 ? (
            <div className={style.empty}>
              <p className={style.emptyText}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}

          {isOtherTyping && (
            <div className={style.typingRow}>
              <div className={style.typingBubble}>
                <span className={style.dot} />
                <span className={style.dot} />
                <span className={style.dot} />
              </div>
            </div>
          )}
        </div>

        <div className={style.inputRow}>
          <textarea
            className={style.input}
            rows={2}
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={style.sendBtn}
            type="button"
            onClick={handleSend}
            disabled={!content.trim()}
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
