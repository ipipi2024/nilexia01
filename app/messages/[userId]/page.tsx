"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/app/lib/auth-client";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  readStatus: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserId = params.userId as string;

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session) {
      loadMessages();
      markMessagesAsRead();
      fetchOtherUserInfo();
    }
  }, [session, isPending, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchOtherUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${otherUserId}`);
      if (response.ok) {
        const data = await response.json();
        setOtherUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?userId=${otherUserId}`);

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const conversationId = [session?.user.id, otherUserId].sort().join('_');
      await fetch("/api/messages/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await loadMessages();
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (isPending || loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "20px auto", padding: "15px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "15px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{
        marginBottom: "20px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px"
      }}>
        <Link href="/messages" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to conversations
        </Link>
        {otherUser && <h2 style={{ margin: 0, fontSize: "clamp(18px, 4vw, 24px)" }}>Chat with {otherUser.name}</h2>}
      </div>

      {error && (
        <div style={{ padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        marginBottom: "20px"
      }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user.id;
            return (
              <div
                key={message._id}
                style={{
                  display: "flex",
                  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                  marginBottom: "15px"
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 15px",
                    borderRadius: "12px",
                    backgroundColor: isCurrentUser ? "#007bff" : "#e9ecef",
                    color: isCurrentUser ? "white" : "black",
                  }}
                >
                  <p style={{ margin: "0 0 5px 0", wordWrap: "break-word" }}>
                    {message.content}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: "11px",
                    opacity: 0.7,
                    textAlign: "right"
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={1000}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px"
          }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          style={{
            padding: "12px 24px",
            backgroundColor: sending || !newMessage.trim() ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
