import React, { useEffect, useState } from "react";
import { ChevronDown, Lock, Check } from "lucide-react";
import SoftSkillPricing from "@/features/calculators/components/utils/Soft_Skill_Pricing";
import OneTimeWorkshopComponent from "@/features/calculators/components/utils/One_Time";
import AssessmentPrograms from "@/features/calculators/components/utils/AssessmentPrograms";
import Lms from "@/features/calculators/components/utils/Lms";
import { CalculatorViewApi } from "@/utils/api/Api";
import "./AdvancedPrice.scss";

type AdvancedPriceProps = {
  calculatordetails?: any;
  handleCloseBH?: () => void;
};

interface PricingOption {
  value: string;
  label: string;
  description: string;
  requiresSubscription?: boolean;
}

const pricingOptions: PricingOption[] = [
  {
    value: "Soft Skill",
    label: "Soft Skill Pricing Model",
    description: "Comprehensive soft skills training programs",
    requiresSubscription: false,
  },
  {
    value: "One_Time",
    label: "One Time All Day Workshop",
    description: "Full-day intensive workshop pricing",
    requiresSubscription: true,
  },
  {
    value: "AssessmentPrograms",
    label: "Assessment Programs",
    description: "Professional assessment and evaluation tools",
    requiresSubscription: true,
  },
  {
    value: "Lms",
    label: "LMS",
    description: "Learning Management System pricing",
    requiresSubscription: true,
  },
];

const AdvancedPrice: React.FC<AdvancedPriceProps> = ({
  calculatordetails,
  handleCloseBH,
}) => {
  const UserStatus = localStorage.getItem("UserStatus");
  const [selectedOption, setSelectedOption] = useState("Soft Skill");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const isBlocked = UserStatus === "ACTIVATE TRIAL";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!hasViewed && calculatordetails?.calculatordetails?.id) {
      handleView();
      setHasViewed(true);
    }
  }, [calculatordetails, hasViewed]);

  const handleView = async () => {
    try {
      const id = calculatordetails?.calculatordetails?.id;
      if (id) {
        await CalculatorViewApi(id);
      }
    } catch (err) {
      console.error("Error loading calculator details:", err);
    }
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    setIsDropdownOpen(false);
  };

  const selectedPricingOption = pricingOptions.find(
    (opt) => opt.value === selectedOption
  );

  const isCurrentOptionBlocked =
    selectedPricingOption?.requiresSubscription && isBlocked;

  const renderContent = () => {
    if (isCurrentOptionBlocked) {
      return (
        <div className="advanced-price__locked">
          <div className="locked-content">
            <div className="locked-content__icon">
              <Lock size={48} />
            </div>
            <h3 className="locked-content__title">Premium Feature</h3>
            <p className="locked-content__description">
              To access <strong>{selectedPricingOption?.label}</strong>, please
              upgrade to our premium subscription.
            </p>
            <a
              href="https://www.sendowl.com/s/digital/automated-pricing-tool-by-lafleur-leadership-books/"
              target="_blank"
              rel="noopener noreferrer"
              className="locked-content__button"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      );
    }

    switch (selectedOption) {
      case "Soft Skill":
        return <SoftSkillPricing handleCloseBH={handleCloseBH} />;
      case "One_Time":
        return <OneTimeWorkshopComponent handleCloseBH={handleCloseBH} />;
      case "AssessmentPrograms":
        return <AssessmentPrograms handleCloseBH={handleCloseBH} />;
      case "Lms":
        return <Lms handleCloseBH={handleCloseBH} />;
      default:
        return null;
    }
  };

  return (
    <div className="advanced-price">
      {/* Pricing Model Selector */}
      <div className="advanced-price__header">
        <label className="advanced-price__label">Select Pricing Model</label>

        <div className="custom-select">
          <button
            className={`custom-select__trigger ${
              isDropdownOpen ? "custom-select__trigger--open" : ""
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            type="button"
          >
            <div className="custom-select__value">
              <span className="custom-select__label">
                {selectedPricingOption?.label}
              </span>
              {selectedPricingOption?.description && (
                <span className="custom-select__description">
                  {selectedPricingOption.description}
                </span>
              )}
            </div>
            <ChevronDown size={20} className="custom-select__icon" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="custom-select__overlay"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="custom-select__dropdown">
                {pricingOptions.map((option) => {
                  const isSelected = option.value === selectedOption;
                  const isLocked = option.requiresSubscription && isBlocked;

                  return (
                    <button
                      key={option.value}
                      className={`custom-select__option ${
                        isSelected ? "custom-select__option--selected" : ""
                      } ${isLocked ? "custom-select__option--locked" : ""}`}
                      onClick={() => handleOptionSelect(option.value)}
                      disabled={isLocked}
                      type="button"
                    >
                      <div className="custom-select__option-content">
                        <div className="custom-select__option-header">
                          <span className="custom-select__option-label">
                            {option.label}
                          </span>
                          {isSelected && (
                            <Check size={16} className="custom-select__check" />
                          )}
                          {isLocked && (
                            <Lock size={16} className="custom-select__lock" />
                          )}
                        </div>
                        <span className="custom-select__option-description">
                          {option.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="advanced-price__content">{renderContent()}</div>
    </div>
  );
};

export default AdvancedPrice;
