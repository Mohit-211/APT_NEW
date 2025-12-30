import React, { useRef, useState, useEffect } from "react";
import "./ChatInput.scss";
import TemplateModal, { APTTemplate } from "./TemplateModal/TemplateModal";

/* ICONS */
import { FiSend as FiSendRaw } from "react-icons/fi";
import {
  BsBuilding as BsBuildingRaw,
  BsFileText as BsFileTextRaw,
  BsCurrencyDollar as BsCurrencyDollarRaw,
  BsChevronDown as BsChevronDownRaw,
} from "react-icons/bs";
import { message as antdMessage } from "antd";
import { GetBusiness } from "@/utils/api/Api";

const FiSend = FiSendRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsBuilding = BsBuildingRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsFileText = BsFileTextRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsCurrencyDollar = BsCurrencyDollarRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsChevronDown = BsChevronDownRaw as React.FC<React.SVGProps<SVGSVGElement>>;

/* =======================
   TYPES
======================= */
export interface Business {
  id: number;
  name: string;
  location?: string;
}

interface ChatInputProps {
  onSendMessage: (data: {
    text: string;
    template_id: number;
    business_id: number;
    auto_price: boolean;
    manual_price?: string;
  }) => void;
  resetTrigger: number | string | boolean; // Trigger to reset input
  onTemplateSelect?: (template: APTTemplate) => void;
  currentConversation?: any;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  resetTrigger,
  onTemplateSelect,
  currentConversation,
}) => {
  const [message, setMessage] = useState("");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<APTTemplate | null>(null);

  const [pricingMode, setPricingMode] = useState<"auto" | "manual">("auto");
  const [manualPricing, setManualPricing] = useState("");

  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showPricingDropdown, setShowPricingDropdown] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const businessDropdownRef = useRef<HTMLDivElement | null>(null);
  const pricingDropdownRef = useRef<HTMLDivElement | null>(null);

  /* =======================
     FETCH BUSINESSES
  ======================= */
  useEffect(() => {
    setLoadingBusinesses(true);
    GetBusiness()
      .then((res) => {
        setBusinesses(res?.data?.data || []);
      })
      .catch(() => {
        antdMessage.error("Unable to load businesses");
      })
      .finally(() => {
        setLoadingBusinesses(false);
      });
  }, []);

  /* =======================
     AUTO-SELECT BUSINESS
  ======================= */
  const conversationChat = currentConversation?.chats?.[0];
  const conversationBusinessId = conversationChat?.business_id;
  const conversationTemplateId = conversationChat?.template_id;

  useEffect(() => {
    if (!conversationBusinessId || businesses.length === 0) return;
    const matchedBusiness = businesses.find((b) => b.id === conversationBusinessId);
    if (matchedBusiness) setSelectedBusiness(matchedBusiness);
  }, [conversationBusinessId, businesses]);

  /* =======================
     RESET INPUT ON TRIGGER
  ======================= */
  useEffect(() => {
    // Clear input, manual pricing
    setMessage("");
    setManualPricing("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Clear selected business & template when new chat is opened
    setSelectedBusiness(null);
    setSelectedTemplate(null);
  }, [resetTrigger]);

  /* =======================
     CLOSE DROPDOWNS
  ======================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        businessDropdownRef.current &&
        !businessDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBusinessDropdown(false);
      }
      if (
        pricingDropdownRef.current &&
        !pricingDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPricingDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =======================
     SEND MESSAGE
  ======================= */
  const handleSend = () => {
    if (!message.trim()) {
      antdMessage.error("Please enter a message");
      return;
    }

    if (!selectedBusiness) {
      antdMessage.error("Please select a business");
      return;
    }

    const templateId = selectedTemplate?.id ?? conversationTemplateId;
    if (!templateId) {
      antdMessage.error("Please select a template");
      return;
    }

    if (pricingMode === "manual" && !manualPricing.trim()) {
      antdMessage.error("Please enter manual pricing");
      return;
    }

    onSendMessage({
      text: message.trim(),
      template_id: templateId,
      business_id: selectedBusiness.id,
      auto_price: pricingMode === "auto",
      manual_price: pricingMode === "manual" ? manualPricing.trim() : undefined,
    });

    setMessage("");
    setManualPricing("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  /* =======================
     INPUT HANDLERS
  ======================= */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplatePick = (template: APTTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateModalOpen(false);
    onTemplateSelect?.(template);
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-container">
        {/* OPTIONS */}
        <div className="options-row">
          {/* BUSINESS */}
          <div className="option-item" ref={businessDropdownRef}>
            <button
              className={`option-btn ${selectedBusiness ? "active" : ""}`}
              onClick={() => setShowBusinessDropdown((p) => !p)}
              disabled={loadingBusinesses}
            >
              <BsBuilding />
              <span>{selectedBusiness ? selectedBusiness.name : "Business"}</span>
              <BsChevronDown />
            </button>

            {showBusinessDropdown && (
              <div className="compact-dropdown">
                {businesses.map((b) => (
                  <div
                    key={b.id}
                    className={`dropdown-option ${
                      selectedBusiness?.id === b.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedBusiness(b);
                      setShowBusinessDropdown(false);
                    }}
                  >
                    <span className="name">{b.name}</span>
                    {b.location && <span className="location">{b.location}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TEMPLATE */}
          <button
            className={`option-btn ${
              selectedTemplate || conversationTemplateId ? "active" : ""
            }`}
            onClick={() => setIsTemplateModalOpen(true)}
          >
            <BsFileText />
            <span>
              {selectedTemplate
                ? selectedTemplate.name
                : conversationTemplateId
                ? `Template #${conversationTemplateId}`
                : "Template"}
            </span>
          </button>

          {/* PRICING */}
          <div className="option-item" ref={pricingDropdownRef}>
            <button
              className={`option-btn ${pricingMode === "manual" ? "active" : ""}`}
              onClick={() => setShowPricingDropdown((p) => !p)}
            >
              <BsCurrencyDollar />
              <span>{pricingMode === "auto" ? "Auto Pricing" : "Manual Pricing"}</span>
              <BsChevronDown />
            </button>

            {showPricingDropdown && (
              <div className="compact-dropdown">
                <div
                  className={`dropdown-option ${pricingMode === "auto" ? "selected" : ""}`}
                  onClick={() => {
                    setPricingMode("auto");
                    setShowPricingDropdown(false);
                  }}
                >
                  Auto Fetch Pricing
                </div>
                <div
                  className={`dropdown-option ${pricingMode === "manual" ? "selected" : ""}`}
                  onClick={() => {
                    setPricingMode("manual");
                    setShowPricingDropdown(false);
                  }}
                >
                  Manual Pricing
                </div>
              </div>
            )}
          </div>

          {pricingMode === "manual" && (
            <input
              type="text"
              className="manual-pricing-input"
              placeholder="Enter pricing..."
              value={manualPricing}
              onChange={(e) => setManualPricing(e.target.value)}
            />
          )}
        </div>

        {/* INPUT */}
        <div className="chat-input-box">
          <span className="char-count">{message.length}/3000</span>
          <textarea
            ref={textareaRef}
            value={message}
            placeholder="Ask Ceddie..."
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={3000}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={
              !message.trim() ||
              !selectedBusiness ||
              (!selectedTemplate && !conversationTemplateId) ||
              (pricingMode === "manual" && !manualPricing.trim())
            }
          >
            <FiSend />
          </button>
        </div>
      </div>

      {/* TEMPLATE MODAL */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplatePick}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
};

export default ChatInput;
