// ChangePassword.tsx
import { useState } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import OTPInput from "react-otp-input";

import { ForgotPassword } from "@/utils/api/Api";

import "./Forgot.scss";

// -------------------- TYPES --------------------

interface ChangePasswordProps {
  email: string;
  onSuccess: () => void;
}

interface FormValues {
  password: string;
  confirm: string;
}

// -------------------- COMPONENT --------------------

export default function ChangePassword({
  email,
  onSuccess,
}: ChangePasswordProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");

  const [form] = Form.useForm<FormValues>();

  // -------------------- SUBMIT HANDLER --------------------

  const onFinish = async (values: FormValues) => {
    if (otp.length !== 4) {
      message.error("Please enter a valid 4-digit OTP.");
      return;
    }

    if (values.password !== values.confirm) {
      message.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await ForgotPassword(
        email, // string
        otp, // ✅ OTP MUST BE STRING
        values.password,
        values.confirm
      );

      Modal.success({
        title: "Password Reset Successful",
        content:
          res?.data?.message ||
          "Your password has been reset successfully.",
      });

      onSuccess();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------- UI --------------------

  return (
    <div className="change-password">
      <Form<FormValues>
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
      >
        {/* Email */}
        <Form.Item label="Email">
          <Input value={email} disabled size="large" />
        </Form.Item>

        {/* OTP */}
        <Form.Item label="Enter OTP" required>
          <OTPInput
            value={otp}
            onChange={(value: string) => setOtp(value)}
            numInputs={4}
            shouldAutoFocus
            inputType="tel"
            renderInput={(props) => <input {...props} />}
            inputStyle={{
              width: "3rem",
              height: "3rem",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "2px solid var(--accent)",
              background: "#f7f9fc",
              margin: "0 0.4rem",
              textAlign: "center",
            }}
          />
        </Form.Item>

        {/* New Password */}
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: "Please enter a new password." },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="New password" size="large" />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Passwords do not match.")
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm password" size="large" />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="btn-theme"
            block
            size="large"
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
