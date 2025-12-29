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
  ClipboardCheck,
  Receipt,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { getAPECalFeedback } from "@/utils/api/Api";
import DescriptionAlerts from "@/utils/constants/alerts";
import BammerVideo from "@/assets/Loading_icon.gif";
import "./AssessmentPrograms.scss";

// -----------------------------
// TYPES
// -----------------------------
type AssessmentLevel = {
  participants: string;
  aup: string;
};

type AssessmentProgramsType = Record<string, AssessmentLevel>;

type LevelDataRoot = {
  AssessmentPrograms: AssessmentProgramsType;
};

type AssessmentProgramsProps = {
  handleCloseBH?: () => void;
};

type DropdownType = "program" | "discount" | null;

// -----------------------------
// CONSTANTS
// -----------------------------
const LEVELS_DATA: LevelDataRoot = {
  AssessmentPrograms: {
    "DISC & Emotional Intelligence Combo Assessment(1-200)": {
      participants: "1-200",
      aup: "$85-$149",
    },
    "DISC & Emotional Intelligence Combo Assessment(201-299)": {
      participants: "201-299",
      aup: "$75-$84.99",
    },
    "DISC & Emotional Intelligence Combo Assessment(300+)": {
      participants: "300+",
      aup: "$65-$74.99",
    },
    "Leadership 360 Assessment": { participants: "1-100", aup: "$200-$500" },
    "Group Executive Report": { participants: "1-100", aup: "$100-$500" },
    "Sales Assessment": { participants: "1-100", aup: "$85-$149" },
    "Sales Leader Assessment": { participants: "1-100", aup: "$200-$500" },
    "Organizational Assessment": {
      participants: "25-1000",
      aup: "$500-$1500",
    },
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
const AssessmentPrograms: React.FC<AssessmentProgramsProps> = ({
  handleCloseBH,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = new URLSearchParams(location.search).get("s");

  // Refs for dropdown positioning
  const programDropdownRef = useRef<HTMLDivElement>(null);
  const discountDropdownRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // STATE
  // -----------------------------
  const [selectedProgram, setSelectedProgram] = useState("");
  const [participantsRange, setParticipantsRange] = useState("");
  const [aupRange, setAupRange] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  // Inputs
  const [customParticipants, setCustomParticipants] = useState<
    number | undefined
  >();
  const [customAup, setCustomAup] = useState<number | undefined>();
  const [assessmentFee, setAssessmentFee] = useState<number | undefined>();

  // Outputs
  const [grossAmount, setGrossAmount] = useState<number | undefined>();
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
      if (activeDropdown === "program" && programDropdownRef.current) {
        if (!programDropdownRef.current.contains(event.target as Node)) {
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
  const updateGrossAmount = useCallback(
    (participants?: number, aup?: number, discount?: number) => {
      if (participants && aup) {
        const result = participants * aup;
        setGrossAmount(result);
        if (discount !== undefined && discount > 0) {
          setDiscountAmount(result * discount);
        } else {
          setDiscountAmount(undefined);
        }
      } else {
        setGrossAmount(undefined);
        setDiscountAmount(undefined);
      }
    },
    []
  );

  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    setActiveDropdown(null);
    const selected =
      LEVELS_DATA.AssessmentPrograms[value as keyof AssessmentProgramsType];
    if (!selected) {
      setParticipantsRange("");
      setAupRange("");
      return;
    }
    setParticipantsRange(selected.participants);
    setAupRange(selected.aup);
  };

  const handleParticipantsInput = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    const validNum =
      num !== undefined && Number.isFinite(num) ? num : undefined;
    setCustomParticipants(validNum);
    updateGrossAmount(validNum, customAup, discountValue);
  };

  const handleAupInput = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    const validNum =
      num !== undefined && Number.isFinite(num) ? num : undefined;
    setCustomAup(validNum);
    updateGrossAmount(customParticipants, validNum, discountValue);
  };

  const handleAssessmentFeeInput = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    const validNum =
      num !== undefined && Number.isFinite(num) ? num : undefined;
    setAssessmentFee(validNum);
  };

  const handleDiscountSelect = (value: number) => {
    setDiscountValue(value);
    setActiveDropdown(null);
    if (grossAmount) {
      setDiscountAmount(value > 0 ? grossAmount * value : undefined);
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

  // Calculate net amount
  const getNetAmount = () => {
    if (grossAmount !== undefined && customParticipants && assessmentFee) {
      return grossAmount - customParticipants * assessmentFee;
    }
    return undefined;
  };

  // Calculate after discount
  const getAfterDiscount = () => {
    const netAmount = getNetAmount();
    if (netAmount !== undefined && discountAmount !== undefined) {
      return netAmount - discountAmount;
    }
    return undefined;
  };

  // -----------------------------
  // FEEDBACK
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
        type: "assesment_programs",
        data: {
          "Model Type": "Assessment Programs",
          assesmentType: selectedProgram,
          Participants: Number(customParticipants),
          "Per Assessment Fee": Number(customAup),
          "Assessment Fee": Number(assessmentFee),
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
      setLoadingFeedback(false);
      setLocationModal(false);
    }
  };

  // -----------------------------
  // AI PROPOSAL GENERATION
  // -----------------------------
  const handleGenerateProposal = async () => {
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

  // -----------------------------
  // PROPOSAL DOWNLOAD
  // -----------------------------
  const handleDownloadProposal = async () => {
    if (!proposalContent) {
      showAlert("No proposal content found.", "error");
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
      a.download = "assessment_programs_proposal.pdf";
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
    if (!customParticipants || !assessmentFee || !customAup) {
      showAlert("Please fill all required fields.", "error");
      return;
    }
    const netAmount = getNetAmount() || 0;
    const data: Record<string, unknown> = {
      heading: "Assessment Programs",
      Custom_Participants: customParticipants,
      Custom_Adu: customAup,
      Gross_Amount: grossAmount,
      Assessment_fee: assessmentFee,
      Net_Amount: netAmount.toFixed(2),
    };
    if (discountValue && discountValue > 0 && discountAmount) {
      data.Discount_Amount = discountAmount;
      data.After_Discount = (netAmount - discountAmount).toFixed(2);
    }
    localStorage.setItem("Calculation", JSON.stringify(data));
    showAlert("Data Stored For Proposal.", "success");
    setTimeout(() => {
      if (!slug) navigate("/create/leadership-workshop-proposal");
      if (handleCloseBH) handleCloseBH();
    }, 1500);
  };

  // Get shortened program name for display
  const getShortenedProgramName = (name: string) => {
    if (name.length > 50) {
      return name.substring(0, 47) + "...";
    }
    return name;
  };

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="assessment-pricing">
      {alert && (
        <DescriptionAlerts text={alertConfig.text} icon={alertConfig.icon} />
      )}

      {/* Hero Header */}
      <header className="pricing-hero">
        <div className="pricing-hero__icon">
          <ClipboardCheck size={28} />
        </div>
        <div className="pricing-hero__content">
          <span className="pricing-hero__badge">Pricing Calculator</span>
          <h1 className="pricing-hero__title">Assessment Programs</h1>
          <p className="pricing-hero__subtitle">
            Calculate assessment fees for DISC, Leadership 360, Sales, and
            Organizational programs
          </p>
        </div>
      </header>

      {/* Program Selection Card */}
      <section className="pricing-card">
        <div className="pricing-card__header">
          <h2 className="pricing-card__title">
            <ClipboardCheck size={20} />
            Select Assessment Program
          </h2>
        </div>
        <div className="pricing-card__body">
          <div className="form-field" ref={programDropdownRef}>
            <label className="form-field__label">Assessment Type</label>
            <div className="select-wrapper">
              <button
                className={`select-trigger ${
                  activeDropdown === "program" ? "select-trigger--active" : ""
                }`}
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "program" ? null : "program"
                  )
                }
                type="button"
                aria-expanded={activeDropdown === "program"}
                aria-haspopup="listbox"
              >
                <span
                  className={
                    selectedProgram ? "" : "select-trigger__placeholder"
                  }
                >
                  {selectedProgram
                    ? getShortenedProgramName(selectedProgram)
                    : "Choose an assessment..."}
                </span>
                <ChevronDown
                  size={20}
                  className={`select-trigger__icon ${
                    activeDropdown === "program"
                      ? "select-trigger__icon--rotated"
                      : ""
                  }`}
                />
              </button>
              {activeDropdown === "program" && (
                <ul
                  className="select-dropdown select-dropdown--large"
                  role="listbox"
                >
                  {Object.keys(LEVELS_DATA.AssessmentPrograms).map(
                    (program) => (
                      <li key={program}>
                        <button
                          className={`select-option ${
                            selectedProgram === program
                              ? "select-option--selected"
                              : ""
                          }`}
                          onClick={() => handleProgramChange(program)}
                          type="button"
                          role="option"
                          aria-selected={selectedProgram === program}
                        >
                          <span className="select-option__text">{program}</span>
                          <span className="select-option__meta">
                            {
                              LEVELS_DATA.AssessmentPrograms[
                                program as keyof AssessmentProgramsType
                              ].participants
                            }{" "}
                            participants •{" "}
                            {
                              LEVELS_DATA.AssessmentPrograms[
                                program as keyof AssessmentProgramsType
                              ].aup
                            }
                          </span>
                        </button>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>

          {selectedProgram && (
            <div className="level-info">
              <div className="level-info__item">
                <span className="level-info__label">Participants Range</span>
                <span className="level-info__value">{participantsRange}</span>
              </div>
              <div className="level-info__item">
                <span className="level-info__label">AUP Range</span>
                <span className="level-info__value">{aupRange}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Input Parameters Card */}
      {selectedProgram && (
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
                  Per Assessment Fee (AUP)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={customAup ?? ""}
                  onChange={(e) => handleAupInput(e.target.value)}
                  placeholder="Enter fee per assessment"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gross Amount Result */}
      {grossAmount !== undefined && (
        <section className="pricing-card pricing-card--results">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <Calculator size={20} />
              Gross Amount
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="result-tile result-tile--primary result-tile--full">
              <span className="result-tile__label">Total Gross Amount</span>
              <span className="result-tile__value">
                {formatCurrency(grossAmount)}
              </span>
              <span className="result-tile__note">
                {customParticipants} participants ×{" "}
                {formatCurrency(customAup || 0)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Assessment Fee Input Card */}
      {customParticipants && (
        <section className="pricing-card">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <Receipt size={20} />
              Assessment Cost
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="form-field">
              <label className="form-field__label">
                <DollarSign size={16} />
                Assessment Fee (Cost per assessment)
              </label>
              <input
                type="number"
                className="form-input"
                value={assessmentFee ?? ""}
                onChange={(e) => handleAssessmentFeeInput(e.target.value)}
                placeholder="Enter assessment cost"
                min="0"
                step="0.01"
              />
            </div>

            {/* Net Amount Result */}
            {assessmentFee !== undefined && grossAmount !== undefined && (
              <div className="net-amount-display">
                <div className="net-amount-breakdown">
                  <div className="net-amount-breakdown__row">
                    <span>Gross Amount</span>
                    <span>{formatCurrency(grossAmount)}</span>
                  </div>
                  <div className="net-amount-breakdown__row net-amount-breakdown__row--subtract">
                    <span>
                      Assessment Costs ({customParticipants} ×{" "}
                      {formatCurrency(assessmentFee)})
                    </span>
                    <span>
                      -{formatCurrency(customParticipants * assessmentFee)}
                    </span>
                  </div>
                  <div className="net-amount-breakdown__row net-amount-breakdown__row--total">
                    <span>Net Amount</span>
                    <span>{formatCurrency(getNetAmount() || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Discount Selection Card */}
      {selectedProgram && (
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
        grossAmount !== undefined && (
          <section className="pricing-card pricing-card--discount">
            <div className="pricing-card__header">
              <h2 className="pricing-card__title">
                <Sparkles size={20} />
                After Discount
              </h2>
            </div>
            <div className="pricing-card__body">
              <div className="results-grid">
                <div className="result-tile result-tile--warning">
                  <span className="result-tile__label">Discount Amount</span>
                  <span className="result-tile__value">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
                {getAfterDiscount() !== undefined && (
                  <div className="result-tile result-tile--success">
                    <span className="result-tile__label">Final Amount</span>
                    <span className="result-tile__value">
                      {formatCurrency(getAfterDiscount()!)}
                    </span>
                    <span className="result-tile__note">
                      After all deductions
                    </span>
                  </div>
                )}
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
            onClick={handleGenerateProposal}
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
              <button
                className="btn btn--primary"
                onClick={handleDownloadProposal}
              >
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

export default AssessmentPrograms;
