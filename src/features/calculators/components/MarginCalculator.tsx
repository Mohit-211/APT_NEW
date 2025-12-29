import React, { useEffect, useState } from "react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  Percent,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import { marginCalculator } from "@/features/calculators/functions/marginCalculatorFunction";
import { CalculatorViewApi } from "@/utils/api/Api";
import "./MarginCalculator.scss";

// -----------------------------
// TYPES
// -----------------------------
type MarginCalculatorProps = {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
};

type MarginCalcResult = {
  G: string | number; // Gross Margin %
  M: string | number; // Markup %
  P: string | number; // Gross Profit $
};

type CalculationResult = MarginCalcResult | "negative" | null;

// -----------------------------
// COMPONENT
// -----------------------------
const MarginCalculatorComponent: React.FC<MarginCalculatorProps> = ({
  calculatordetails,
}) => {
  const [cost, setCost] = useState<number | undefined>();
  const [revenue, setRevenue] = useState<number | undefined>();
  const [result, setResult] = useState<CalculationResult>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle input change
  const handleCostChange = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    setCost(num !== undefined && Number.isFinite(num) ? num : undefined);
    setResult(null);
    setError(null);
  };

  const handleRevenueChange = (value: string) => {
    const num = value === "" ? undefined : Number(value);
    setRevenue(num !== undefined && Number.isFinite(num) ? num : undefined);
    setResult(null);
    setError(null);
  };

  // Handle calculation
  const handleSubmit = async () => {
    if (!cost || cost <= 0 || !revenue || revenue <= 0) {
      setResult("negative");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const data = await marginCalculator(cost, revenue);
      setResult(data);
    } catch (err) {
      console.error("Calculation error:", err);
      setError("Error calculating margin. Please try again.");
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle API view tracking
  const handleView = async (id?: string | number) => {
    if (!id) return;
    try {
      await CalculatorViewApi(id);
    } catch (err) {
      console.error("API error:", err);
    }
  };

  // Handle clear
  const handleClear = () => {
    setCost(undefined);
    setRevenue(undefined);
    setResult(null);
    setError(null);
  };

  // Handle calculate with view tracking
  const handleCalculate = () => {
    handleSubmit();
    handleView(calculatordetails?.calculatordetails?.id);
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Format percentage
  const formatPercent = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="margin-calculator">
      {/* Header */}
      <header className="calc-header">
        <div className="calc-header__icon">
          <Calculator size={24} />
        </div>
        <div className="calc-header__content">
          <h2 className="calc-header__title">Margin Calculator</h2>
          <p className="calc-header__subtitle">
            Calculate gross margin, markup, and profit from cost and revenue
          </p>
        </div>
      </header>

      {/* Input Card */}
      <section className="calc-card">
        <div className="calc-card__header">
          <h3 className="calc-card__title">
            <DollarSign size={18} />
            Enter Values
          </h3>
        </div>
        <div className="calc-card__body">
          <div className="input-grid">
            <div className="form-field">
              <label className="form-field__label">
                <DollarSign size={16} />
                Cost
              </label>
              <div className="input-wrapper">
                <span className="input-wrapper__prefix">$</span>
                <input
                  type="number"
                  className="form-input form-input--with-prefix"
                  value={cost ?? ""}
                  onChange={(e) => handleCostChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <span className="form-field__hint">
                The cost of goods or services
              </span>
            </div>

            <div className="form-field">
              <label className="form-field__label">
                <TrendingUp size={16} />
                Revenue
              </label>
              <div className="input-wrapper">
                <span className="input-wrapper__prefix">$</span>
                <input
                  type="number"
                  className="form-input form-input--with-prefix"
                  value={revenue ?? ""}
                  onChange={(e) => handleRevenueChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <span className="form-field__hint">
                The selling price or revenue
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-bar">
            <button
              className="btn btn--ghost"
              onClick={handleClear}
              type="button"
            >
              <RotateCcw size={18} />
              Clear
            </button>
            <button
              className="btn btn--primary"
              onClick={handleCalculate}
              disabled={isCalculating}
              type="button"
            >
              <Calculator size={18} />
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Card */}
      {result && (
        <section className="calc-card calc-card--results">
          <div className="calc-card__header">
            <h3 className="calc-card__title">
              <BarChart3 size={18} />
              Results
            </h3>
          </div>
          <div className="calc-card__body">
            {result === "negative" ? (
              <div className="error-state">
                <AlertCircle size={32} />
                <p className="error-state__text">
                  Please enter Cost and Revenue values greater than 0
                </p>
              </div>
            ) : (
              <div className="results-grid">
                <div className="result-tile result-tile--primary">
                  <div className="result-tile__icon">
                    <Percent size={24} />
                  </div>
                  <div className="result-tile__content">
                    <span className="result-tile__label">Gross Margin</span>
                    <span className="result-tile__value">
                      {formatPercent(result.G)}
                    </span>
                  </div>
                </div>

                <div className="result-tile result-tile--secondary">
                  <div className="result-tile__icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="result-tile__content">
                    <span className="result-tile__label">Markup</span>
                    <span className="result-tile__value">
                      {formatPercent(result.M)}
                    </span>
                  </div>
                </div>

                <div className="result-tile result-tile--success">
                  <div className="result-tile__icon">
                    <PiggyBank size={24} />
                  </div>
                  <div className="result-tile__content">
                    <span className="result-tile__label">Gross Profit</span>
                    <span className="result-tile__value">
                      {formatCurrency(result.P)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Formula Reference */}
      {result && result !== "negative" && (
        <section className="calc-card calc-card--info">
          <div className="calc-card__header">
            <h3 className="calc-card__title">
              <Calculator size={18} />
              Formulas Used
            </h3>
          </div>
          <div className="calc-card__body">
            <div className="formula-list">
              <div className="formula-item">
                <span className="formula-item__name">Gross Margin</span>
                <code className="formula-item__formula">
                  ((Revenue - Cost) / Revenue) × 100
                </code>
              </div>
              <div className="formula-item">
                <span className="formula-item__name">Markup</span>
                <code className="formula-item__formula">
                  ((Revenue - Cost) / Cost) × 100
                </code>
              </div>
              <div className="formula-item">
                <span className="formula-item__name">Gross Profit</span>
                <code className="formula-item__formula">Revenue - Cost</code>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MarginCalculatorComponent;
