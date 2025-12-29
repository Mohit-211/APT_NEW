import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Edit3,
  Trash2,
  AlertCircle,
  Check,
  Loader2,
  FolderOpen,
  Clock,
} from "lucide-react";
import { GetDraftCalculationApi, deleteDraft } from "@/utils/api/Api";
import NoDataImg from "@/assets/nodata.png";
import "./Draft.scss";

// ============================================
// TYPES
// ============================================

interface DraftItem {
  id: number;
  draft_name: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface Toast {
  show: boolean;
  message: string;
  type: "success" | "error" | "loading";
}

interface DeleteConfirm {
  show: boolean;
  id: number | null;
  name: string;
}

// ============================================
// COMPONENT
// ============================================

const Draft: React.FC = () => {
  const [data, setData] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [toast, setToast] = useState<Toast>({
    show: false,
    message: "",
    type: "success",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>({
    show: false,
    id: null,
    name: "",
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navigate = useNavigate();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("UserLoginTokenApt")
      : null;

  // Fetch drafts
  useEffect(() => {
    if (!token) return;

    GetDraftCalculationApi()
      .then((res) => {
        const list = res?.data?.data || [];
        setData(list);
        setEmpty(list.length === 0);
      })
      .catch((error) => {
        console.error(error);
        setEmpty(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Auto-hide toast
  useEffect(() => {
    if (toast.show && toast.type !== "loading") {
      const timer = setTimeout(
        () => setToast((prev) => ({ ...prev, show: false })),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show toast helper
  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ show: true, message, type });
  };

  // Handle edit
  const handleEdit = (item: DraftItem) => {
    showToast("Loading draft...", "loading");
    setTimeout(() => {
      navigate(
        `/create/leadership-workshop-proposal/${item.id}?s=${item.draft_name}`,
        {
          state: item,
        }
      );
      localStorage.removeItem("Calculation");
    }, 500);
  };

  // Show delete confirmation
  const confirmDelete = (item: DraftItem) => {
    setDeleteConfirm({
      show: true,
      id: item.id,
      name: item.draft_name || "Untitled Draft",
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    setDeletingId(deleteConfirm.id);
    setDeleteConfirm({ show: false, id: null, name: "" });

    try {
      await deleteDraft(deleteConfirm.id);
      showToast("Draft deleted successfully", "success");
      setData((prev) => {
        const newData = prev.filter((d) => d.id !== deleteConfirm.id);
        if (newData.length === 0) setEmpty(true);
        return newData;
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to delete draft", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null, name: "" });
  };

  // Unauthenticated state
  if (!token) {
    return (
      <div className="draft-page">
        <div className="auth-required">
          <div className="auth-required__icon">
            <FileText size={48} />
          </div>
          <h2 className="auth-required__title">Sign In Required</h2>
          <p className="auth-required__message">
            Please sign in to view your drafts.
          </p>
          <a href="/signin" className="btn btn--primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="draft-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast--${toast.type}`}>
          {toast.type === "success" && <Check size={18} />}
          {toast.type === "error" && <AlertCircle size={18} />}
          {toast.type === "loading" && (
            <Loader2 size={18} className="toast__spinner" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-backdrop" onClick={cancelDelete}>
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header modal__header--danger">
              <Trash2 size={24} />
              <h3 className="modal__title">Delete Draft</h3>
            </div>
            <div className="modal__body">
              <p className="modal__message">
                Are you sure you want to delete{" "}
                <strong>"{deleteConfirm.name}"</strong>?
              </p>
              <p className="modal__warning">This action cannot be undone.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn--danger" onClick={handleDelete}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="page-header">
        <div className="page-header__icon">
          <FolderOpen size={28} />
        </div>
        <div className="page-header__content">
          <h1 className="page-header__title">My Drafts</h1>
          <p className="page-header__subtitle">
            Manage your saved proposal drafts
          </p>
        </div>
        {!loading && !empty && (
          <span className="page-header__count">
            {data.length} draft{data.length !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      {/* Loading State */}
      {loading && (
        <div className="drafts-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="draft-skeleton">
              <div className="draft-skeleton__icon" />
              <div className="draft-skeleton__content">
                <div className="draft-skeleton__title" />
                <div className="draft-skeleton__subtitle" />
              </div>
              <div className="draft-skeleton__actions" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && empty && (
        <div className="empty-state">
          <img src={NoDataImg} alt="No drafts" className="empty-state__image" />
          <h3 className="empty-state__title">No Drafts Yet</h3>
          <p className="empty-state__message">
            Start creating proposals and save them as drafts to continue later.
          </p>
          <a href="/create" className="btn btn--primary">
            Create New Proposal
          </a>
        </div>
      )}

      {/* Drafts List */}
      {!loading && !empty && (
        <div className="drafts-list">
          {data.map((item) => (
            <div
              key={item.id}
              className={`draft-card ${
                deletingId === item.id ? "draft-card--deleting" : ""
              }`}
            >
              <div className="draft-card__icon">
                <FileText size={24} />
              </div>
              <div className="draft-card__content">
                <h3 className="draft-card__title">
                  {item.draft_name || (
                    <span className="draft-card__untitled">Untitled Draft</span>
                  )}
                </h3>
                {item.updated_at && (
                  <p className="draft-card__meta">
                    <Clock size={14} />
                    Last edited:{" "}
                    {new Date(item.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="draft-card__actions">
                <button
                  className="btn btn--secondary"
                  onClick={() => handleEdit(item)}
                  disabled={deletingId === item.id}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  className="btn btn--ghost-danger"
                  onClick={() => confirmDelete(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 size={16} className="btn__spinner" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Draft;
