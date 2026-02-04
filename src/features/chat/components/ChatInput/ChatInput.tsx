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
import { GetBusiness, GetTemplates } from "@/utils/api/Api";
import ProductTour from "../ProductTour/ProductTour";

/* ICON CASTING */
const FiSend = FiSendRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsBuilding = BsBuildingRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsFileText = BsFileTextRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsCurrencyDollar =
  BsCurrencyDollarRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const BsChevronDown =
  BsChevronDownRaw as React.FC<React.SVGProps<SVGSVGElement>>;

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
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<APTTemplate | null>(null);

  const [pricingMode, setPricingMode] = useState<"auto" | "manual">("auto");
  const [manualPricing, setManualPricing] = useState("");

  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showPricingDropdown, setShowPricingDropdown] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const businessDropdownRef = useRef<HTMLDivElement>(null);
  const pricingDropdownRef = useRef<HTMLDivElement>(null);

  /* =======================
     FETCH BUSINESSES
  ======================= */
  const fetchBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const res = await GetBusiness();
      setBusinesses(res?.data?.data || []);
    } catch {
      antdMessage.error("Unable to load businesses");
    } finally {
      setLoadingBusinesses(false);
    }
  };

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
     CLOSE DROPDOWNS
  ======================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        businessDropdownRef.current &&
        !businessDropdownRef.current.contains(e.target as Node)
      ) {
        setShowBusinessDropdown(false);
      }
      if (
        pricingDropdownRef.current &&
        !pricingDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPricingDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* =======================
     RESTORE FROM CHAT
  ======================= */
  useEffect(() => {
    if (!currentConversation) return;

    (async () => {
      try {
        await fetchBusinesses();

        const chat = currentConversation?.chats?.[0];
        if (!chat) return;

        // BUSINESS
        const business = businesses.find(
          (b) => b.id === chat.business_id
        );
        if (business) setSelectedBusiness(business);

        // TEMPLATE
        const res = await GetTemplates();
        const templates: APTTemplate[] = res?.data?.data || [];
        const template = templates.find(
          (t) => t.id === chat.template_id
        );
        if (template) setSelectedTemplate(template);
      } catch {
        antdMessage.error("Failed to restore conversation data");
      }
    })();
  }, [currentConversation]);

  /* =======================
     SEND MESSAGE
  ======================= */
  const handleSend = () => {
    if (!message.trim()) return antdMessage.error("Enter a message");
    if (!selectedBusiness) return antdMessage.error("Select a business");
    if (!selectedTemplate) return antdMessage.error("Select a template");
    if (pricingMode === "manual" && !manualPricing.trim())
      return antdMessage.error("Enter manual pricing");

    onSendMessage({
      text: message.trim(),
      template_id: selectedTemplate.id,
      business_id: selectedBusiness.id,
      auto_price: pricingMode === "auto",
      manual_price: pricingMode === "manual" ? manualPricing : undefined,
    });

    setMessage("");
    setManualPricing("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  /* =======================
     TEXTAREA AUTO RESIZE
  ======================= */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="chat-input-wrapper">
      <button className="tour-btn" onClick={() => setShowTour(true)}>
        <FaLightbulb /> How to Use
      </button>

      <div className="chat-input-container">
        {/* OPTIONS */}
        <div className="options-row">
          {/* BUSINESS */}
          <div ref={businessDropdownRef} className="option-item">
            <button
              className={`option-btn ${selectedBusiness ? "active" : ""}`}
              onClick={() => {
                setShowBusinessDropdown((p) => !p);
                fetchBusinesses();
              }}
            >
              <BsBuilding />
              <span>{selectedBusiness?.name || "Business"}</span>
              <BsChevronDown />
            </button>

            {showBusinessDropdown && (
              <div className="compact-dropdown">
                {loadingBusinesses ? (
                  <div className="dropdown-option">Loading...</div>
                ) : (
                  businesses.map((b) => (
                    <div
                      key={b.id}
                      className="dropdown-option"
                      onClick={() => {
                        setSelectedBusiness(b);
                        setShowBusinessDropdown(false);
                      }}
                    >
                      {b.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* TEMPLATE */}
          <button
            className={`option-btn ${selectedTemplate ? "active" : ""}`}
            onClick={() => setIsTemplateModalOpen(true)}
          >
            <BsFileText />
            <span>{selectedTemplate?.name || "Template"}</span>
          </button>

          {/* PRICING */}
          <div ref={pricingDropdownRef} className="option-item">
            <button
              className="option-btn"
              onClick={() => setShowPricingDropdown((p) => !p)}
            >
              <BsCurrencyDollar />
              <span>{pricingMode === "auto" ? "Auto Pricing" : "Manual Pricing"}</span>
              <BsChevronDown />
            </button>

            {showPricingDropdown && (
              <div className="compact-dropdown">
                <div onClick={() => setPricingMode("auto")}>Auto Pricing</div>
                <div onClick={() => setPricingMode("manual")}>Manual Pricing</div>
              </div>
            )}
          </div>

          {pricingMode === "manual" && (
            <input
              className="manual-pricing-input"
              placeholder="Enter pricing"
              value={manualPricing}
              onChange={(e) => setManualPricing(e.target.value)}
            />
          )}
        </div>

        {/* INPUT */}
        <div className="chat-input-box">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            placeholder="Ask Ceddie..."
          />
          <button className="send-button" onClick={handleSend}>
            <FiSend />
          </button>
        </div>
      </div>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={(t) => {
          setSelectedTemplate(t);
          onTemplateSelect?.(t);
        }}
        selectedTemplate={selectedTemplate}
      />

      {showTour && <ProductTour onFinish={() => setShowTour(false)} />}
    </div>
  );
};

export default ChatInput;
