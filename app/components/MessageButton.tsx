"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/app/lib/auth-client";

interface MessageButtonProps {
  userId: string;
  userName: string;
}

export default function MessageButton({ userId, userName }: MessageButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleClick = () => {
    if (!session) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/messages/${userId}`);
      router.push(`/login?returnUrl=${returnUrl}`);
    } else {
      router.push(`/messages/${userId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "500",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
    >
      Message {userName}
    </button>
  );
}
