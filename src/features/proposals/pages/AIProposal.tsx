import React, { useEffect, useState } from "react";
import ChatLayout from "@/features/chat/ChatLayout";
import ProductTour from "@/features/chat/components/ProductTour/ProductTour";

const TOUR_KEY = "ai_proposal_product_tour_seen";

const AIProposal: React.FC = () => {
  const [loading] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("UserLoginTokenApt")
      : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    if (typeof window === "undefined") return;

    // ✅ Check if tour already shown
    const hasSeenTour = localStorage.getItem(TOUR_KEY);

    if (!hasSeenTour) {
      // ⏳ wait for ChatLayout to render
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourFinish = () => {
    setShowTour(false);
    localStorage.setItem(TOUR_KEY, "true"); // ✅ mark as seen
  };

  if (!token) {
    return (
      <div className="unauthenticated-container">
        <div className="unauthenticated-content">
          <div className="icon-wrapper">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <h1>Authentication Required</h1>
          <p>Please sign in to access the AI Proposal Generator.</p>
          <button
            className="signin-button"
            onClick={() => (window.location.href = "/signin")}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-proposal-page">
      {/* 🔹 Main Chat UI */}
      <ChatLayout />

      {/* 🔹 Product Tour (FIRST TIME ONLY) */}
      {showTour && <ProductTour onFinish={handleTourFinish} />}

      {/* 🔹 Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner">
              <div className="spinner-ring" />
              <div className="spinner-ring" />
              <div className="spinner-ring" />
            </div>
            <p className="loading-text">Generating proposal...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIProposal;
