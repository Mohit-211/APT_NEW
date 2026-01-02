import { useState, useEffect } from "react";
import { Form, Input, Typography, Card } from "antd";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router-dom";

import { UserRegisterAPI } from "@/utils/api/Api";
import { Button } from "@/components/ui/Button";
import DescriptionAlerts from "@/utils/constants/alerts";

import "./CreateAccount.scss";

const { Title } = Typography;

/* =========================
   TYPES
========================= */

interface FormData {
  email: string;
}

interface CreateAccountFormValues {
  name: string;
  email: string;
  business_name: string;
  mobile: string;
  password: string;
  confirm_password: string;
}

interface CreateAccountProps {
  formData?: FormData;
}

/* =========================
   COMPONENT
========================= */

export default function CreateAccount({
  formData = { email: "" },
}: CreateAccountProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm<CreateAccountFormValues>();

  const [alert, setAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    text: string;
    icon: "success" | "error";
  }>({ text: "", icon: "success" });

  const onFinish = async (values: CreateAccountFormValues) => {
    setAlert(false);

    const payload = {
      name: values.name,
      email: values.email,
      business_name: values.business_name,
      mobile: values.mobile,
      password: values.password,
      confirm_password: values.confirm_password,
    };

    try {
      await UserRegisterAPI(payload);

      setAlert(true);
      setAlertConfig({
        text: "Account created successfully! Please sign in.",
        icon: "success",
      });

      setTimeout(() => navigate("/signin"), 1500);
    } catch (error: any) {
      setAlert(true);
      setAlertConfig({
        text:
          error?.response?.data?.message ||
          "Something went wrong!",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (formData.email) {
      form.setFieldsValue({ email: formData.email });
    }
  }, [formData.email, form]);

  return (
    <div className="create-account-page">
      {alert && (
        <DescriptionAlerts
          text={alertConfig.text}
          icon={alertConfig.icon}
        />
      )}

      <Card className="create-card" bordered={false}>
        <Title level={2} className="title">
          Create Account
        </Title>

        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Full name is required." },
            ]}
          >
            <Input placeholder="Enter your full name" size="large" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input size="large" disabled />
          </Form.Item>

          <Form.Item
            label="Business Name"
            name="business_name"
            rules={[
              { required: true, message: "Business name is required." },
            ]}
          >
            <Input placeholder="Your business name" size="large" />
          </Form.Item>

          <Form.Item
            label="Mobile Number"
            name="mobile"
            rules={[
              { required: true, message: "Mobile number is required." },
            ]}
          >
            <PhoneInput
              placeholder="Enter phone number"
              defaultCountry="US"
              className="phone-input"
              value={form.getFieldValue("mobile")}
              onChange={(value) =>
                form.setFieldsValue({ mobile: value || "" })
              }
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required." },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirm your password." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value ||
                    getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Passwords do not match!")
                      );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <Button
            variant="default"
            size="lg"
            className="submit-btn"
            type="submit"
          >
            Continue
          </Button>
        </Form>
      </Card>
    </div>
  );
}
