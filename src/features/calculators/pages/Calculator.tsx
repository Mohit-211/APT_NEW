import React, { useEffect, useState, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator as CalculatorIcon } from "lucide-react";
import Banner from "@/components/layout/Banner";
import Signin from "@/features/auth/Signin";
import { GetCalculatorDescription } from "@/utils/api/Api";
import { Image_URL } from "@/utils/constants/host";
import "./Calculator.scss";

interface CalculatorProps {
  children: ReactNode;
}

interface CalculatorDetails {
  calculator_name?: string;
  description?: string;
  file_name?: string;
  profit_margin_formula?: string;
}

const Calculator: React.FC<CalculatorProps> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const category_slug = pathname.split("/")[2];

  const [calculatorDetails, setCalculatorDetails] =
    useState<CalculatorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isToken = localStorage.getItem("UserLoginTokenApt");
  const userStatus = localStorage.getItem("UserStatus");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if (category_slug) {
      setIsLoading(true);
      GetCalculatorDescription(category_slug)
        .then((res) => {
          setCalculatorDetails(res?.data?.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("API Error:", err);
          setIsLoading(false);
        });
    }
  }, [category_slug]);

  // Auth check
  if (!isToken || userStatus === "DEACTIVATE") {
    return <Signin />;
  }

  const calculatorName =
    calculatorDetails?.calculator_name ??
    category_slug?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="calculator-wrapper">
      {/* Banner Section */}
      <Banner
        CalculatorDesc={calculatorDetails?.description}
        CalculatorName={calculatorName}
        CalculatorImage={
          calculatorDetails?.file_name
            ? Image_URL + calculatorDetails.file_name
            : undefined
        }
      />

      {/* Main Content */}
      <div className="calculator-content">
        <div className="calculator-container">
          {/* Back Button */}
          <button
            className="calculator-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Calculator Header */}
          <div className="calculator-header">
            <div className="calculator-header__icon">
              <CalculatorIcon size={24} />
            </div>
            <div className="calculator-header__content">
              <h1 className="calculator-header__title">{calculatorName}</h1>
              {calculatorDetails?.description && (
                <p className="calculator-header__description">
                  {calculatorDetails.description}
                </p>
              )}
            </div>
          </div>

          {/* Calculator Body */}
          <div className="calculator-body">
            {isLoading ? (
              <div className="calculator-loading">
                <div className="loading-spinner" />
                <p>Loading calculator...</p>
              </div>
            ) : (
              <>
                <div className="calculator-content-card">
                  {React.Children.map(children, (child) => {
                    if (!React.isValidElement(child)) return child;
                    return React.cloneElement(
                      child as React.ReactElement<any>,
                      {
                        calculatordetails: calculatorDetails,
                      } as any
                    );
                  })}
                </div>

                {/* Formula/Additional Info Section */}
                {calculatorDetails?.profit_margin_formula && (
                  <div className="calculator-info-section">
                    <div
                      className="calculator-formula"
                      dangerouslySetInnerHTML={{
                        __html: calculatorDetails.profit_margin_formula,
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
