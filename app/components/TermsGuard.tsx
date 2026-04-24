"use client";

import { useSession } from "@/app/lib/auth-client";
import { useState, useEffect } from "react";
import TermsModal from "./TermsModal";

export default function TermsGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isCheckingTerms, setIsCheckingTerms] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user && !isCheckingTerms) {
      checkTermsStatus();
    }
  }, [session, isPending]);

  const checkTermsStatus = async () => {
    setIsCheckingTerms(true);
    try {
      const response = await fetch("/api/user/terms-status");
      if (response.ok) {
        const data = await response.json();
        setShowTermsModal(!data.hasAcceptedTerms);
      }
    } catch (error) {
      console.error("Error checking Terms and Conditions status:", error);
    } finally {
      setIsCheckingTerms(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const response = await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept Terms and Conditions");
      }

      setShowTermsModal(false);
      await checkTermsStatus();
    } catch (error) {
      console.error("Error accepting Terms and Conditions:", error);
      throw error;
    }
  };

  return (
    <>
      {children}
      {showTermsModal && <TermsModal onAccept={handleAcceptTerms} />}
    </>
  );
}
