import React, { useEffect, useState } from "react";
import { Select, Form, message } from "antd";
import "./PartnershipDiscounts.scss";

import { CalculatorViewApi } from "@/utils/api/Api";

type PartnershipDiscountsProps = {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
};

const PartnershipDiscounts: React.FC<PartnershipDiscountsProps> = ({
  calculatordetails,
}) => {
  const [firstSelectValue, setFirstSelectValue] = useState<number>(5000);
  const [secondSelectValue, setSecondSelectValue] = useState<number>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleView = async () => {
    const id = calculatordetails?.calculatordetails?.id;
    if (id === undefined) return; // Guard against undefined

    try {
      await CalculatorViewApi(id); // id is now guaranteed to be string | number
    } catch (err) {
      console.log("view error", err);
      message.error("Unable to record calculator view.");
    }
  };

  const dollarValue = (firstSelectValue || 0) * (secondSelectValue || 0);

  return (
    <div className="PartnershipDiscounts">
      <div className="Row_1">
        <div className="Col_main">
          <Form layout="vertical">
            <Form.Item label="Customer commitment level (Annual Dollars)">
              <Select
                value={firstSelectValue}
                onChange={(v) => setFirstSelectValue(Number(v))}
                options={[
                  { value: 5000, label: "$5,000" },
                  { value: 10000, label: "$10,000" },
                  { value: 15000, label: "$15,000" },
                  { value: 20000, label: "$20,000" },
                  { value: 25000, label: "$25,000" },
                  { value: 30000, label: "$30,000" },
                  { value: 35000, label: "$35,000" },
                  { value: 40000, label: "$40,000" },
                  { value: 45000, label: "$45,000" },
                  { value: 50000, label: "$50,000" },
                  { value: 100000, label: "$100,000+" },
                ]}
              />
            </Form.Item>
          </Form>
        </div>

        <div className="Col_main">
          <Form layout="vertical">
            <Form.Item label="Partnership Discount Level (%)">
              <Select
                value={secondSelectValue}
                onChange={(v) => setSecondSelectValue(Number(v))}
                onClick={handleView}
                options={[
                  { value: 0, label: "0%" },
                  { value: 0.02, label: "2%" },
                  { value: 0.05, label: "5%" },
                  { value: 0.1, label: "10%" },
                  { value: 0.2, label: "20%" },
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Dollar Value :
          <div className="Col_12 blank_input">${dollarValue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipDiscounts;
