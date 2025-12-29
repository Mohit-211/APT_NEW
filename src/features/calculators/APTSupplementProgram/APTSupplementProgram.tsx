import React, { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  Users,
  Mic,
  UsersRound,
  Clock,
  GraduationCap,
  Lock,
  AlertCircle,
} from "lucide-react";
import "./APTSupplementProgram.scss";
import Coaching from "./Coaching";
import KeynoteSpeaker from "./KeynoteSpeaker";
import MastermindGroup from "./MastermindGroup";
import TrainingSessionhalfday from "./TrainingSessionhalfday";
import TrainingSessionhours from "./TrainingSessionhours";
import Signin from "@/features/auth/Signin";

// -----------------------------
// TYPES
// -----------------------------
type ProgramType =
  | "Coaching"
  | "KeynoteSpeaker"
  | "MastermindGroup"
  | "TrainingSessionhalfday"
  | "TrainingSessionhours";

type ProgramOption = {
  label: string;
  value: ProgramType;
  icon: React.ReactNode;
  description: string;
  trialLocked: boolean;
};

// -----------------------------
// CONSTANTS
// -----------------------------
const PROGRAM_OPTIONS: ProgramOption[] = [
  {
    label: "Coaching",
    value: "Coaching",
    icon: <Users size={18} />,
    description: "One-on-one or group coaching sessions",
    trialLocked: false,
  },
  {
    label: "Keynote Speaker",
    value: "KeynoteSpeaker",
    icon: <Mic size={18} />,
    description: "Professional keynote speaking engagements",
    trialLocked: true,
  },
  {
    label: "Mastermind Group",
    value: "MastermindGroup",
    icon: <UsersRound size={18} />,
    description: "Collaborative mastermind group sessions",
    trialLocked: true,
  },
  {
    label: "Training Session (Half Day)",
    value: "TrainingSessionhalfday",
    icon: <GraduationCap size={18} />,
    description: "4-hour intensive training workshops",
    trialLocked: true,
  },
  {
    label: "Training Session (1–2 Hours)",
    value: "TrainingSessionhours",
    icon: <Clock size={18} />,
    description: "Short-form training sessions",
    trialLocked: true,
  },
];

// -----------------------------
// COMPONENT
// -----------------------------
const APTSupplementProgram: React.FC = () => {
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramType>("Coaching");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Auth check
  const isToken = localStorage.getItem("UserLoginTokenApt");
  const userStatus = localStorage.getItem("UserStatus");

  if (!isToken) {
    return <Signin />;
  }

  const isTrialUser = userStatus === "ACTIVATE TRIAL";

  // Get current program option
  const currentOption = PROGRAM_OPTIONS.find(
    (opt) => opt.value === selectedProgram
  );

  // Handle program selection
  const handleProgramSelect = (value: ProgramType) => {
    setSelectedProgram(value);
    setIsDropdownOpen(false);
  };

  // Render locked message for trial users
  const renderLockedMessage = (label: string) => (
    <div className="locked-content">
      <div className="locked-content__icon">
        <Lock size={48} />
      </div>
      <h3 className="locked-content__title">Premium Feature</h3>
      <p className="locked-content__message">
        To access <strong>{label}</strong>, please subscribe to our service.
      </p>
      <a href="/pricing" className="btn btn--primary">
        View Subscription Plans
      </a>
    </div>
  );

  // Render program content
  const renderProgram = () => {
    switch (selectedProgram) {
      case "Coaching":
        return <Coaching />;
      case "KeynoteSpeaker":
        return isTrialUser ? (
          renderLockedMessage("Keynote Speaker")
        ) : (
          <KeynoteSpeaker />
        );
      case "MastermindGroup":
        return isTrialUser ? (
          renderLockedMessage("Mastermind Group")
        ) : (
          <MastermindGroup />
        );
      case "TrainingSessionhalfday":
        return isTrialUser ? (
          renderLockedMessage("Training Session (Half Day)")
        ) : (
          <TrainingSessionhalfday />
        );
      case "TrainingSessionhours":
        return isTrialUser ? (
          renderLockedMessage("Training Session (1–2 Hours)")
        ) : (
          <TrainingSessionhours />
        );
      default:
        return null;
    }
  };

  return (
    <div className="apt-supplement">
      {/* Header */}
      <header className="apt-supplement__header">
        <div className="apt-supplement__header-content">
          <h1 className="apt-supplement__title">APT Supplement Programs</h1>
          <p className="apt-supplement__subtitle">
            Select a program type to calculate pricing and generate proposals
          </p>
        </div>
      </header>

      {/* Program Selector */}
      <section className="apt-supplement__selector">
        <div className="form-field" ref={dropdownRef}>
          <label className="form-field__label">Select Program Type</label>
          <div className="select-wrapper">
            <button
              className={`select-trigger select-trigger--large ${
                isDropdownOpen ? "select-trigger--active" : ""
              }`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <div className="select-trigger__content">
                {currentOption && (
                  <>
                    <span className="select-trigger__icon">
                      {currentOption.icon}
                    </span>
                    <div className="select-trigger__text">
                      <span className="select-trigger__label">
                        {currentOption.label}
                      </span>
                      <span className="select-trigger__description">
                        {currentOption.description}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <ChevronDown
                size={20}
                className={`select-trigger__chevron ${
                  isDropdownOpen ? "select-trigger__chevron--rotated" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <ul className="select-dropdown" role="listbox">
                {PROGRAM_OPTIONS.map((option) => {
                  const isLocked = isTrialUser && option.trialLocked;
                  const isSelected = selectedProgram === option.value;
                  return (
                    <li key={option.value}>
                      <button
                        className={`select-option ${
                          isSelected ? "select-option--selected" : ""
                        }`}
                        onClick={() => handleProgramSelect(option.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="select-option__label">
                          {option.label}
                        </span>
                        {isLocked && (
                          <span className="select-option__badge">Premium</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Trial User Notice */}
        {isTrialUser && (
          <div className="trial-notice">
            <AlertCircle size={18} />
            <span>
              You're on a trial plan. Some programs require a subscription to
              access.
            </span>
          </div>
        )}
      </section>

      {/* Program Content */}
      <section className="apt-supplement__content">{renderProgram()}</section>
    </div>
  );
};

export default APTSupplementProgram;
