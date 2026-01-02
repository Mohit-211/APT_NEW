import React, { useEffect, useState } from "react";
import { Input, Select, Button, Table, Form, message } from "antd";
import "./SellingPriceCalculator.scss";

import { sellingPriceCalculator } from "@/features/calculators/functions/sellingPriceCalculator";
import { CalculatorViewApi } from "@/utils/api/Api";

type SellingPriceProps = {
  calculatordetails?: {
    calculatordetails?: {
      id?: string | number;
    };
  };
};

const SellingPriceCalculatorComponent: React.FC<SellingPriceProps> = ({
  calculatordetails,
}) => {
  const [cost, setCost] = useState<number | undefined>();
  const [itemCost, setItemCost] = useState<number | undefined>();
  const [shippingCost, setShippingCost] = useState<number | undefined>();
  const [shippingCharge, setShippingCharge] = useState<number | undefined>();

  const [sellingCostPercentage, setSellingCostPercentage] = useState<
    number | undefined
  >();
  const [sellingCostFixedPrice, setSellingCostFixedPrice] = useState<
    number | undefined
  >();

  const [tnxCostPercentage, setTnxCostPercentage] = useState<
    number | undefined
  >();
  const [tnxCostFixedPrice, setTnxCostFixedPrice] = useState<
    number | undefined
  >();

  const [selectedValue, setSelectedValue] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

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

  const handleSubmit = async () => {
    setError("");

    if (!itemCost || itemCost <= 0) {
      setError("Item Cost must be greater than 0");
      return;
    }

    if (
      (sellingCostPercentage || 0) >= 100 ||
      (tnxCostPercentage || 0) >= 100
    ) {
      setError("Percentage should be less than or equal to 100.");
      return;
    }

    try {
      let data;

      if (selectedValue === "1") {
        // Profit $
        data = await sellingPriceCalculator(
          Number(cost),
          0,
          0,
          Number(itemCost),
          Number(shippingCost),
          Number(shippingCharge),
          Number(sellingCostPercentage),
          Number(sellingCostFixedPrice),
          Number(tnxCostPercentage),
          Number(tnxCostFixedPrice)
        );
      } else if (selectedValue === "2") {
        // Margin %
        if (Number(cost) >= 100) {
          setError("Margin % must be less than 100");
          return;
        }

        data = await sellingPriceCalculator(
          0,
          Number(cost),
          0,
          Number(itemCost),
          Number(shippingCost),
          Number(shippingCharge),
          Number(sellingCostPercentage),
          Number(sellingCostFixedPrice),
          Number(tnxCostPercentage),
          Number(tnxCostFixedPrice)
        );
      } else if (selectedValue === "3") {
        // Markup %
        data = await sellingPriceCalculator(
          0,
          0,
          Number(cost),
          Number(itemCost),
          Number(shippingCost),
          Number(shippingCharge),
          Number(sellingCostPercentage),
          Number(sellingCostFixedPrice),
          Number(tnxCostPercentage),
          Number(tnxCostFixedPrice)
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      message.error("Something went wrong while calculating.");
    }
  };

  const clearAll = () => {
    setCost(undefined);
    setItemCost(undefined);
    setShippingCost(undefined);
    setShippingCharge(undefined);

    setSellingCostPercentage(undefined);
    setSellingCostFixedPrice(undefined);
    setTnxCostPercentage(undefined);
    setTnxCostFixedPrice(undefined);

    setSelectedValue("1");
    setResult(null);
    setError("");
  };

  return (
    <div className="SellingPriceCalculatorComponent">
      <Form layout="vertical" onClick={handleView}>
        <div className="cal_row">
          <Form.Item label="Select Method">
            <Select
              value={selectedValue}
              onChange={setSelectedValue}
              options={[
                { label: "Profit $", value: "1" },
                { label: "Margin %", value: "2" },
                { label: "Markup %", value: "3" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Value">
            <Input
              prefix="$"
              type="number"
              placeholder="Enter Cost"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
            <p className="subvalues">(desired return)</p>
          </Form.Item>
        </div>

        <Form.Item label="Item Cost">
          <Input
            prefix="$"
            type="number"
            value={itemCost}
            onChange={(e) => setItemCost(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Shipping Cost (seller pays)">
          <Input
            prefix="$"
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Shipping Charge (buyer pays)">
          <Input
            prefix="$"
            type="number"
            value={shippingCharge}
            onChange={(e) => setShippingCharge(Number(e.target.value))}
          />
        </Form.Item>

        <h5>
          Selling Cost{" "}
          <span className="subvalues">(Amazon/eBay/Etsy Fees)</span>
        </h5>
        <Form.Item label="Percentage">
          <Input
            prefix="%"
            type="number"
            value={sellingCostPercentage}
            onChange={(e) => setSellingCostPercentage(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Fixed Cost">
          <Input
            prefix="$"
            type="number"
            value={sellingCostFixedPrice}
            onChange={(e) => setSellingCostFixedPrice(Number(e.target.value))}
          />
        </Form.Item>

        <h5>
          Transaction Cost{" "}
          <span className="subvalues">(CC or PayPal Fees)</span>
        </h5>
        <Form.Item label="Percentage">
          <Input
            prefix="%"
            type="number"
            value={tnxCostPercentage}
            onChange={(e) => setTnxCostPercentage(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item label="Fixed Cost">
          <Input
            prefix="$"
            type="number"
            value={tnxCostFixedPrice}
            onChange={(e) => setTnxCostFixedPrice(Number(e.target.value))}
          />
        </Form.Item>
      </Form>

      <div className="Button_style">
        <Button onClick={clearAll}>Clear</Button>
        <Button type="primary" onClick={handleSubmit}>
          Calculate
        </Button>
      </div>

      {error && <p className="error_text">{error}</p>}

      {result && (
        <div className="Answer_Container">
          <h5>Answer</h5>
          <p>Selling Price = $ {result?.answer?.sellingPrice}</p>

          <h6>Summary of Values</h6>
          <Table
            bordered
            pagination={false}
            dataSource={[
              {
                key: "1",
                label: "Item Cost",
                value: `$ ${result.summaryOfValues.itemCost}`,
              },
              {
                key: "2",
                label: "Shipping Cost",
                value: `$ ${result.summaryOfValues.shippingCost}`,
              },
              {
                key: "3",
                label: "Selling Cost",
                value: `$ ${result.summaryOfValues.sellingCost}`,
              },
              {
                key: "4",
                label: "Transaction Cost",
                value: `$ ${result.summaryOfValues.transactionCost}`,
              },
              {
                key: "5",
                label: "Total Cost",
                value: `$ ${result.summaryOfValues.cost}`,
              },
              {
                key: "6",
                label: "Revenue",
                value: `$ ${result.summaryOfValues.revenue}`,
              },
              {
                key: "7",
                label: "Profit",
                value: `$ ${result.summaryOfValues.profit}`,
              },
              {
                key: "8",
                label: "Margin",
                value: `${result.summaryOfValues.margin}%`,
              },
              {
                key: "9",
                label: "Markup",
                value: `${result.summaryOfValues.markup}%`,
              },
            ]}
            columns={[
              { title: "Field", dataIndex: "label" },
              { title: "Value", dataIndex: "value" },
            ]}
          />

          <h6>Example Invoice for Buyer:</h6>
          <Table
            bordered
            pagination={false}
            dataSource={[
              {
                key: "1",
                label: "Item Price",
                value: `$ ${result.invoiceForBuyer.itemPrice}`,
              },
              {
                key: "2",
                label: "Shipping",
                value: `$ ${result.invoiceForBuyer.shipping}`,
              },
              {
                key: "3",
                label: "Total",
                value: `$ ${result.invoiceForBuyer.total}`,
              },
            ]}
            columns={[
              { title: "Detail", dataIndex: "label" },
              { title: "Value", dataIndex: "value" },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default SellingPriceCalculatorComponent;
