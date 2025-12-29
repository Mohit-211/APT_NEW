import { useEffect, useState } from "react";
import {
  Calculator,
  DollarSign,
  Percent,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  PiggyBank,
  Tag,
} from "lucide-react";
import { priceCalculator } from "@/features/calculators/functions/priceCalculatorFunction";
import { CalculatorViewApi } from "@/utils/api/Api";
import "./PriceCalculator.scss";

// -----------------------------
// TYPES
// -----------------------------
interface PriceCalculatorProps {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
}

type PriceCalcResult = {
  R: string | number; // Price
  P: string | number; // Profit
  M: string | number; // Mark Up %
} | null;

type CalculationResult = PriceCalcResult | "negative" | null;

// -----------------------------
// COMPONENT
// -----------------------------
export default function PriceCalculatorComponent({
  calculatordetails = {},
}: PriceCalculatorProps) {
  const [cost, setCost] = useState<string>("");
  const [grossMargin, setGrossMargin] = useState<string>("");
  const [result, setResult] = useState<CalculationResult>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle input changes
  const handleCostChange = (value: string) => {
    setCost(value);
    setResult(null);
    setError(null);
  };

  const handleMarginChange = (value: string) => {
    setGrossMargin(value);
    setResult(null);
    setError(null);
  };

  // Handle calculation
  const handleSubmit = async () => {
    if (!cost || !grossMargin) {
      setError("Please enter both cost and gross margin.");
      return;
    }

    const costNum = Number(cost);
    const marginNum = Number(grossMargin);

    if (costNum <= 0 || marginNum <= 0) {
      setResult("negative");
      return;
    }

    if (marginNum >= 100) {
      setError("Gross margin must be less than 100%.");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const data = await priceCalculator(costNum, marginNum);
      setResult(data);
    } catch (err) {
      console.error("Price calculation error:", err);
      setError("Unable to calculate price. Please try again.");
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle API view tracking
  const handleView = async () => {
    const id = calculatordetails?.calculatordetails?.id;
    if (!id) return;
    try {
      await CalculatorViewApi(id);
    } catch (err) {
      console.error("Error viewing calculator:", err);
    }
  };

  // Handle clear
  const handleClear = () => {
    setCost("");
    setGrossMargin("");
    setResult(null);
    setError(null);
  };

  // Handle calculate with view tracking
  const handleCalculate = () => {
    handleSubmit();
    handleView();
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
    <div className="price-calculator">
      {/* Header */}
      <header className="calc-header">
        <div className="calc-header__icon">
          <Calculator size={24} />
        </div>
        <div className="calc-header__content">
          <h2 className="calc-header__title">Price Calculator</h2>
          <p className="calc-header__subtitle">
            Calculate selling price and profit from cost and desired margin
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
                  value={cost}
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
                <Percent size={16} />
                Gross Margin
              </label>
              <div className="input-wrapper">
                <span className="input-wrapper__prefix">%</span>
                <input
                  type="number"
                  className="form-input form-input--with-prefix"
                  value={grossMargin}
                  onChange={(e) => handleMarginChange(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="99"
                  step="0.1"
                />
              </div>
              <span className="form-field__hint">
                Target gross margin (0–99%)
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

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

      {/* Results Card */}
      {result && (
        <section className="calc-card calc-card--results">
          <div className="calc-card__header">
            <h3 className="calc-card__title">
              <TrendingUp size={18} />
              Results
            </h3>
          </div>
          <div className="calc-card__body">
            {result === "negative" ? (
              <div className="error-state">
                <AlertCircle size={32} />
                <p className="error-state__text">
                  Please enter Cost and Margin values greater than 0
                </p>
              </div>
            ) : (
              <div className="results-grid">
                <div className="result-tile result-tile--primary">
                  <div className="result-tile__icon">
                    <Tag size={24} />
                  </div>
                  <div className="result-tile__content">
                    <span className="result-tile__label">Selling Price</span>
                    <span className="result-tile__value">
                      {formatCurrency(result.R)}
                    </span>
                  </div>
                </div>

                <div className="result-tile result-tile--success">
                  <div className="result-tile__icon">
                    <PiggyBank size={24} />
                  </div>
                  <div className="result-tile__content">
                    <span className="result-tile__label">Profit</span>
                    <span className="result-tile__value">
                      {formatCurrency(result.P)}
                    </span>
                  </div>
                </div>

                <div className="result-tile result-tile--secondary">
                  <div className="result-tile__icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="result-tile__content">
                    <span className="result-tile__label">Mark Up</span>
                    <span className="result-tile__value">
                      {formatPercent(result.M)}
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
                <span className="formula-item__name">Selling Price</span>
                <code className="formula-item__formula">
                  Cost / (1 - Margin%/100)
                </code>
              </div>
              <div className="formula-item">
                <span className="formula-item__name">Profit</span>
                <code className="formula-item__formula">
                  Selling Price - Cost
                </code>
              </div>
              <div className="formula-item">
                <span className="formula-item__name">Mark Up</span>
                <code className="formula-item__formula">
                  (Profit / Cost) × 100
                </code>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
