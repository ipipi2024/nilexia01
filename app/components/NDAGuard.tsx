"use client";

import { useSession } from "@/app/lib/auth-client";
import { useState, useEffect } from "react";
import NDAModal from "./NDAModal";

export default function NDAGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [isCheckingNDA, setIsCheckingNDA] = useState(false);

  useEffect(() => {
    // Only check NDA status if user is authenticated and session is loaded
    if (!isPending && session?.user && !isCheckingNDA) {
      checkNDAStatus();
    }
  }, [session, isPending]);

  const checkNDAStatus = async () => {
    setIsCheckingNDA(true);
    try {
      const response = await fetch("/api/user/nda-status");
      if (response.ok) {
        const data = await response.json();
        setShowNDAModal(!data.hasAcceptedNDA);
      }
    } catch (error) {
      console.error("Error checking NDA status:", error);
    } finally {
      setIsCheckingNDA(false);
    }
  };

  const handleAcceptNDA = async () => {
    try {
      const response = await fetch("/api/user/accept-nda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept NDA");
      }

      // Close modal and recheck status
      setShowNDAModal(false);
      await checkNDAStatus();
    } catch (error) {
      console.error("Error accepting NDA:", error);
      throw error;
    }
  };

  return (
    <>
      {children}
      {showNDAModal && <NDAModal onAccept={handleAcceptNDA} />}
    </>
  );
}
