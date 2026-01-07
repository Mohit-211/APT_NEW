import React, { useState } from "react";
import "./ChatGuide.scss";

type Step = 1 | 2 | 3 | 4;

const ChatGuide: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  // const [visible, setVisible] = useState<boolean>(() => {
  //   return localStorage.getItem("chatGuideDone") !== "true";
  // });

   const [visible, setVisible] = useState<boolean>(true);

  if (!visible) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    } else {
      // ✅ Done → close guide
      // localStorage.setItem("chatGuideDone", "true");         //when close tab and not refresh, the guide will show again
      setVisible(false);
    }
  };

  return (
    <div className="chat-guide-wrapper">
      <div className="chat-guide">
        <div className={`guide-step ${step >= 1 ? "active" : ""}`}>
          <span>1</span>
          <p>Select Business</p>
        </div>

        <div className={`guide-step ${step >= 2 ? "active" : ""}`}>
          <span>2</span>
          <p>Choose Template</p>
        </div>

        <div className={`guide-step ${step >= 3 ? "active" : ""}`}>
          <span>3</span>
          <p>Write Your Prompt</p>
        </div>

        <div className={`guide-step ${step >= 4 ? "active" : ""}`}>
          <span>4</span>
          <p>Generate Proposal</p>
        </div>

        <button className="guide-next" onClick={handleNext}>
          {step === 4 ? "Done" : "Next"}
        </button>
      </div>

      <p className="guide-instruction">
        {step === 1 && "Select a business to continue"}
        {step === 2 && "Choose a template"}
        {step === 3 && "Write your prompt"}
        {step === 4 && "Send your message"}
      </p>
    </div>
  );
};

export default ChatGuide;
