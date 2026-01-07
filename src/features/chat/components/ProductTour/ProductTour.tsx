import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ProductTour.scss";

interface TourStep {
  id: number;
  title: string;
  description: string;
  targetId: string;
}

interface Spotlight {
  top: number;
  left: number;
  width: number;
  height: number;
}

const steps: TourStep[] = [
  {
    id: 1,
    title: "Select Business",
    description: "Choose the business you want to work with.",
    targetId: "tour-business",
  },
  {
    id: 2,
    title: "Choose Template",
    description: "Select a proposal template.",
    targetId: "tour-template",
  },
  {
    id: 3,
    title: "Auto / Manual Pricing",
    description:
      "Select Auto Fetch Pricing to fetch pricing automatically or choose Manual Pricing to enter prices manually.",
    targetId: "tour-pricing",
  },
  {
    id: 4,
    title: "Write Prompt",
    description: "Describe what you want Ceddie to generate.",
    targetId: "tour-prompt",
  },
  {
    id: 5,
    title: "Send",
    description: "Generate your proposal instantly.",
    targetId: "tour-send",
  },
];

const ProductTour: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [index, setIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<Spotlight>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = document.getElementById(steps[index].targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = 6;

    setSpotlight({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding + window.scrollX,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    el.classList.add("tour-highlight");
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => el.classList.remove("tour-highlight");
  }, [index]);

  return (
    <AnimatePresence>
      <motion.div
        className="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* RECTANGLE SPOTLIGHT */}
        <motion.div
          className="spotlight"
          animate={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        />

        {/* TOOLTIP */}
        <motion.div
          className="tour-tooltip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          style={{ pointerEvents: "auto" }} // ONLY tooltip is clickable
        >
          <h3>{steps[index].title}</h3>
          <p>{steps[index].description}</p>

          <div className="tour-actions">
            <span>{index + 1}/{steps.length}</span>
            <button
              onClick={() => {
                if (index < steps.length - 1) {
                  setIndex(index + 1);
                } else {
                  onFinish();
                }
              }}
            >
              {index === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductTour;
