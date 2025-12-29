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
  Plane,
  Percent,
  Calculator,
  Sparkles,
  X,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { getAPECalFeedback } from "@/utils/api/Api";
import DescriptionAlerts from "@/utils/constants/alerts";
import BammerVideo from "@/assets/Loading_icon.gif";
import "./SoftSkillPricing.scss";

type SoftSkillLevel = {
  participants: string;
  aup: string;
};

type SoftSkillLevels = Record<string, SoftSkillLevel>;

type SoftSkillRoot = {
  "Soft Skill": SoftSkillLevels;
};

type SoftSkillProps = {
  handleCloseBH?: () => void;
};

type DropdownType = "level" | "discount" | null;

const LEVELS_DATA: SoftSkillRoot = {
  "Soft Skill": {
    "Level 1": { participants: "1-15", aup: "100" },
    "Level 2": { participants: "16-30", aup: "90" },
    "Level 3": { participants: "31-50", aup: "80" },
    "Level 4": { participants: "51-75", aup: "70" },
    "Level 5": { participants: "76-100", aup: "60" },
    "Level 6": { participants: "100+", aup: "50" },
  },
};

const DISCOUNT_OPTIONS = [
  { label: "No discount", value: 0 },
  { label: "2%", value: 0.02 },
  { label: "5%", value: 0.05 },
  { label: "10%", value: 0.1 },
  { label: "12%", value: 0.12 },
  { label: "15%", value: 0.15 },
  { label: "20%", value: 0.2 },
  { label: "25%", value: 0.25 },
  { label: "30%", value: 0.3 },
];

const SoftSkillPricing: React.FC<SoftSkillProps> = ({ handleCloseBH }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = new URLSearchParams(location.search).get("s");

  // Refs for dropdown positioning
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  const discountDropdownRef = useRef<HTMLDivElement>(null);

  // UI state
  const [selectedLevel, setSelectedLevel] = useState("");
  const [participantsRange, setParticipantsRange] = useState("");
  const [baseAupRange, setBaseAupRange] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  // Inputs
  const [customParticipants, setCustomParticipants] = useState<
    number | undefined
  >();
  const [customAup, setCustomAup] = useState<number | undefined>();
  const [travelCost, setTravelCost] = useState<number | undefined>();

  // Outputs
  const [perNoDiscount, setPerNoDiscount] = useState<number | undefined>();
  const [discountValue, setDiscountValue] = useState<number | undefined>();
  const [discountAmount, setDiscountAmount] = useState<number | undefined>();

  // Feedback / proposal
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGenerateProposalBtn, setShowGenerateProposalBtn] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  // Modal / alerts
  const [locationModal, setLocationModal] = useState(false);
  const [locationData, setLocationData] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertCfg, setAlertCfg] = useState<{
    text: string;
    icon: "error" | "success" | "warning" | "info" | "question";
  }>({
    text: "",
    icon: "info",
  });

  // Scroll to top on mount
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

  // Close dropdown on escape key
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

  // Calculation helper
  const recalc = useCallback(
    (p?: number, aup?: number, travel?: number, discount?: number) => {
      if (p && aup && travel !== undefined) {
        const base = p * aup + travel;
        setPerNoDiscount(base);
        if (discount !== undefined && discount > 0) {
          setDiscountAmount(base * discount);
        } else {
          setDiscountAmount(undefined);
        }
      } else {
        setPerNoDiscount(undefined);
        setDiscountAmount(undefined);
      }
    },
    []
  );

  // Level selection handler
  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setActiveDropdown(null);
    const info = LEVELS_DATA["Soft Skill"][value as keyof SoftSkillLevels];
    if (!info) {
      setParticipantsRange("");
      setBaseAupRange("");
      return;
    }
    setParticipantsRange(info.participants);
    setBaseAupRange(info.aup);
  };

  // Input handlers
  const handleParticipantsInput = (v: string) => {
    const n = v === "" ? undefined : Number(v);
    const validN = n !== undefined && Number.isFinite(n) ? n : undefined;
    setCustomParticipants(validN);
    setShowFeedback(false);
    recalc(validN, customAup, travelCost, discountValue);
  };

  const handleAupInput = (v: string) => {
    const n = v === "" ? undefined : Number(v);
    const validN = n !== undefined && Number.isFinite(n) ? n : undefined;
    setCustomAup(validN);
    setShowFeedback(false);
    recalc(customParticipants, validN, travelCost, discountValue);
  };

  const handleTravelInput = (v: string) => {
    const n = v === "" ? undefined : Number(v);
    const validN = n !== undefined && Number.isFinite(n) ? n : undefined;
    setTravelCost(validN);
    setShowFeedback(false);
    recalc(customParticipants, customAup, validN, discountValue);
  };

  const handleDiscountSelect = (val: number) => {
    setDiscountValue(val);
    setActiveDropdown(null);
    if (perNoDiscount !== undefined) {
      setDiscountAmount(val > 0 ? perNoDiscount * val : undefined);
    }
  };

  // Alert helper
  const showAlert = (text: string, icon: typeof alertCfg.icon) => {
    setAlertCfg({ text, icon });
    setAlert(true);
    setTimeout(() => setAlert(false), 3000);
  };

  // API feedback
  const handleFeedbackClick = async (selectedLocation?: string) => {
    if (!selectedLocation?.trim()) {
      showAlert("Please enter a location.", "error");
      return;
    }
    setShowFeedback(true);
    setLoadingFeedback(true);
    try {
      const payload = {
        type: "soft_skill_pricing_model",
        data: {
          "Model Type": "Soft Skill Pricing Model",
          Participants: Number(customParticipants),
          AUP: Number(customAup),
          "Travel Cost": Number(travelCost),
          Discount: Number(discountValue || 0) * 100,
        },
        location: selectedLocation,
      };
      const res = await getAPECalFeedback(payload);
      setFeedback(res?.data?.data);
      setShowGenerateProposalBtn(true);
    } catch {
      setFeedback(
        "<p style='color:red'>Sorry, analysis failed. Try again later.</p>"
      );
      setShowGenerateProposalBtn(false);
    } finally {
      setLoadingFeedback(false);
      setLocationModal(false);
    }
  };

  // Generate AI proposal
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
      setShowGenerateProposalBtn(true);
    } catch {
      showAlert("AI proposal generation failed.", "error");
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Download proposal PDF
  const handleDownloadProposal = async () => {
    if (!proposalContent) {
      showAlert("No proposal content.", "error");
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
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "advanced_price_exhibit_proposal.pdf";
      a.click();
      a.remove();
      showAlert("Proposal downloaded successfully!", "success");
    } catch {
      showAlert("Failed to download proposal.", "error");
    }
  };

  // Store data for proposal page
  const handleStoreData = () => {
    if (
      !customParticipants ||
      !customAup ||
      travelCost === undefined ||
      perNoDiscount === undefined
    ) {
      showAlert("Please fill all required fields.", "error");
      return;
    }
    const data: Record<string, unknown> = {
      heading: "SoftSkillPricing",
      Custom_Participants: customParticipants,
      Custom_Aup: customAup,
      Travel_Cost: travelCost,
      Per_No_Discount: perNoDiscount,
      Annual_No_Discount: (perNoDiscount * 12).toFixed(2),
      Workbook_Print_Cost: (customParticipants * 19).toFixed(2),
      One_Time_Cost: (
        ((customParticipants * 19) / perNoDiscount) *
        100
      ).toFixed(2),
      Annual_CPI_3: (perNoDiscount * 12 * 0.03).toFixed(2),
      Annual_CPI_5: (perNoDiscount * 12 * 0.05).toFixed(2),
    };
    if (discountValue && discountAmount !== undefined) {
      data.Discount_Value = (discountValue * 100).toFixed(2);
      data.Discount_Amount = discountAmount;
      data.After_Discount = (perNoDiscount - discountAmount).toFixed(2);
      data.Annual_After_Discount = (
        (perNoDiscount - discountAmount) *
        12
      ).toFixed(2);
    }
    localStorage.setItem("Calculation", JSON.stringify(data));
    showAlert("Data Stored For Proposal.", "success");
    setTimeout(() => {
      if (!slug) navigate("/create/leadership-workshop-proposal");
      if (handleCloseBH) handleCloseBH();
    }, 1200);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="soft-skill-pricing">
      {alert && <DescriptionAlerts text={alertCfg.text} icon={alertCfg.icon} />}

      {/* Hero Header */}
      <header className="pricing-hero">
        <div className="pricing-hero__icon">
          <Calculator size={28} />
        </div>
        <div className="pricing-hero__content">
          <span className="pricing-hero__badge">Pricing Calculator</span>
          <h1 className="pricing-hero__title">Soft Skill Pricing Model</h1>
          <p className="pricing-hero__subtitle">
            Calculate session fees based on participants, unit pricing, and
            travel costs
          </p>
        </div>
      </header>

      {/* Level Selection Card */}
      <section className="pricing-card">
        <div className="pricing-card__header">
          <h2 className="pricing-card__title">
            <Users size={20} />
            Select Participant Level
          </h2>
        </div>
        <div className="pricing-card__body">
          <div className="form-field" ref={levelDropdownRef}>
            <label className="form-field__label">Pricing Level</label>
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
                  {Object.keys(LEVELS_DATA["Soft Skill"]).map((level) => (
                    <li key={level}>
                      <button
                        className={`select-option ${
                          selectedLevel === level
                            ? "select-option--selected"
                            : ""
                        }`}
                        onClick={() => handleLevelChange(level)}
                        type="button"
                        role="option"
                        aria-selected={selectedLevel === level}
                      >
                        <span className="select-option__text">{level}</span>
                        <span className="select-option__meta">
                          {
                            LEVELS_DATA["Soft Skill"][
                              level as keyof SoftSkillLevels
                            ].participants
                          }{" "}
                          participants
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
                <span className="level-info__label">Participants Range</span>
                <span className="level-info__value">{participantsRange}</span>
              </div>
              <div className="level-info__item">
                <span className="level-info__label">Base AUP</span>
                <span className="level-info__value">${baseAupRange}</span>
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
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">
                  <Plane size={16} />
                  Travel Cost
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={travelCost ?? ""}
                  onChange={(e) => handleTravelInput(e.target.value)}
                  placeholder="Enter travel cost"
                  min="0"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Card */}
      {perNoDiscount !== undefined && (
        <section className="pricing-card pricing-card--results">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <Calculator size={20} />
              Calculated Fees
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="results-grid">
              <div className="result-tile result-tile--primary">
                <span className="result-tile__label">Session Fee</span>
                <span className="result-tile__value">
                  {formatCurrency(perNoDiscount)}
                </span>
                <span className="result-tile__note">Per month or session</span>
              </div>
              <div className="result-tile">
                <span className="result-tile__label">Annual Fee</span>
                <span className="result-tile__value">
                  {formatCurrency(perNoDiscount * 12)}
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
        perNoDiscount !== undefined && (
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
                  <span className="result-tile__label">Discounted Fee</span>
                  <span className="result-tile__value">
                    {formatCurrency(perNoDiscount - discountAmount)}
                  </span>
                </div>
                <div className="result-tile">
                  <span className="result-tile__label">Annual Discounted</span>
                  <span className="result-tile__value">
                    {formatCurrency((perNoDiscount - discountAmount) * 12)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* Additional Calculations Card */}
      {perNoDiscount !== undefined && customParticipants && (
        <section className="pricing-card">
          <div className="pricing-card__header">
            <h2 className="pricing-card__title">
              <FileText size={20} />
              Additional Calculations
            </h2>
          </div>
          <div className="pricing-card__body">
            <div className="calc-list">
              <div className="calc-item">
                <span className="calc-item__label">
                  Workbook Print Cost (FedEx @ $19)
                </span>
                <span className="calc-item__value">
                  {formatCurrency(customParticipants * 19)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-item__label">
                  Print as % of one-time cost
                </span>
                <span className="calc-item__value">
                  {(((customParticipants * 19) / perNoDiscount) * 100).toFixed(
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
                  {formatCurrency(perNoDiscount * 12 * 0.03)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-item__label">
                  Annual CPI Increase (5%)
                </span>
                <span className="calc-item__value">
                  {formatCurrency(perNoDiscount * 12 * 0.05)}
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

export default SoftSkillPricing;
