import React, { useRef, useState, useEffect } from "react";
import "./ChatInput.scss";
import TemplateModal, { APTTemplate } from "./TemplateModal/TemplateModal";
import { FaLightbulb } from "react-icons/fa6";

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
import ProductTour from "../ProductTour/ProductTour";

/* ICON CASTING */
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
  resetTrigger: number | string | boolean;
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
  const [showTour, setShowTour] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const businessDropdownRef = useRef<HTMLDivElement>(null);
  const pricingDropdownRef = useRef<HTMLDivElement>(null);

  /* =======================
     FETCH BUSINESSES
  ======================= */
  useEffect(() => {
    setLoadingBusinesses(true);
    GetBusiness()
      .then((res) => setBusinesses(res?.data?.data || []))
      .catch(() => antdMessage.error("Unable to load businesses"))
      .finally(() => setLoadingBusinesses(false));
  }, []);

  /* =======================
     AUTO SELECT BUSINESS & TEMPLATE
  ======================= */
  useEffect(() => {
    const conversationChat = currentConversation?.chats?.[0];
    if (!conversationChat || !businesses.length) return;

    const matchedBusiness = businesses.find((b) => b.id === conversationChat.business_id);
    if (matchedBusiness) setSelectedBusiness(matchedBusiness);

    if (conversationChat.template_id) {
      setSelectedTemplate({
        id: conversationChat.template_id,
        name: `Template #${conversationChat.template_id}`,
        category: "Unknown",
        description: "",
        preview: "",
        features: [] as string[], // cast as array of strings if features expects string[]
      } as APTTemplate); // cast the whole object as APTTemplate
    }
  }, [currentConversation, businesses]);

  /* =======================
     RESET ON NEW CHAT
  ======================= */
  useEffect(() => {
    setMessage("");
    setManualPricing("");
    setSelectedBusiness(null);
    setSelectedTemplate(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [resetTrigger]);

  /* =======================
     CLOSE DROPDOWNS ON CLICK OUTSIDE
  ======================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(e.target as Node)) {
        setShowBusinessDropdown(false);
      }
      if (pricingDropdownRef.current && !pricingDropdownRef.current.contains(e.target as Node)) {
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
    if (!message.trim()) return antdMessage.error("Please enter a message");
    if (!selectedBusiness) return antdMessage.error("Please select a business");
    if (!selectedTemplate?.id) return antdMessage.error("Please select a template");
    if (pricingMode === "manual" && !manualPricing.trim())
      return antdMessage.error("Please enter manual pricing");

    onSendMessage({
      text: message.trim(),
      template_id: selectedTemplate.id,
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      {/* START TOUR BUTTON */}
      <div style={{ marginBottom: 10 }}>
        <button className="tour-btn" onClick={() => setShowTour(true)}>
          <FaLightbulb style={{ marginRight: 6 }} />
          How to Use
        </button>
      </div>

      <div className="chat-input-container">
        {/* OPTIONS ROW */}
        <div className="options-row">
          {/* BUSINESS */}
          <div className="option-item" ref={businessDropdownRef} id="tour-business">
            <button
              className={`option-btn ${selectedBusiness ? "active" : ""}`}
              onClick={() => setShowBusinessDropdown((prev) => !prev)}
              disabled={loadingBusinesses}
            >
              <BsBuilding />
              <span>{selectedBusiness?.name || "Business"}</span>
              <BsChevronDown />
            </button>
            {showBusinessDropdown && (
              <div className="compact-dropdown">
                {businesses.map((b) => (
                  <div
                    key={b.id}
                    className={`dropdown-option ${selectedBusiness?.id === b.id ? "selected" : ""}`}
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
            className={`option-btn ${selectedTemplate ? "active" : ""}`}
            onClick={() => setIsTemplateModalOpen(true)}
            id="tour-template"
          >
            <BsFileText />
            <span>{selectedTemplate?.name || "Template"}</span>
          </button>

          {/* PRICING */}
          <div className="option-item" ref={pricingDropdownRef} id="tour-pricing">
            <button
              className={`option-btn ${pricingMode === "manual" ? "active" : ""}`}
              onClick={() => setShowPricingDropdown((prev) => !prev)}
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

          {/* MANUAL PRICING INPUT */}
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

        {/* MESSAGE INPUT */}
        <div className="chat-input-box" id="tour-prompt">
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
              !selectedTemplate ||
              (pricingMode === "manual" && !manualPricing.trim())
            }
            id="tour-send"
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

      {/* PRODUCT TOUR */}
      {showTour && <ProductTour onFinish={() => setShowTour(false)} />}
    </div>
  );
};

export default ChatInput;
