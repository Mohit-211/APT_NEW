import React, { useState } from "react";
import "./Banner.scss";

interface BannerProps {
  CalculatorName?: string;
  CalculatorDesc?: string;
  CalculatorImage?: string;
}

const Banner: React.FC<BannerProps> = ({
  CalculatorName,
  CalculatorDesc,
  CalculatorImage,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="banner">
      <div className="banner__container">
        {/* Text Content */}
        <div className="banner__content">
          {CalculatorName && (
            <h1 className="banner__title">{CalculatorName}</h1>
          )}
          {CalculatorDesc && (
            <p className="banner__description">{CalculatorDesc}</p>
          )}
        </div>

        {/* Image Section */}
        <div className="banner__image-wrapper">
          {/* Custom Skeleton Loader */}
          {!imageLoaded && (
            <div className="banner__skeleton">
              <div className="banner__skeleton-shimmer" />
            </div>
          )}

          {/* Fallback Icon on Error */}
          {imageError ? (
            <div className="banner__fallback">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          ) : (
            <img
              src={CalculatorImage ?? "/assets/apt.png"}
              alt={
                CalculatorName
                  ? `${CalculatorName} illustration`
                  : "Banner illustration"
              }
              className={`banner__image ${
                imageLoaded ? "banner__image--loaded" : ""
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="banner__decoration banner__decoration--1" />
      <div className="banner__decoration banner__decoration--2" />
    </div>
  );
};

export default Banner;
