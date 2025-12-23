"use client";

import { useState } from "react";

interface NDAModalProps {
  onAccept: () => Promise<void>;
}

export default function NDAModal({ onAccept }: NDAModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    if (!isAgreed) return;
    setIsSubmitting(true);
    try {
      await onAccept();
    } catch (error) {
      console.error("Error accepting NDA:", error);
      alert("Failed to accept NDA. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            Non-Disclosure Agreement
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
            Please read and accept to continue using the app
          </p>
        </div>

        {/* Scrollable Content */}
        <div
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              1. Purpose and Scope
            </h3>
            <p style={{ margin: 0, color: "#374151" }}>
              This Non-Disclosure Agreement ("NDA") governs your use of this marketplace
              application ("App"). By using the App, you agree to maintain the confidentiality
              of all information, content, and communications within the App.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              2. Confidential Information
            </h3>
            <p style={{ margin: 0, color: "#374151" }}>
              "Confidential Information" includes, but is not limited to:
            </p>
            <ul style={{ marginTop: "8px", paddingLeft: "20px", color: "#374151" }}>
              <li>All marketplace listings, including item descriptions, prices, and images</li>
              <li>Private messages and communications between users</li>
              <li>User profiles, contact information, and personal details</li>
              <li>Transaction history and pricing information</li>
              <li>Any other content, data, or information accessible within the App</li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              3. Non-Disclosure Obligations
            </h3>
            <p style={{ margin: "0 0 12px 0", color: "#374151" }}>
              You agree to:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151" }}>
              <li style={{ marginBottom: "8px" }}>
                Keep all Confidential Information strictly confidential and not disclose it to
                any third party
              </li>
              <li style={{ marginBottom: "8px" }}>
                Not share any content from the App with individuals who do not have a Florida
                Institute of Technology email address (@fit.edu or @my.fit.edu)
              </li>
              <li style={{ marginBottom: "8px" }}>
                Not screenshot, record, copy, or reproduce any content from the App for
                distribution outside the Florida Tech community
              </li>
              <li style={{ marginBottom: "8px" }}>
                Use Confidential Information solely for the purpose of engaging in transactions
                and communications within the App
              </li>
              <li style={{ marginBottom: "8px" }}>
                Immediately report any unauthorized disclosure or suspected breach of this NDA
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              4. Permitted Disclosures
            </h3>
            <p style={{ margin: 0, color: "#374151" }}>
              You may only share Confidential Information with other verified members of the
              Florida Tech community who have access to the App and have accepted this NDA.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              5. Consequences of Breach
            </h3>
            <p style={{ margin: 0, color: "#374151" }}>
              You understand that unauthorized disclosure of Confidential Information may result
              in:
            </p>
            <ul style={{ marginTop: "8px", paddingLeft: "20px", color: "#374151" }}>
              <li>Immediate termination of your App access</li>
              <li>Potential disciplinary action through Florida Tech's student conduct process</li>
              <li>Legal liability for damages caused by the breach</li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              6. Duration
            </h3>
            <p style={{ margin: 0, color: "#374151" }}>
              This NDA remains in effect for as long as you have access to the App and for a
              period of two (2) years after your access is terminated or you graduate/leave
              Florida Tech.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              7. Acknowledgment
            </h3>
            <p style={{ margin: 0, color: "#374151" }}>
              By clicking "I Agree" below, you acknowledge that you have read, understood, and
              agree to be bound by the terms of this Non-Disclosure Agreement. You understand
              that this is a legally binding agreement and that violation of its terms may result
              in serious consequences.
            </p>
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            <strong>Florida Tech Community Only:</strong> This App is exclusively for members of
            the Florida Institute of Technology community. All content must remain within the
            community and must not be shared with anyone without a valid Florida Tech email
            address.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "24px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {!hasScrolled && (
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "13px",
                color: "#ef4444",
                textAlign: "center",
              }}
            >
              Please scroll to the bottom to continue
            </p>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: hasScrolled ? "pointer" : "not-allowed",
                opacity: hasScrolled ? 1 : 0.5,
              }}
            >
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                disabled={!hasScrolled}
                style={{
                  marginRight: "8px",
                  width: "18px",
                  height: "18px",
                  cursor: hasScrolled ? "pointer" : "not-allowed",
                }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                I have read and agree to the terms of this Non-Disclosure Agreement
              </span>
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!isAgreed || isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isAgreed && !isSubmitting ? "#007bff" : "#cbd5e1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isAgreed && !isSubmitting ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Processing..." : "I Agree - Continue to App"}
          </button>
        </div>
      </div>
    </div>
  );
}
