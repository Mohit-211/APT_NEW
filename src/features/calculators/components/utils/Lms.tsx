import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  FileText,
  TrendingUp,
  Download,
  Users,
  DollarSign,
  Percent,
  Calculator,
  Sparkles,
  X,
  Server,
  BarChart3,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { getAPECalFeedback } from "@/utils/api/Api";
import DescriptionAlerts from "@/utils/constants/alerts";
import BammerVideo from "@/assets/Loading_icon.gif";
import "./Lms.scss";

// -----------------------------
// TYPES
// -----------------------------
type LmsLevel = {
  Max_Users: string;
  aup: string;
  ctm: string;
};

type LmsLevelsType = Record<string, LmsLevel>;

type LmsRoot = {
  Lms: LmsLevelsType;
};

type LmsProps = {
  handleCloseBH?: () => void;
};

type DropdownType = "level" | "discount" | null;

// -----------------------------
// CONSTANTS
// -----------------------------
const LEVELS_DATA: LmsRoot = {
  Lms: {
    "Level 1": { Max_Users: "1-299", aup: "3.50", ctm: "195.00" },
    "Level 2": { Max_Users: "300-500", aup: "3.48", ctm: "695.00" },
    "Level 3": { Max_Users: "501+", aup: "2.49", ctm: "995.00" },
  },
};

const DISCOUNT_OPTIONS = [
  { label: "No Discount", value: 0 },
  { label: "2%", value: 0.02 },
  { label: "5%", value: 0.05 },
  { label: "10%", value: 0.1 },
  { label: "12%", value: 0.12 },
  { label: "15%", value: 0.15 },
  { label: "20%", value: 0.2 },
  { label: "25%", value: 0.25 },
  { label: "30%", value: 0.3 },
];

// -----------------------------
// COMPONENT
// -----------------------------
const Lms: React.FC<LmsProps> = ({ handleCloseBH }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = new URLSearchParams(location.search).get("s");

  // Refs for dropdown positioning
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  const discountDropdownRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // STATE
  // -----------------------------
  const [selectedLevel, setSelectedLevel] = useState("");
  const [participantsRange, setParticipantsRange] = useState("");
  const [baseAup, setBaseAup] = useState("");
  const [monthlyCtm, setMonthlyCtm] = useState<number>(0);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  // Inputs
  const [customParticipants, setCustomParticipants] = useState<
    number | undefined
  >();
  const [customAup, setCustomAup] = useState<number | undefined>();

  // Outputs
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | undefined>();
  const [discountValue, setDiscountValue] = useState<number | undefined>();
  const [discountAmount, setDiscountAmount] = useState<number | undefined>();

  // Feedback / Proposal
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showGenerateProposalBtn, setShowGenerateProposalBtn] = useState(false);

  // Modal / Alerts
  const [locationModal, setLocationModal] = useState(false);
  const [locationData, setLocationData] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    text: string;
    icon: "error" | "success" | "warning" | "info" | "question";
  }>({
    text: "",
    icon: "info",
  });

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown === "level" && levelDropdownRef.current) {
        if (!levelDropdownRef.current.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
      if (activeDropdown === "discount" && discountDropdownRef.current) {
        if (!discountDropdownRef.current.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeDropdown]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setLocationModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const updateMonthlyRevenue = useCallback(
    (participants?: number, aup?: number, discount?: number) => {
      if (participants && aup) {
        const total = participants * aup;
        setMonthlyRevenue(total);
        if (discount !== undefined && discount > 0) {
          setDiscountAmount(total * discount);
        } else {
          setDiscountAmount(undefined);
        }
      } else {
        setMonthlyRevenue(undefined);
        setDiscountAmount(undefined);
      }
    },
    []
  );

  const handleSelectChange = (value: string) => {
    setSelectedLevel(value);
    setActiveDropdown(null);
    const selected = LEVELS_DATA.Lms[value as keyof LmsLevelsType];
    if (!selected) {
      setParticipantsRange("");
      setBaseAup("");
      setMonthlyCtm(0);
      return;
    }
    setParticipantsRange(selected.Max_Users);
    setBaseAup(selected.aup);
    setMonthlyCtm(Number(selected.ctm));
  };

  const handleParticipantsInput = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    const validNum =
      num !== undefined && Number.isFinite(num) ? num : undefined;
    setCustomParticipants(validNum);
    updateMonthlyRevenue(validNum, customAup, discountValue);
  };

  const handleAupInput = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    const validNum =
      num !== undefined && Number.isFinite(num) ? num : undefined;
    setCustomAup(validNum);
    updateMonthlyRevenue(customParticipants, validNum, discountValue);
  };

  const handleDiscountSelect = (value: number) => {
    setDiscountValue(value);
    setActiveDropdown(null);
    if (monthlyRevenue) {
      setDiscountAmount(value > 0 ? monthlyRevenue * value : undefined);
    }
  };

  // Alert helper
  const showAlert = (text: string, icon: typeof alertConfig.icon) => {
    setAlertConfig({ text, icon });
    setAlert(true);
    setTimeout(() => setAlert(false), 3000);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // -----------------------------
  // FEEDBACK + ANALYSIS
  // -----------------------------
  const handleFeedbackClick = async (selectedLocation?: string) => {
    if (!selectedLocation?.trim()) {
      showAlert("Please enter a location.", "error");
      return;
    }
    setShowFeedback(true);
    setLoadingFeedback(true);
    try {
      const payload = {
        type: "lms",
        data: {
          Model_Type: "LMS",
          Participants: Number(customParticipants),
          AUP: Number(customAup),
          Discount: Number(discountValue || 0) * 100,
        },
        location: selectedLocation,
      };
      const res = await getAPECalFeedback(payload);
      setFeedback(res?.data?.data);
      setShowGenerateProposalBtn(true);
    } catch {
      setFeedback(
        "<p style='color:red'>Error generating analysis. Please try again.</p>"
      );
      setShowGenerateProposalBtn(false);
    } finally {
      setLocationModal(false);
      setLoadingFeedback(false);
    }
  };

  // -----------------------------
  // AI PROPOSAL
  // -----------------------------
  const generateProposal = async () => {
    if (!feedback) {
      showAlert("Generate analysis first.", "error");
      return;
    }
    setLoadingFeedback(true);
    try {
      const token = localStorage.getItem("UserLoginTokenApt");
      const res = await fetch(
        "https://node.automatedpricingtool.io:5000/api/v1/ape/proposal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token || "",
          },
          body: JSON.stringify({ content: feedback }),
        }
      );
      const raw = await res.json();
      setProposalContent(raw?.data || "");
      setShowEditor(true);
      setShowFeedback(false);
    } catch {
      showAlert("AI Proposal generation failed.", "error");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const downloadProposal = async () => {
    if (!proposalContent) {
      showAlert("No proposal to download.", "error");
      return;
    }
    try {
      const token = localStorage.getItem("UserLoginTokenApt");
      const res = await fetch(
        "https://node.automatedpricingtool.io:5000/api/v1/ape/proposal/doc",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token || "",
          },
          body: JSON.stringify({ content: proposalContent }),
        }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lms_proposal.pdf";
      a.click();
      a.remove();
      showAlert("Proposal downloaded successfully!", "success");
    } catch {
      showAlert("Failed to download proposal.", "error");
    }
  };

  // -----------------------------
  // STORE DATA FOR PROPOSAL PAGE
  // -----------------------------
  const handleStoreData = () => {
    if (!customParticipants || !customAup) {
      showAlert("Please fill all required fields.", "error");
      return;
    }
    const baseMonthly = monthlyRevenue || 0;
    const annual = baseMonthly * 12;
    const data: Record<string, unknown> = {
      heading: "LMS",
      Custom_Participants: customParticipants,
      Custom_Aup: customAup,
      Monthly_Revenue: baseMonthly,
      Annual_Revenue: annual.toFixed(2),
      Monthly_CTM: monthlyCtm,
      Annual_CTM: (monthlyCtm * 12).toFixed(2),
      CTM_Cost_Percentage: ((monthlyCtm * 12 * 100) / annual).toFixed(2),
      Annual_CPI_3: (annual * 0.03).toFixed(2),
      Annual_CPI_5: (annual * 0.05).toFixed(2),
    };
    if (discountValue && discountValue > 0 && discountAmount) {
      data.Discount_Amount = discountAmount;
      data.After_Discount = (baseMonthly - discountAmount).toFixed(2);
      data.Annual_After_Discount = (
        (baseMonthly - discountAmount) *
        12
      ).toFixed(2);
    }
    localStorage.setItem("Calculation", JSON.stringify(data));
    showAlert("Data Stored For Proposal.", "success");
    setTimeout(() => {
      if (!slug) navigate("/create/leadership-workshop-proposal");
      if (handleCloseBH) handleCloseBH();
    }, 1500);
  };

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="lms-pricing">
      {alert && (
        <DescriptionAlerts text={alertConfig.text} icon={alertConfig.icon} />
      )}

      {/* Hero Header */}
      <header className="pricing-hero">
        <div className="pricing-hero__icon">
          <Server size={28} />
        </div>
        <div className="pricing-hero__content">
          <span className="pricing-hero__badge">Pricing Calculator</span>
          <h1 className="pricing-hero__title">LMS Pricing Model</h1>
          <p className="pricing-hero__subtitle">
            Calculate learning management system fees based on users, unit
            pricing, and CTM costs
          </p>
        </div>
      </header>

      {/* Level Selection Card */}
      <section className="pricing-card">
        <div className="pricing-card__header">
          <h2 className="pricing-card__title">
            <Users size={20} />
            Select User Level
          </h2>
        </div>
        <div className="pricing-card__body">
          <div className="form-field" ref={levelDropdownRef}>
            <label className="form-field__label">Pricing Tier</label>
            <div className="select-wrapper">
              <button
                className={`select-trigger ${
                  activeDropdown === "level" ? "select-trigger--active" : ""
                }`}
                onClick={() =>
                  setActiveDropdown(activeDropdown === "level" ? null : "level")
                }
                type="button"
                aria-expanded={activeDropdown === "level"}
                aria-haspopup="listbox"
              >
                <span
                  className={selectedLevel ? "" : "select-trigger__placeholder"}
                >
                  {selectedLevel || "Choose a level..."}
                </span>
                <ChevronDown
                  size={20}
                  className={`select-trigger__icon ${
                    activeDropdown === "level"
                      ? "select-trigger__icon--rotated"
                      : ""
                  }`}
                />
              </button>
              {activeDropdown === "level" && (
                <ul className="select-dropdown" role="listbox">
                  {Object.keys(LEVELS_DATA.Lms).map((level) => (
                    <li key={level}>
                      <button
                        className={`select-option ${
                          selectedLevel === level
                            ? "select-option--selected"
                            : ""
                        }`}
                        onClick={() => handleSelectChange(level)}
                        type="button"
                        role="option"
                        aria-selected={selectedLevel === level}
                      >
                        <span className="select-option__text">{level}</span>
                        <span className="select-option__meta">
                          {
                            LEVELS_DATA.Lms[level as keyof LmsLevelsType]
                              .Max_Users
                          }{" "}
                          users
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {selectedLevel && (
            <div className="level-info">
              <div className="level-info__item">
                <span className="level-info__label">Max Users</span>
                <span className="level-info__value">{participantsRange}</span>
              </div>
              <div className="level-info__item">
                <span className="level-info__label">Base AUP</span>
                <span className="level-info__value">${baseAup}</span>
              </div>
              <div className="level-info__item">
                <span className="level-info__label">Monthly CTM</span>
                <span className="level-info__value">
                  {formatCurrency(monthlyCtm)}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Input Parameters Card */}
      {selectedLevel && (
        <section className="pricing-card">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <DollarSign size={20} />
              Input Parameters
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="input-grid">
              <div className="form-field">
                <label className="form-field__label">
                  <Users size={16} />
                  Number of Participants
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={customParticipants ?? ""}
                  onChange={(e) => handleParticipantsInput(e.target.value)}
                  placeholder="Enter participant count"
                  min="1"
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">
                  <DollarSign size={16} />
                  AUP (Average Unit Price)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={customAup ?? ""}
                  onChange={(e) => handleAupInput(e.target.value)}
                  placeholder="Enter AUP amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Revenue Results Card */}
      {monthlyRevenue !== undefined && (
        <section className="pricing-card pricing-card--results">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <BarChart3 size={20} />
              Revenue Calculations
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="results-grid">
              <div className="result-tile result-tile--primary">
                <span className="result-tile__label">Monthly Revenue</span>
                <span className="result-tile__value">
                  {formatCurrency(monthlyRevenue)}
                </span>
                <span className="result-tile__note">Per month</span>
              </div>
              <div className="result-tile">
                <span className="result-tile__label">Annual Revenue</span>
                <span className="result-tile__value">
                  {formatCurrency(monthlyRevenue * 12)}
                </span>
                <span className="result-tile__note">12-month projection</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discount Selection Card */}
      {selectedLevel && (
        <section className="pricing-card">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <Percent size={20} />
              Apply Discount
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="form-field" ref={discountDropdownRef}>
              <label className="form-field__label">Discount Rate</label>
              <div className="select-wrapper">
                <button
                  className={`select-trigger ${
                    activeDropdown === "discount"
                      ? "select-trigger--active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "discount" ? null : "discount"
                    )
                  }
                  type="button"
                  aria-expanded={activeDropdown === "discount"}
                  aria-haspopup="listbox"
                >
                  <span
                    className={
                      discountValue !== undefined
                        ? ""
                        : "select-trigger__placeholder"
                    }
                  >
                    {discountValue !== undefined
                      ? DISCOUNT_OPTIONS.find(
                          (opt) => opt.value === discountValue
                        )?.label
                      : "Select discount..."}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`select-trigger__icon ${
                      activeDropdown === "discount"
                        ? "select-trigger__icon--rotated"
                        : ""
                    }`}
                  />
                </button>
                {activeDropdown === "discount" && (
                  <ul className="select-dropdown" role="listbox">
                    {DISCOUNT_OPTIONS.map((option) => (
                      <li key={option.value}>
                        <button
                          className={`select-option ${
                            discountValue === option.value
                              ? "select-option--selected"
                              : ""
                          }`}
                          onClick={() => handleDiscountSelect(option.value)}
                          type="button"
                          role="option"
                          aria-selected={discountValue === option.value}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discount Results Card */}
      {discountAmount !== undefined &&
        discountValue !== 0 &&
        monthlyRevenue !== undefined && (
          <section className="pricing-card pricing-card--discount">
            <div className="pricing-card__header">
              <h2 className="pricing-card__title">
                <Sparkles size={20} />
                After Discount
              </h2>
            </div>
            <div className="pricing-card__body">
              <div className="results-grid results-grid--three">
                <div className="result-tile result-tile--warning">
                  <span className="result-tile__label">Discount Amount</span>
                  <span className="result-tile__value">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
                <div className="result-tile result-tile--success">
                  <span className="result-tile__label">
                    Monthly After Discount
                  </span>
                  <span className="result-tile__value">
                    {formatCurrency(monthlyRevenue - discountAmount)}
                  </span>
                </div>
                <div className="result-tile">
                  <span className="result-tile__label">
                    Annual After Discount
                  </span>
                  <span className="result-tile__value">
                    {formatCurrency((monthlyRevenue - discountAmount) * 12)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* CTM & Additional Metrics Card */}
      {discountValue !== undefined && monthlyRevenue !== undefined && (
        <section className="pricing-card">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <Calculator size={20} />
              CTM & Additional Metrics
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="calc-list">
              <div className="calc-item">
                <span className="calc-item__label">Monthly CTM Cost</span>
                <span className="calc-item__value">
                  {formatCurrency(monthlyCtm)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-item__label">Annual CTM Cost</span>
                <span className="calc-item__value">
                  {formatCurrency(monthlyCtm * 12)}
                </span>
              </div>
              <div className="calc-item calc-item--highlight">
                <span className="calc-item__label">
                  CTM Cost as % of Revenue
                </span>
                <span className="calc-item__value">
                  {(((monthlyCtm * 12) / (monthlyRevenue * 12)) * 100).toFixed(
                    2
                  )}
                  %
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-item__label">
                  Annual CPI Increase (3%)
                </span>
                <span className="calc-item__value">
                  {formatCurrency(monthlyRevenue * 12 * 0.03)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-item__label">
                  Annual CPI Increase (5%)
                </span>
                <span className="calc-item__value">
                  {formatCurrency(monthlyRevenue * 12 * 0.05)}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <div className="action-bar">
        <button className="btn btn--primary" onClick={handleStoreData}>
          <Plus size={20} />
          Add to Proposal
        </button>
        {discountValue !== undefined && (
          <button
            className="btn btn--secondary"
            onClick={() => setLocationModal(true)}
          >
            <TrendingUp size={20} />
            Market Analysis
          </button>
        )}
      </div>

      {/* Location Modal */}
      {locationModal && (
        <div className="modal-backdrop" onClick={() => setLocationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal__close"
              onClick={() => setLocationModal(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="modal__header">
              <h3 className="modal__title">Enter Location</h3>
              <p className="modal__description">
                Provide your location for detailed market analysis and pricing
                insights.
              </p>
            </div>
            <div className="modal__body">
              <div className="form-field">
                <label className="form-field__label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={locationData}
                  onChange={(e) => setLocationData(e.target.value)}
                  placeholder="e.g., New York, USA"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="btn btn--ghost"
                onClick={() => setLocationModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={() => handleFeedbackClick(locationData)}
              >
                Generate Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && (
        <section className="pricing-card pricing-card--analysis">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <TrendingUp size={20} />
              Market Analysis
            </h2>
          </div>
          <div className="pricing-card__body">
            {loadingFeedback ? (
              <div className="loading-state">
                <img
                  src={BammerVideo}
                  alt="Loading..."
                  className="loading-state__icon"
                />
                <p className="loading-state__text">
                  Analyzing your pricing strategy...
                </p>
              </div>
            ) : (
              feedback && (
                <div
                  className="analysis-content"
                  dangerouslySetInnerHTML={{ __html: feedback }}
                />
              )
            )}
          </div>
        </section>
      )}

      {/* Generate Proposal Button */}
      {showGenerateProposalBtn && !showEditor && (
        <div className="action-bar action-bar--centered">
          <button
            className="btn btn--primary btn--large"
            onClick={generateProposal}
          >
            <FileText size={20} />
            Generate AI Proposal
          </button>
        </div>
      )}

      {/* TinyMCE Editor */}
      {showEditor && proposalContent && (
        <section className="pricing-card pricing-card--editor">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <FileText size={20} />
              Edit Proposal
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="editor-container">
              <Editor
                apiKey="no-api-key-needed"
                value={proposalContent}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: "lists link table",
                  toolbar:
                    "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
                  content_style:
                    "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; }",
                }}
                onEditorChange={(content) => setProposalContent(content)}
              />
            </div>
            <div className="action-bar action-bar--end">
              <button className="btn btn--primary" onClick={downloadProposal}>
                <Download size={20} />
                Download Proposal
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Lms;
