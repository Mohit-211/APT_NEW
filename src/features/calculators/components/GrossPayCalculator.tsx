import React, { useEffect, useState } from "react";
import { Input, message } from "antd";
import { CalculatorViewApi } from "@/utils/api/Api";

type GrossPayProps = {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
};

const GrossPayCalculator: React.FC<GrossPayProps> = ({ calculatordetails }) => {
  const [hourlyCost, setHourlyCost] = useState<number>(0);
  const [numberOfDays, setNumberOfDays] = useState<number>(0);
  const [hoursPerDay, setHoursPerDay] = useState<number>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleView = async () => {
    if (!calculatordetails?.calculatordetails?.id) return;

    try {
      await CalculatorViewApi(String(calculatordetails.calculatordetails.id));
    } catch (err) {
      console.error(err);
      message.error("Unable to record calculator view.");
    }
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setter(value ? Number(value) : 0);
    };

  const total = hourlyCost * numberOfDays * hoursPerDay;

  return (
    <div className="GrossPayCalculator">
      <div className="Row_1">
        <div className="Col_1 blank_input">
          Enter your hourly cost
          <div className="Col_12">
            <Input
              placeholder="Enter value"
              type="number"
              value={hourlyCost}
              onChange={handleChange(setHourlyCost)}
              onClick={handleView}
            />
          </div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Enter Number of Days
          <div className="Col_12">
            <Input
              placeholder="Enter value"
              type="number"
              value={numberOfDays}
              onChange={handleChange(setNumberOfDays)}
            />
          </div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Enter Working hours per day
          <div className="Col_12">
            <Input
              placeholder="Enter value"
              type="number"
              value={hoursPerDay}
              onChange={handleChange(setHoursPerDay)}
            />
          </div>
        </div>
      </div>

      <div className="Row_1">
        <div className="Col_1 blank_input">
          Total Amount:
          <div className="Col_12">
            <div className="blank_input">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrossPayCalculator;
