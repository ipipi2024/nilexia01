"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/app/lib/auth-client";
import PushNotificationBell from "@/app/components/PushNotificationBell";
import AppHeader from "@/app/components/layout/AppHeader";
import PageContainer from "@/app/components/layout/PageContainer";
import Badge from "@/app/components/ui/Badge";
import Alert from "@/app/components/ui/Alert";
import EmptyState from "@/app/components/ui/EmptyState";
import LoadingState from "@/app/components/ui/LoadingState";

interface Conversation {
  conversationId: string;
  otherUser: { id: string; name: string; email: string };
  lastMessage: { content: string; timestamp: string; senderId: string };
  unreadCount: number;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now  = new Date();
  const diffMins  = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins  <  1) return "Just now";
  if (diffMins  < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays  <  7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ConversationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!isPending && !session) { router.push("/login"); return; }
    if (session) fetchConversations();
  }, [session, isPending]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load conversations");
      }
    } catch {
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) return (
    <>
      <AppHeader />
      <LoadingState />
    </>
  );

  if (!session) return null;

  return (
    <>
      <AppHeader />
      <PageContainer size="medium">
        {/* Page heading */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>Messages</h1>
            <p className="text-muted" style={{ marginTop: "2px" }}>Your conversations</p>
          </div>
          <PushNotificationBell />
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        {conversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No conversations yet"
            description="Start a conversation by messaging a seller from their listing."
            action={{ label: "Browse Listings", href: "/" }}
          />
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => {
              const isFromMe = conversation.lastMessage.senderId === session.user.id;
              return (
                <Link
                  key={conversation.conversationId}
                  href={`/messages/${conversation.otherUser.id}`}
                  className={`conversation-item ${conversation.unreadCount > 0 ? "conversation-item--unread" : ""}`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: conversation.unreadCount > 0 ? 700 : 600, fontSize: "15px", color: "var(--c-gray-900)" }}>
                          {conversation.otherUser.name}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge count={conversation.unreadCount} />
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: conversation.unreadCount > 0 ? "var(--c-gray-700)" : "var(--c-gray-500)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                        }}
                      >
                        {isFromMe && <span style={{ color: "var(--c-gray-400)" }}>You: </span>}
                        {conversation.lastMessage.content.length > 55
                          ? conversation.lastMessage.content.slice(0, 55) + "…"
                          : conversation.lastMessage.content}
                      </p>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--c-gray-400)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {formatTimestamp(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </>
  );
}
