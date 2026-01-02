import React, { useEffect, useState } from "react";
import { Input, Form, message } from "antd";
import "./ProfitabilityModule.scss";

import { CalculatorViewApi } from "@/utils/api/Api";

type ProfitabilityModuleProps = {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
};

const ProfitabilityModule: React.FC<ProfitabilityModuleProps> = ({
  calculatordetails,
}) => {
  const [sale, setSale] = useState<number | undefined>();
  const [purchase, setPurchase] = useState<number | undefined>();
  const [directCosts, setDirectCosts] = useState<number | undefined>();
  const [rent, setRent] = useState<number | undefined>();
  const [salary, setSalary] = useState<number | undefined>();
  const [generalExpenses, setGeneralExpenses] = useState<number | undefined>();
  const [depreciation, setDepreciation] = useState<number | undefined>();
  const [interestPaid, setInterestPaid] = useState<number | undefined>();
  const [taxes, setTaxes] = useState<number | undefined>();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleView = async () => {
       const id = calculatordetails?.calculatordetails?.id;
    if (id === undefined) return; // Guard against undefined
    try {
      await CalculatorViewApi(id);
    } catch (err) {
      console.error("API Error:", err);
      message.error("Unable to record calculator view.");
    }
  };

  // Convert undefined values into safe zeros
  const S = sale || 0;
  const P = purchase || 0;
  const DC = directCosts || 0;
  const R = rent || 0;
  const SAL = salary || 0;
  const GE = generalExpenses || 0;
  const DEP = depreciation || 0;
  const INT = interestPaid || 0;
  const T = taxes || 0;

  const profit = S - P - DC - R - SAL - GE - DEP - INT - T;
  const profitability = S ? (profit / S) * 100 : 0;
  const grossProfit = S - P - DC;
  const grossProfitMargin = S ? (grossProfit / S) * 100 : 0;
  const operatingProfit = S - P - DC - R - SAL - GE - DEP;
  const operatingProfitMargin = S ? (operatingProfit / S) * 100 : 0;
  const EBITDA = S - P - DC - R - SAL - GE;

  return (
    <div className="ProfitabilityModule">
      <Form layout="vertical">
        <Form.Item label="Sale">
          <Input
            placeholder="Enter Sale"
            type="number"
            value={sale}
            onClick={handleView}
            onChange={(e) => setSale(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Purchase">
          <Input
            placeholder="Enter Purchase"
            type="number"
            value={purchase}
            onChange={(e) => setPurchase(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Direct Costs">
          <Input
            placeholder="Enter Direct Costs"
            type="number"
            value={directCosts}
            onChange={(e) => setDirectCosts(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Rent">
          <Input
            placeholder="Enter Rent"
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Salary">
          <Input
            placeholder="Enter Salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="General Expenses">
          <Input
            placeholder="Enter General Expenses"
            type="number"
            value={generalExpenses}
            onChange={(e) => setGeneralExpenses(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Depreciation">
          <Input
            placeholder="Enter Depreciation"
            type="number"
            value={depreciation}
            onChange={(e) => setDepreciation(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Interest Paid">
          <Input
            placeholder="Enter Interest Paid"
            type="number"
            value={interestPaid}
            onChange={(e) => setInterestPaid(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Taxes @ 30%">
          <Input
            placeholder="Enter Taxes"
            type="number"
            value={taxes}
            onChange={(e) => setTaxes(Number(e.target.value))}
          />
        </Form.Item>
      </Form>

      {/* Results */}
      <div className="Row_1">
        <div className="Col_1 blank_input">
          Profit:
          <div className="Col_12 blank_input">${profit.toFixed(2)}</div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Profitability:
          <div className="Col_12 blank_input">{profitability.toFixed(2)}%</div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Gross Profit:
          <div className="Col_12 blank_input">${grossProfit.toFixed(2)}</div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Gross Profit Margin:
          <div className="Col_12 blank_input">
            {grossProfitMargin.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Operating Profit:
          <div className="Col_12 blank_input">
            ${operatingProfit.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Operating Profit Margin:
          <div className="Col_12 blank_input">
            {operatingProfitMargin.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          EBITDA:
          <div className="Col_12 blank_input">${EBITDA.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityModule;
