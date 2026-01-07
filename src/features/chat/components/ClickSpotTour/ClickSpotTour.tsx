import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ClickSpotTour.scss";

const steps = [
  "tour-business",     // Step 1: Business dropdown
  "tour-template",     // Step 2: Template dropdown
  "tour-auto-price",   // Step 3: Auto pricing
  "tour-manual-price", // Step 4: Manual pricing
];

interface SpotlightRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  radius: number;
}

const ClickSpotTour: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [index, setIndex] = useState(0);
  const [spot, setSpot] = useState<SpotlightRect>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    radius: 12,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById(steps[index]);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const padding = 10;

      setSpot({
        top: rect.top - padding,
        left: rect.left - padding,
        right: window.innerWidth - rect.right - padding,
        bottom: window.innerHeight - rect.bottom - padding,
        radius: Math.min(16, rect.height / 2),
      });

      el.classList.add("click-spot-active");
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      const handleClick = () => {
        el.classList.remove("click-spot-active");

        if (index < steps.length - 1) {
          setIndex((prev) => prev + 1);
        } else {
          localStorage.setItem("clickSpotDone", "true");
          onFinish();
        }
      };

      el.addEventListener("click", handleClick);

      return () => {
        el.removeEventListener("click", handleClick);
        el.classList.remove("click-spot-active");
      };
    }, 250);

    return () => clearTimeout(timer);
  }, [index, onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        className="click-spot-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="click-spot-light"
          animate={{
            clipPath: `inset(
              ${spot.top}px
              ${spot.right}px
              ${spot.bottom}px
              ${spot.left}px
              round ${spot.radius}px
            )`,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 28,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ClickSpotTour;
