import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  FileText,
  TrendingUp,
  Download,
  X,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { getAPECalFeedback } from "@/utils/api/Api";
import DescriptionAlerts from "@/utils/constants/alerts";
import BammerVideo from "@/assets/Loading_icon.gif";
import "./OneTimeWorkshop.scss";

type LevelInfo = {
  participants: string;
  PerHourRate: string;
};

type WorkshopLevels = Record<string, LevelInfo>;

type OneTimeProps = {
  handleCloseBH?: () => void;
};

const OneTimeWorkshopComponent: React.FC<OneTimeProps> = ({
  handleCloseBH,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = new URLSearchParams(location.search).get("s");
  const firstSelectValue = "One Time All Day Workshop" as const;

  const levelsData: Record<string, WorkshopLevels> = {
    "One Time All Day Workshop": {
      "Up to 30 people": {
        participants: "Up to 30 people",
        PerHourRate: "166",
      },
      "Up to 50 people": {
        participants: "Up to 50 people",
        PerHourRate: "120",
      },
    },
  };

  // State / UI control
  const [selectedLevel, setSelectedLevel] = useState("");
  const [participantRange, setParticipantRange] = useState("");
  const [hourRateRange, setHourRateRange] = useState("");
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isDiscountDropdownOpen, setIsDiscountDropdownOpen] = useState(false);

  const [customParticipants, setCustomParticipants] = useState<number>();
  const [customRate, setCustomRate] = useState<number>();
  const [travelCost, setTravelCost] = useState<number>();
  const [totalFee, setTotalFee] = useState<number>();
  const [discountValue, setDiscountValue] = useState<number>();
  const [discountAmount, setDiscountAmount] = useState<number>();

  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGenerateProposalBtn, setShowGenerateProposalBtn] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedLevel(value);
    setIsLevelDropdownOpen(false);
    const info = levelsData[firstSelectValue][value];
    if (!info) {
      setParticipantRange("");
      setHourRateRange("");
      return;
    }
    setParticipantRange(info.participants);
    setHourRateRange(info.PerHourRate);
  };

  const recalc = () => {
    if (!customParticipants || !customRate || travelCost === undefined) {
      setTotalFee(undefined);
      setDiscountAmount(undefined);
      return;
    }
    const base = customParticipants * customRate + travelCost;
    setTotalFee(base);
    if (discountValue) {
      setDiscountAmount(base * discountValue);
    }
  };

  const handleParticipantsInput = (v: string) => {
    setCustomParticipants(Number(v));
    setShowFeedback(false);
    recalc();
  };

  const handleRateInput = (v: string) => {
    setCustomRate(Number(v));
    setShowFeedback(false);
    recalc();
  };

  const handleTravelInput = (v: string) => {
    setTravelCost(Number(v));
    setShowFeedback(false);
    recalc();
  };

  const handleDiscountSelect = (value: number) => {
    setDiscountValue(value);
    setIsDiscountDropdownOpen(false);
    if (totalFee) {
      setDiscountAmount(totalFee * value);
    }
  };

  const handleFeedbackClick = async () => {
    if (!locationData.trim()) {
      setAlertCfg({ text: "Please enter a location.", icon: "error" });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
      return;
    }
    setShowFeedback(true);
    setLoadingFeedback(true);
    try {
      const payload = {
        type: "one_time_all_day_workshop",
        data: {
          "Model Type": "One Time All Day Workshop",
          "Per Hour Rate": customRate,
          travelCost: travelCost,
          Discount: (discountValue || 0) * 100,
        },
        location: locationData,
      };
      const res = await getAPECalFeedback(payload);
      setFeedback(res?.data?.data);
      setShowGenerateProposalBtn(true);
    } catch (err) {
      setFeedback("<p style='color:red'>Error generating analysis.</p>");
      setShowGenerateProposalBtn(false);
    } finally {
      setLoadingFeedback(false);
      setLocationModal(false);
    }
  };

  const generateProposal = async () => {
    if (!feedback) {
      setAlertCfg({ text: "Generate analysis first.", icon: "error" });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
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
            "x-access-token": token!,
          },
          body: JSON.stringify({ content: feedback }),
        }
      );
      const raw = await res.json();
      setProposalContent(raw?.data || "");
      setShowEditor(true);
      setShowFeedback(false);
    } catch {
      setAlertCfg({ text: "Failed to generate AI proposal.", icon: "error" });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const downloadProposal = async () => {
    if (!proposalContent) {
      setAlertCfg({ text: "No proposal to download.", icon: "error" });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
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
            "x-access-token": token!,
          },
          body: JSON.stringify({ content: proposalContent }),
        }
      );
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "one_time_workshop_proposal.pdf";
      a.click();
      setAlertCfg({
        text: "Proposal downloaded successfully!",
        icon: "success",
      });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
    } catch {
      setAlertCfg({ text: "Failed to download proposal.", icon: "error" });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
    }
  };

  const handleStoreData = () => {
    if (!customParticipants || !customRate || travelCost === undefined) {
      setAlertCfg({ text: "Please fill all required fields.", icon: "error" });
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
      return;
    }
    const base = totalFee || 0;
    const annual = base * 12;
    const data: any = {
      heading: "OneTime",
      Custom_Participants: customParticipants,
      CustomPerHour: customRate,
      Travel_Cost: travelCost,
      Per_No_Discount: base,
      Annual_No_Discount: annual.toFixed(2),
      Workbook_Print_Cost: (customParticipants * 19).toFixed(2),
      One_Time_Cost: (((customParticipants * 19) / base) * 100).toFixed(2),
      Annual_CPI_3: (annual * 0.03).toFixed(2),
      Annual_CPI_5: (annual * 0.05).toFixed(2),
    };
    if (discountValue && discountAmount) {
      data.Discount_Value = (discountValue * 100).toFixed(2);
      data.Discount_Amount = discountAmount.toFixed(2);
      data.After_Discount = (base - discountAmount).toFixed(2);
      data.Annual_After_Discount = ((base - discountAmount) * 12).toFixed(2);
    }
    localStorage.setItem("Calculation", JSON.stringify(data));
    setAlertCfg({
      text: "Data Stored For Proposal.",
      icon: "success",
    });
    setAlert(true);
    setTimeout(() => {
      if (!slug) navigate("/create/leadership-workshop-proposal");
      handleCloseBH?.();
    }, 1300);
  };

  const discountOptions = [
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

  return (
    <div className="one-time-workshop">
      {alert && <DescriptionAlerts text={alertCfg.text} icon={alertCfg.icon} />}

      {/* Model Type Header */}
      <div className="pricing-section">
        <div className="pricing-header">
          <span className="pricing-header__label">Workshop Type</span>
          <span className="pricing-header__value">
            One-Time All Day Workshop
          </span>
        </div>

        {/* Level Selection */}
        <div className="form-group">
          <label className="form-label">Select Participant Tier</label>
          <div className="custom-select">
            <button
              className={`custom-select__trigger ${
                isLevelDropdownOpen ? "custom-select__trigger--open" : ""
              }`}
              onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
              type="button"
            >
              <span>{selectedLevel || "Select tier..."}</span>
              <ChevronDown size={20} className="custom-select__icon" />
            </button>

            {isLevelDropdownOpen && (
              <>
                <div
                  className="custom-select__overlay"
                  onClick={() => setIsLevelDropdownOpen(false)}
                />
                <div className="custom-select__dropdown">
                  {Object.keys(levelsData[firstSelectValue]).map((level) => (
                    <button
                      key={level}
                      className={`custom-select__option ${
                        selectedLevel === level
                          ? "custom-select__option--selected"
                          : ""
                      }`}
                      onClick={() => handleSelectChange(level)}
                      type="button"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Participant Range */}
        {selectedLevel && (
          <div className="info-card">
            <span className="info-card__label">Participant Range</span>
            <span className="info-card__value">{participantRange}</span>
          </div>
        )}
      </div>

      {/* Input Fields */}
      {selectedLevel && (
        <div className="pricing-section">
          <h3 className="section-title">Workshop Details</h3>

          <div className="form-group">
            <label className="form-label">Number of Participants</label>
            <input
              type="number"
              className="form-input"
              value={customParticipants ?? ""}
              onChange={(e) => handleParticipantsInput(e.target.value)}
              placeholder="Enter number of participants"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Per Hour Rate ($)</label>
            <input
              type="number"
              className="form-input"
              value={customRate ?? ""}
              onChange={(e) => handleRateInput(e.target.value)}
              placeholder="Enter hourly rate"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Travel Cost ($)</label>
            <input
              type="number"
              className="form-input"
              value={travelCost ?? ""}
              onChange={(e) => handleTravelInput(e.target.value)}
              placeholder="Enter travel cost"
            />
          </div>
        </div>
      )}

      {/* Results */}
      {totalFee !== undefined && (
        <div className="pricing-section">
          <h3 className="section-title">Calculated Fees</h3>

          <div className="result-grid">
            <div className="result-card result-card--primary">
              <span className="result-card__label">Fee (Month or Session)</span>
              <span className="result-card__value">${totalFee.toFixed(2)}</span>
            </div>

            <div className="result-card">
              <span className="result-card__label">Annual Fee</span>
              <span className="result-card__value">
                ${(totalFee * 12).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Discount Selection */}
      {selectedLevel && (
        <div className="pricing-section">
          <div className="form-group">
            <label className="form-label">Apply Discount</label>
            <div className="custom-select">
              <button
                className={`custom-select__trigger ${
                  isDiscountDropdownOpen ? "custom-select__trigger--open" : ""
                }`}
                onClick={() =>
                  setIsDiscountDropdownOpen(!isDiscountDropdownOpen)
                }
                type="button"
              >
                <span>
                  {discountValue !== undefined
                    ? discountOptions.find((opt) => opt.value === discountValue)
                        ?.label
                    : "Select discount..."}
                </span>
                <ChevronDown size={20} className="custom-select__icon" />
              </button>

              {isDiscountDropdownOpen && (
                <>
                  <div
                    className="custom-select__overlay"
                    onClick={() => setIsDiscountDropdownOpen(false)}
                  />
                  <div className="custom-select__dropdown">
                    {discountOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`custom-select__option ${
                          discountValue === option.value
                            ? "custom-select__option--selected"
                            : ""
                        }`}
                        onClick={() => handleDiscountSelect(option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discount Results */}
      {discountAmount !== undefined &&
        discountValue !== 0 &&
        totalFee !== undefined && (
          <div className="pricing-section">
            <h3 className="section-title">After Discount</h3>

            <div className="result-grid">
              <div className="result-card result-card--warning">
                <span className="result-card__label">Discount Amount</span>
                <span className="result-card__value">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>

              <div className="result-card result-card--success">
                <span className="result-card__label">Fee After Discount</span>
                <span className="result-card__value">
                  ${(totalFee - discountAmount).toFixed(2)}
                </span>
              </div>

              <div className="result-card">
                <span className="result-card__label">
                  Annual After Discount
                </span>
                <span className="result-card__value">
                  ${((totalFee - discountAmount) * 12).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Additional Costs */}
      {totalFee !== undefined && customParticipants && (
        <div className="pricing-section">
          <h3 className="section-title">Additional Calculations</h3>

          <div className="info-list">
            <div className="info-item">
              <span className="info-item__label">
                Workbook Print Cost (FedEx) $19
              </span>
              <span className="info-item__value">
                ${(customParticipants * 19).toFixed(2)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-item__label">Print Cost % of One-Time</span>
              <span className="info-item__value">
                {(((customParticipants * 19) / totalFee) * 100).toFixed(2)}%
              </span>
            </div>

            <div className="info-item">
              <span className="info-item__label">Annual CPI 3%</span>
              <span className="info-item__value">
                ${(totalFee * 12 * 0.03).toFixed(2)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-item__label">Annual CPI 5%</span>
              <span className="info-item__value">
                ${(totalFee * 12 * 0.05).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleStoreData}>
          <Plus size={20} />
          Add to Proposal
        </button>

        {discountValue !== undefined && (
          <button
            className="btn btn-secondary"
            onClick={() => setLocationModal(true)}
          >
            <TrendingUp size={20} />
            Show Analysis
          </button>
        )}
      </div>

      {/* Location Modal */}
      {locationModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setLocationModal(false)}
          />
          <div className="modal">
            <div className="modal__content">
              <button
                className="modal__close"
                onClick={() => setLocationModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <h3 className="modal__title">Enter Location</h3>
              <p className="modal__description">
                Please provide your location for detailed market analysis.
              </p>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  value={locationData}
                  onChange={(e) => setLocationData(e.target.value)}
                  placeholder="e.g., New York, USA"
                />
              </div>

              <div className="modal__actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setLocationModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleFeedbackClick}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className="pricing-section feedback-section">
          <h3 className="section-title">Market Analysis</h3>
          {loadingFeedback ? (
            <div className="loading-state">
              <img
                src={BammerVideo}
                alt="Loading..."
                className="loading-icon"
              />
              <p>Analyzing your pricing strategy...</p>
            </div>
          ) : (
            feedback && (
              <div
                className="feedback-content"
                dangerouslySetInnerHTML={{ __html: feedback }}
              />
            )
          )}
        </div>
      )}

      {/* Generate Proposal Button */}
      {showGenerateProposalBtn && (
        <button className="btn btn-primary" onClick={generateProposal}>
          <FileText size={20} />
          Generate AI Proposal
        </button>
      )}

      {/* TinyMCE Editor */}
      {showEditor && proposalContent && (
        <div className="pricing-section editor-section">
          <h3 className="section-title">Edit Proposal</h3>
          <div className="editor-wrapper">
            <Editor
              apiKey="no-key-needed"
              value={proposalContent}
              init={{
                height: 400,
                menubar: false,
                plugins: "lists link table",
                toolbar:
                  "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist",
              }}
              onEditorChange={(content) => setProposalContent(content)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={downloadProposal}
            style={{ marginTop: "1rem" }}
          >
            <Download size={20} />
            Download Proposal
          </button>
        </div>
      )}
    </div>
  );
};

export default OneTimeWorkshopComponent;
