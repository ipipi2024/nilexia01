"use client";

import { useState } from "react";
import Button from "@/app/components/ui/Button";

interface TermsModalProps {
  onAccept: () => Promise<void>;
}

export default function TermsModal({ onAccept }: TermsModalProps) {
  const [hasScrolled, setHasScrolled]   = useState(false);
  const [isAgreed, setIsAgreed]         = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) setHasScrolled(true);
  };

  const handleAccept = async () => {
    if (!isAgreed) return;
    setIsSubmitting(true);
    try {
      await onAccept();
    } catch {
      alert("Failed to accept Terms and Conditions. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--r-xl)",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid var(--c-gray-200)",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
            Terms and Conditions
          </h2>
          <p style={{ fontSize: "13px", color: "var(--c-gray-500)" }}>
            Please read and accept to continue using the app
          </p>
        </div>

        {/* Scrollable content */}
        <div
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            fontSize: "14px",
            lineHeight: "1.65",
            color: "var(--c-gray-700)",
          }}
        >
          {[
            {
              title: "1. Purpose and Scope",
              body: 'These Terms and Conditions govern your use of this marketplace application ("App"). By using the App, you agree to maintain the confidentiality of all information, content, and communications within the App.',
            },
            {
              title: "2. Confidential Information",
              body: null,
              list: [
                "All marketplace listings, including item descriptions, prices, and images",
                "Private messages and communications between users",
                "User profiles, contact information, and personal details",
                "Transaction history and pricing information",
                "Any other content, data, or information accessible within the App",
              ],
              preamble: '"Confidential Information" includes, but is not limited to:',
            },
            {
              title: "3. Non-Disclosure Obligations",
              body: null,
              preamble: "You agree to:",
              list: [
                "Keep all Confidential Information strictly confidential and not disclose it to any third party",
                "Not share any content from the App with individuals who do not have a Florida Institute of Technology email address (@fit.edu or @my.fit.edu)",
                "Not screenshot, record, copy, or reproduce any content from the App for distribution outside the Florida Tech community",
                "Use Confidential Information solely for the purpose of engaging in transactions and communications within the App",
                "Immediately report any unauthorized disclosure or suspected breach of these Terms and Conditions",
              ],
            },
            {
              title: "4. Permitted Disclosures",
              body: "You may only share Confidential Information with other verified members of the Florida Tech community who have access to the App and have accepted these Terms and Conditions.",
            },
            {
              title: "5. Consequences of Breach",
              preamble: "You understand that unauthorized disclosure of Confidential Information may result in:",
              list: [
                "Immediate termination of your App access",
                "Potential disciplinary action through Florida Tech's student conduct process",
                "Legal liability for damages caused by the breach",
              ],
            },
            {
              title: "6. Duration",
              body: "These Terms and Conditions remain in effect for as long as you have access to the App and for a period of two (2) years after your access is terminated or you graduate/leave Florida Tech.",
            },
            {
              title: "7. Acknowledgment",
              body: 'By clicking "I Agree" below, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. You understand that this is a legally binding agreement and that violation of its terms may result in serious consequences.',
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--c-gray-800)" }}>
                {section.title}
              </h3>
              {section.preamble && <p style={{ marginBottom: "8px" }}>{section.preamble}</p>}
              {section.body && <p>{section.body}</p>}
              {section.list && (
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {section.list.map((item, j) => (
                    <li key={j} style={{ marginBottom: "6px" }}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div
            style={{
              marginTop: "24px",
              padding: "14px 16px",
              background: "var(--c-primary-50)",
              borderRadius: "var(--r)",
              border: "1px solid var(--c-primary-100)",
              fontSize: "13px",
              color: "var(--c-gray-700)",
            }}
          >
            <strong>Florida Tech Community Only:</strong> This App is exclusively for members of the
            Florida Institute of Technology community. All content must remain within the community
            and must not be shared with anyone without a valid Florida Tech email address.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px 28px",
            borderTop: "1px solid var(--c-gray-200)",
            background: "var(--c-gray-50)",
            borderRadius: "0 0 var(--r-xl) var(--r-xl)",
          }}
        >
          {!hasScrolled && (
            <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "var(--c-danger)", textAlign: "center", fontWeight: 500 }}>
              Please scroll to the bottom to continue
            </p>
          )}

          <label
            className="form-checkbox-row"
            style={{
              marginBottom: "16px",
              opacity: hasScrolled ? 1 : 0.4,
              cursor: hasScrolled ? "pointer" : "not-allowed",
            }}
          >
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              disabled={!hasScrolled}
            />
            I have read and agree to the Terms and Conditions
          </label>

          <Button
            onClick={handleAccept}
            disabled={!isAgreed}
            loading={isSubmitting}
            size="lg"
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Processing…" : "I Agree — Continue to App"}
          </Button>
        </div>
      </div>
    </div>
  );
}
