import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useReactToPrint } from "react-to-print";
import {
  FileText,
  Edit3,
  Download,
  X,
  AlertTriangle,
  Check,
  Image,
} from "lucide-react";
import "./CoachingAgreement.scss";

// ============================================
// COMPONENT
// ============================================

const CoachingAgreement: React.FC = () => {
  const [content, setContent] = useState<string>(defaultTemplate);
  const [initialContent, setInitialContent] = useState<string>(defaultTemplate);
  const [openEditor, setOpenEditor] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isToken =
    typeof window !== "undefined"
      ? localStorage.getItem("UserLoginTokenApt")
      : null;

  // Scroll top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Close modal on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConfirmModal) {
          setShowConfirmModal(false);
        } else if (openEditor) {
          attemptCloseEditor();
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [openEditor, showConfirmModal, unsavedChanges]);

  // Show notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
  };

  // === Handle logo upload ============================================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification("Please select an image file.", "error");
        return;
      }
      const url = URL.createObjectURL(file);
      setCompanyLogo(url);
    }
  };

  const triggerLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const removeLogo = () => {
    setCompanyLogo("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // === Handle printing =================================================
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Coaching Agreement",
    pageStyle: `
      @page { margin: 22mm; }
      body { -webkit-print-color-adjust: exact; }
    `,
  });

  // === Attempt to close editor ========================================
  const attemptCloseEditor = () => {
    if (unsavedChanges) {
      setShowConfirmModal(true);
    } else {
      setOpenEditor(false);
    }
  };

  // === Discard changes ================================================
  const handleDiscardChanges = () => {
    setContent(initialContent);
    setUnsavedChanges(false);
    setOpenEditor(false);
    setShowConfirmModal(false);
  };

  // === Save changes ====================================================
  const handleSaveChanges = () => {
    setInitialContent(content);
    setUnsavedChanges(false);
    setOpenEditor(false);
    showNotification("Template updated successfully.", "success");
  };

  // Unauthenticated state
  if (!isToken) {
    return (
      <div className="coaching-agreement">
        <div className="auth-required">
          <div className="auth-required__icon">
            <FileText size={48} />
          </div>
          <h2 className="auth-required__title">Sign In Required</h2>
          <p className="auth-required__message">
            Please sign in to access the Coaching Agreement template.
          </p>
          <a href="/signin" className="btn btn--primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="coaching-agreement">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`toast toast--${notification.type}`}>
          {notification.type === "success" ? (
            <Check size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="page-header">
        <div className="page-header__content">
          <div className="page-header__icon">
            <FileText size={28} />
          </div>
          <div className="page-header__text">
            <h1 className="page-header__title">Coaching Agreement</h1>
            <p className="page-header__subtitle">
              Customize and generate your professional coaching agreement
            </p>
          </div>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--secondary"
            onClick={() => setOpenEditor(true)}
          >
            <Edit3 size={18} />
            Edit Template
          </button>
          <button className="btn btn--primary" onClick={() => handlePrint()}>
            <Download size={18} />
            Generate PDF
          </button>
        </div>
      </header>

      {/* Editor Modal */}
      {openEditor && (
        <div className="modal-backdrop" onClick={attemptCloseEditor}>
          <div
            className="modal modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h2 className="modal__title">Edit Coaching Agreement</h2>
              <button
                className="modal__close"
                onClick={attemptCloseEditor}
                aria-label="Close editor"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <Editor
                apiKey="f8i59q6p88hcyvaqhicwhyjs2cqwzr8elruwyxphppvzc5yd"
                value={content}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: "table lists link",
                  toolbar:
                    "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | table | link",
                  content_style:
                    "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; }",
                }}
                onEditorChange={(newValue) => {
                  setContent(newValue);
                  setUnsavedChanges(true);
                }}
              />
            </div>
            <div className="modal__footer">
              {unsavedChanges && (
                <span className="modal__unsaved-indicator">
                  <AlertTriangle size={14} />
                  Unsaved changes
                </span>
              )}
              <button className="btn btn--ghost" onClick={attemptCloseEditor}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Discard Modal */}
      {showConfirmModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header modal__header--warning">
              <AlertTriangle size={24} />
              <h2 className="modal__title">Unsaved Changes</h2>
            </div>
            <div className="modal__body">
              <p className="modal__message">
                You have unsaved edits. Are you sure you want to discard them?
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="btn btn--ghost"
                onClick={() => setShowConfirmModal(false)}
              >
                Keep Editing
              </button>
              <button
                className="btn btn--danger"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Agreement Content */}
      <div className="agreement-wrapper">
        <div ref={contentRef} className="agreement-container">
          {/* Logo Section */}
          <div className="logo-section">
            {companyLogo ? (
              <div className="logo-preview">
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="logo-preview__image"
                />
                <button
                  className="logo-preview__remove"
                  onClick={removeLogo}
                  aria-label="Remove logo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button className="logo-upload" onClick={triggerLogoUpload}>
                <Image size={24} />
                <span>Add Company Logo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="visually-hidden"
            />
          </div>

          {/* Agreement Title */}
          <h2 className="agreement-title">Coaching Agreement</h2>

          {/* Agreement Content */}
          <div
            className="agreement-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoachingAgreement;

// ============================================
// DEFAULT TEMPLATE
// ============================================

const defaultTemplate = `
<p><strong>Coaching Services: Description, Objectives, Options, Terms, and Agreement of Services</strong></p>

<p><strong>1. Description</strong>: Coaching is an on-going conversation where we provide encouragement, guidance and honest feedback, as YOU pursue YOUR personal and professional goals. We fully expect you to grow your business, by attaining your goals!</p>

<p>In today's competitive environment, some of the most successful business leaders have experienced tremendous benefits from coaching. Results have included increased revenue and productivity, career advancement, higher employee retention, and the development of more effective business strategies. YOU will define the agenda. YOUR results will vary depending on how long we work together and what actions YOU take.</p>

<p>Our clients are expected to and have experienced measurable return on investment, increased productivity, and up to 200% revenue growth.</p>

<p><strong>2. Objectives</strong>: Our responsibility is to provide content, insight, tools, wisdom, framework, ideas, and feedback. YOUR responsibility is to move from awareness to action and accountability. Our coaching provides many structures for you to meet your individual and organizational goals.</p>

<p>The objectives of coaching include, but are not limited to:</p>
<ul>
  <li>Adding an objective and supportive third party to your leadership team</li>
  <li>Increasing accountability of your personal and professional goals</li>
  <li>Improving specific skills related to your role such as managerial skills, communication, conflict resolution, time management, productivity, and effectiveness</li>
  <li>Sharing best practices from other organizations that have done similar work</li>
  <li>Reviewing strategic business decisions related to operations, customer service, marketing, financials, and more</li>
  <li>Being a sounding board</li>
  <li>Preventing problems, thereby avoiding expensive, time consuming or embarrassing actions</li>
  <li>Supporting your growth past your limiting beliefs</li>
  <li>Relationship development</li>
  <li>Conflict resolution</li>
  <li>Mentoring</li>
  <li>Creating a team atmosphere</li>
</ul>

<p><strong>3. Options</strong>: All coaching programs require a minimum of one year time invested. Coaching is a marathon, rather than a sprint!</p>

<p><strong>Platinum Service</strong>: Individual one-on-one coaching with the CEO, owner, or general manager. This package includes two coaching sessions per month, each session lasting approximately two hours. Sessions can be at your office, the coach's place of business, or a mutually agreed upon location. Phone coaching is also an option. Also included in this package is two full days of shadowing, facilitation of two meetings of your choice (up to 2 hours each), and unlimited phone calls and emails. In addition, you or any of your employees will benefit from a 25% discount for any [CLIENT COMPANY NAME] workshops. Your investment/tuition for this service is $__________ for one year.</p>

<p><strong>Gold Service</strong>: Individual one-on-one coaching with the CEO, owner, or general manager. This package includes two coaching sessions per month, each session lasting approximately two hours. Sessions can be at your office, the coach's place of business, or a mutually agreed upon location. Phone coaching is also an option. Included in this package are unlimited phone calls and emails. In addition, you or any of your employees will benefit from a 25% discount for any [CLIENT COMPANY NAME] workshops. Your investment/tuition for this service is $____________ for one year.</p>

<p><strong>Bronze Service</strong>: Individual one-on-one coaching with the CEO, owner, or general manager. This package includes two coaching sessions per month, each session lasting approximately one hour. Sessions can be at your office, the coach's place of business, or a mutually agreed upon location. Phone coaching is also an option. Included in this package are unlimited 10 minute phone calls and emails. Your investment is $________ for one year.</p>

<p>Other coaching services available include, but are not limited to: Group Coaching, Sales Coaching, Couples Coaching, Business Partner Coaching, Youth Coaching, Relationship Coaching, Phone Coaching, and more. Your investment for these programs will be determined on a case by case basis.</p>

<p><strong>4. Terms</strong>: The initial face-to-face consultation is $_________ per hour, but can be credited back to your initial coaching agreement. Payments are to be made before services are provided, and as agreed upon.</p>

<p>We will always begin and end our sessions or calls on time, and if we are meeting by phone you will call me. If you need to reschedule, 24-hours advance notice is required or one-half of the coaching session is lost. If for some reason our coaches need to reschedule and do not do so with 24-hour notice, you will be credited with an additional one-half coaching session, at no additional charge.</p>

<p>Our coaching relationship is completely confidential. We will never share your identity or any information about you with any other person or organization without your expressed consent. In the unlikely event that there are concerns that need to be referred to another professional, I may be able to make that suggestion to you.</p>

<p>The term of our coaching agreement will be at least one year (12 months). Completing our coaching relationship is a mutual decision. While my retention percentage is very high, there may come a time when you determine that it is time to complete our coaching relationship. If and when that time comes, I expect that you will provide me at least 4 weeks' notice. That will give us time to summarize your growth/learning and strategize your next steps.</p>

<p>Our services are unconditionally guaranteed. If at any time you feel that you are not getting the support, honesty, coaching, or training that you expect, then you need to tell me.</p>

<p><strong>5. Agreement of Services</strong>:</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="border: 1px solid #ccc; padding: 12px; width: 35%; font-weight: bold;">Name:</td>
    <td style="border: 1px solid #ccc; padding: 12px;"></td>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 12px; font-weight: bold;">Phone:</td>
    <td style="border: 1px solid #ccc; padding: 12px;"></td>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 12px; font-weight: bold;">Email Address:</td>
    <td style="border: 1px solid #ccc; padding: 12px;"></td>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 12px; font-weight: bold;">Coaching Service Level:</td>
    <td style="border: 1px solid #ccc; padding: 12px;"></td>
  </tr>
</table>

<p>I agree to contract the services of [YOUR COMPANY NAME] Coaching and Consulting Group, LLC, [YOUR NAME] or one of [HIS/HER] associates, to provide coaching services for the purpose of addressing my business and personal projects, objectives, and goals. I understand that the coaching relationship is based upon my agenda and this relationship is most effective when I communicate fully. If at any time I feel the coaching relationship is not working as desired, I agree to work toward re-designing the relationship. Also, I agree that [YOUR COMPANY NAME] Coaching and Consulting Group, LLC is free from any liability or actions that may be related to any comments or suggestions made by [YOUR NAME], or any of [HIS/HER] associates.</p>

<p style="margin-top: 40px;">_____________________________________ <span style="margin-left: 20px;">Signature (client)</span></p>

<p style="text-align: right;">_____________________________________ <span style="margin-left: 20px;">Date</span></p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
  <p><strong>[YOUR COMPANY]</strong></p>
  <p>[YOUR CONTACT INFORMATION]</p>
</div>
`;
