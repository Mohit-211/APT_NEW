import React, { useState } from "react";

import "./DirectionSteps.scss";
import { stepsData } from "./stepsData";

const DirectionSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleNext = () => {
    if (currentStep < stepsData.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="steps-container">
      <h2 className="step-title">
        {stepsData[currentStep].title}
      </h2>

      <p className="step-description">
        {stepsData[currentStep].description}
      </p>

      <div className="buttons">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === stepsData.length - 1}
        >
          Next
        </button>
      </div>

      <span className="step-count">
        Step {currentStep + 1} of {stepsData.length}
      </span>
    </div>
  );
};

export default DirectionSteps;
