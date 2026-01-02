import React, { useEffect, useState } from "react";
import { Input, Select, Button, Table, Form, message } from "antd";
import "./SalePriceCalculator.scss";

import { salePriceCalculator } from "@/features/calculators/functions/saleCalculatorFunction";
import { CalculatorViewApi } from "@/utils/api/Api";

type SalePriceCalculatorProps = {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
};

const SalePriceCalculatorComponent: React.FC<SalePriceCalculatorProps> = ({
  calculatordetails,
}) => {
  const [listPrice, setListPrice] = useState<number | undefined>();
  const [percentageOff, setPercentageOff] = useState<number | undefined>();

  const [priceOfMultiItemCal, setPriceOfMultiItemCal] = useState<
    number | undefined
  >();
  const [numberOfItemsAtListPrice, setNumberOfItemsAtListPrice] =
    useState<number>(1);
  const [numberOfItemsInDeal, setNumberOfItemsInDeal] = useState<number>(2);

  const [priceOfFractionCal, setPriceOfFractionCal] = useState<
    number | undefined
  >();
  const [fraction, setFraction] = useState<number>(0);

  const [result, setResult] = useState<any>(null);

  const FRACTION_OPTIONS = [
    { label: "0", value: 0 },
    { label: "1/4", value: 0.25 },
    { label: "1/3", value: 0.33 },
    { label: "1/2", value: 0.5 },
    { label: "2/3", value: 0.67 },
    { label: "3/4", value: 0.75 },
  ];

  const decimalToFraction = (value: number) => {
    const found = FRACTION_OPTIONS.find(
      (x) => x.value === Number(value.toFixed(2))
    );
    return found ? found.label : value.toString();
  };

  // const handleSubmit = async () => {
  //   try {
  //     const data = await salePriceCalculator(
  //       listPrice,
  //       percentageOff,
  //       priceOfMultiItemCal,
  //       numberOfItemsAtListPrice,
  //       numberOfItemsInDeal,
  //       priceOfFractionCal,
  //       fraction
  //     );
  //     setResult(data);
  //   } catch (error) {
  //     console.error("Calculation error:", error);
  //     message.error("Error performing calculation.");
  //   }
  // };


  const handleSubmit = async () => {
    try {
      const data = await salePriceCalculator(
        listPrice ?? 0,
        percentageOff ?? 0,
        priceOfMultiItemCal ?? 0,
        numberOfItemsAtListPrice,
        numberOfItemsInDeal,
        priceOfFractionCal ?? 0,
        fraction
      );
      setResult(data);
    } catch (error) {
      console.error("Calculation error:", error);
      message.error("Error performing calculation.");
    }
  };

  const handleClear = () => {
    setListPrice(undefined);
    setPercentageOff(undefined);
    setPriceOfMultiItemCal(undefined);
    setNumberOfItemsAtListPrice(1);
    setNumberOfItemsInDeal(2);
    setPriceOfFractionCal(undefined);
    setFraction(0);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleView = async () => {
    const id = calculatordetails?.calculatordetails?.id;
    if (id === undefined) return; // Guard against undefined
    try {
      await CalculatorViewApi(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="SalePriceCalculatorComponent">
      <Form layout="vertical">
        {/* % Off */}
        <div className="cal_row">
          <div className="cal_col_main">
            <Form.Item label="% Off">
              <Input
                type="number"
                prefix="%"
                value={percentageOff}
                onChange={(e) => setPercentageOff(Number(e.target.value))}
              />
            </Form.Item>
          </div>

          <div className="cal_col_main">
            <Form.Item label="List Price">
              <Input
                type="number"
                prefix="$"
                value={listPrice}
                onChange={(e) => setListPrice(Number(e.target.value))}
                onClick={handleView}
              />
            </Form.Item>
          </div>
        </div>

        {/* Fraction Off */}
        <div className="cal_row">
          <div className="cal_col_main">
            <Form.Item label="Fraction Off">
              <Select
                value={fraction}
                onChange={(v) => setFraction(Number(v))}
                options={FRACTION_OPTIONS}
              />
            </Form.Item>
          </div>

          <div className="cal_col_main">
            <Form.Item label="Price for Fraction">
              <Input
                type="number"
                prefix="$"
                value={priceOfFractionCal}
                onChange={(e) => setPriceOfFractionCal(Number(e.target.value))}
              />
            </Form.Item>
          </div>
        </div>

        {/* Multi Item Deal */}
        <div className="cal_row">
          <div className="cal_col_main">
            <div className="cal_col_row">
              <Form.Item label="Items in Deal">
                <Select
                  value={numberOfItemsInDeal}
                  onChange={(v) => setNumberOfItemsInDeal(Number(v))}
                  options={[2, 3, 4, 5, 6].map((n) => ({ label: n, value: n }))}
                />
              </Form.Item>

              <Form.Item label="Items at List Price">
                <Select
                  value={numberOfItemsAtListPrice}
                  onChange={(v) => setNumberOfItemsAtListPrice(Number(v))}
                  options={[1, 2, 3, 4, 5].map((n) => ({ label: n, value: n }))}
                />
              </Form.Item>
            </div>
          </div>

          <div className="cal_col_main">
            <Form.Item label="Price for Multi-Item Deal">
              <Input
                type="number"
                prefix="$"
                value={priceOfMultiItemCal}
                onChange={(e) => setPriceOfMultiItemCal(Number(e.target.value))}
              />
            </Form.Item>
          </div>
        </div>
      </Form>

      {/* Buttons */}
      <div className="Button_style">
        <Button onClick={handleClear}>Clear</Button>
        <Button
          type="primary"
          onClick={() => {
            handleSubmit();
            handleView();
          }}
        >
          Calculate
        </Button>
      </div>

      {/* Result Table */}
      {result && (
        <div className="Answer_Container">
          <h5>Answer</h5>
          <Table
            bordered
            pagination={false}
            dataSource={[
              {
                key: 1,
                label: `${percentageOff}% off $${listPrice}`,
                value: `$${result?.discountedPrice}`,
              },
              {
                key: 2,
                label: `${decimalToFraction(
                  fraction
                )} off $${priceOfFractionCal}`,
                value: `$${result?.salePrice}`,
              },
              {
                key: 3,
                label: `${numberOfItemsInDeal} for ${numberOfItemsAtListPrice} at $${priceOfMultiItemCal}`,
                value: `$${result?.discountedPricePerItem}`,
              },
            ]}
            columns={[
              { title: "Discount", dataIndex: "label" },
              { title: "Final Price Each", dataIndex: "value" },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default SalePriceCalculatorComponent;
