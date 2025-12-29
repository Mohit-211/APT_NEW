import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  FileText,
  Download as DownloadIcon,
  Loader2,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Url } from "@/utils/constants/host";
import "./Download.scss";

// ============================================
// TYPES
// ============================================

interface ProposalData {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  proposal_type?: string;
}

// ============================================
// COMPONENT
// ============================================

const Download: React.FC = () => {
  const location = useLocation();
  const state = location.state as { data?: ProposalData };
  const data = state?.data;

  const [loading, setLoading] = useState(true);
  const [docSource, setDocSource] = useState("");
  const [iframeError, setIframeError] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("UserLoginTokenApt")
      : null;
  const userStatus =
    typeof window !== "undefined" ? localStorage.getItem("UserStatus") : null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Build document URL
  useEffect(() => {
    if (!data) return;

    const fileUrl = `${Url}${data.file_type}/${data.file_name}`;

    // Simulate slight load time for smooth transition
    const timer = setTimeout(() => {
      setDocSource(fileUrl);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [data]);

  // Redirect if no data
  if (!data) {
    return <Navigate to="/proposals" replace />;
  }

  // Handle download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = docSource;
    link.download = data.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(docSource, "_blank");
  };

  // Go back
  const handleGoBack = () => {
    window.history.back();
  };

  // Get file extension
  const getFileExtension = () => {
    return data.file_name.split(".").pop()?.toUpperCase() || "FILE";
  };

  // Unauthenticated state
  if (!token) {
    return (
      <div className="download-page">
        <div className="auth-required">
          <div className="auth-required__icon">
            <FileText size={48} />
          </div>
          <h2 className="auth-required__title">Sign In Required</h2>
          <p className="auth-required__message">
            Please sign in to view this document.
          </p>
          <a href="/signin" className="btn btn--primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="download-page">
      {/* Page Header */}
      <header className="download-header">
        <button className="back-button" onClick={handleGoBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="download-header__content">
          <div className="download-header__icon">
            <FileText size={24} />
          </div>
          <div className="download-header__info">
            <span className="download-header__badge">{getFileExtension()}</span>
            <h1 className="download-header__title">{data.title}</h1>
            <p className="download-header__filename">{data.file_name}</p>
          </div>
        </div>

        <div className="download-header__actions">
          {userStatus === "ACTIVATE" && (
            <>
              <button
                className="btn btn--secondary"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink size={18} />
                Open
              </button>
              <button className="btn btn--primary" onClick={handleDownload}>
                <DownloadIcon size={18} />
                Download
              </button>
            </>
          )}
        </div>
      </header>

      {/* Document Viewer */}
      <div className="viewer-container">
        {loading ? (
          <div className="viewer-loading">
            <div className="viewer-loading__spinner">
              <Loader2 size={40} />
            </div>
            <p className="viewer-loading__text">Loading document...</p>
            <p className="viewer-loading__hint">This may take a moment</p>
          </div>
        ) : (
          <div className="viewer-wrapper">
            {iframeError ? (
              <div className="viewer-error">
                <AlertCircle size={48} />
                <h3 className="viewer-error__title">Unable to Preview</h3>
                <p className="viewer-error__message">
                  The document preview is not available. You can still download
                  the file.
                </p>
                <div className="viewer-error__actions">
                  <button className="btn btn--primary" onClick={handleDownload}>
                    <DownloadIcon size={18} />
                    Download File
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  docSource
                )}&embedded=true`}
                title={data.title}
                className="viewer-iframe"
                onLoad={() => setLoading(false)}
                onError={() => setIframeError(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Actions (Mobile) */}
      {userStatus === "ACTIVATE" && !loading && (
        <div className="download-footer">
          <button
            className="btn btn--primary btn--full"
            onClick={handleDownload}
          >
            <DownloadIcon size={18} />
            Download Document
          </button>
        </div>
      )}
    </div>
  );
};

export default Download;
