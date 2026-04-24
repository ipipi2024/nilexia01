"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/app/lib/auth-client";
import Alert from "@/app/components/ui/Alert";
import Button from "@/app/components/ui/Button";

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
  const [messages, setMessages]   = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserId = params.userId as string;

  useEffect(() => {
    if (!isPending && !session) { router.push("/login"); return; }
    if (session) {
      loadMessages();
      markMessagesAsRead();
      fetchOtherUserInfo();
    }
  }, [session, isPending, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchOtherUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${otherUserId}`);
      if (response.ok) setOtherUser(await response.json());
    } catch {
      console.error("Failed to fetch user info");
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
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const conversationId = [session?.user.id, otherUserId].sort().join("_");
      await fetch("/api/messages/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch {
      console.error("Failed to mark messages as read");
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
        body: JSON.stringify({ receiverId: otherUserId, content: newMessage.trim() }),
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
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      {/* Chat header */}
      <div className="chat-header">
        <Link href="/messages" className="back-link" style={{ margin: 0 }}>
          ← Back
        </Link>
        {otherUser && (
          <h2 style={{ fontSize: "16px", fontWeight: 600, flex: 1, textAlign: "center", margin: 0 }}>
            {otherUser.name}
          </h2>
        )}
        {/* spacer to keep title centered */}
        <div style={{ width: "60px" }} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ padding: "8px 20px", background: "var(--c-danger-100)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages-area">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, gap: "10px", color: "var(--c-gray-500)", fontSize: "14px" }}>
            <span className="spinner" />
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--c-gray-400)", fontSize: "14px", marginTop: "40px" }}>
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === session?.user.id;
            return (
              <div
                key={message._id}
                className={`chat-bubble-row ${isMine ? "chat-bubble-row--sent" : "chat-bubble-row--received"}`}
              >
                <div className={`chat-bubble ${isMine ? "chat-bubble--sent" : "chat-bubble--received"}`}>
                  <div>{message.content}</div>
                  <div className="chat-bubble__time">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px", flex: 1 }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            maxLength={1000}
            className="form-input"
            style={{ flex: 1 }}
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            loading={sending}
            variant="primary"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
