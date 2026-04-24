"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/app/lib/auth-client";
import Button from "@/app/components/ui/Button";

interface MessageButtonProps {
  userId:   string;
  userName: string;
}

export default function MessageButton({ userId, userName }: MessageButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleClick = () => {
    if (!session) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/messages/${userId}`)}`);
    } else {
      router.push(`/messages/${userId}`);
    }
  };

  return (
    <Button onClick={handleClick} variant="primary">
      Message {userName}
    </Button>
  );
}
