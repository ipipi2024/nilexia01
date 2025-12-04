"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/app/lib/auth-client";

interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function ConversationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session) {
      fetchConversations();
    }
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
    } catch (err) {
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isPending || loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Messages</h1>
        <Link href="/dashboard" style={{
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px"
        }}>
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div style={{ padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px"
        }}>
          <h3 style={{ color: "#666", marginBottom: "10px" }}>No conversations yet</h3>
          <p style={{ color: "#999" }}>
            Start messaging other users from their listings or profiles
          </p>
          <Link href="/listings" style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px"
          }}>
            Browse Listings
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
          {conversations.map((conversation) => {
            const isLastMessageFromMe = conversation.lastMessage.senderId === session?.user.id;

            return (
              <Link
                key={conversation.conversationId}
                href={`/messages/${conversation.otherUser.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    padding: "20px",
                    borderBottom: "1px solid #ddd",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: "white",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <h3 style={{ margin: 0, fontSize: "18px" }}>
                          {conversation.otherUser.name}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{
                        margin: "5px 0 0 0",
                        color: "#666",
                        fontSize: "14px"
                      }}>
                        {isLastMessageFromMe && (
                          <span style={{ fontWeight: "500" }}>You: </span>
                        )}
                        {truncateMessage(conversation.lastMessage.content)}
                      </p>
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#999",
                      whiteSpace: "nowrap",
                      marginLeft: "15px"
                    }}>
                      {formatTimestamp(conversation.lastMessage.timestamp)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
