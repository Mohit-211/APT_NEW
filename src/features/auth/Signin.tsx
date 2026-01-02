import { useEffect, useState } from "react";
import { Form, Input, Typography, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserLoginAPI } from "@/utils/api/Api";
import DescriptionAlerts from "@/utils/constants/alerts";
import Logo from "@/assets/apt.png";
import { Button } from "@/components/ui/Button";

import { FaEye as FaEyeRaw, FaEyeSlash as FaEyeSlashRaw } from "react-icons/fa";
import "./Signin.scss";

// === Icon Casting (your rule) === //
const FaEye = FaEyeRaw as React.FC<React.SVGProps<SVGSVGElement>>;
const FaEyeSlash = FaEyeSlashRaw as React.FC<React.SVGProps<SVGSVGElement>>;

const { Title, Paragraph } = Typography;

export default function Signin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);

  const [alert, setAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    text: string;
    icon: "success" | "error" | "warning" | "info" | "question";
  }>({
    text: "",
    icon: "error",
  });

  const onFinish = (values: { email: string; password: string }) => {
    setAlert(false);
    setLoading(true);

    UserLoginAPI(values.email, values.password)
      .then((res) => {
        const status = res?.data?.status;
        const user = res?.data?.data;

        if (status === 200) {
          const token = user?.tokens?.access?.token;

          localStorage.setItem("UserStatus", user?.user_status);
          localStorage.setItem("is_active", user?.is_active);

          if (
            user?.user_status === "DEACTIVATE" &&
            (user?.is_trial_period === false || user?.is_subscribed === false)
          ) {
            setAlert(true);
            setAlertConfig({
              text:
                user?.is_trial_period === false
                  ? "Your trial period is over. Please subscribe to log in again."
                  : "Your subscription has expired. Please subscribe to log in again.",
              icon: "error",
            });
          } else {
            localStorage.setItem("UserLoginTokenApt", token);
            setAlert(true);
            setAlertConfig({
              text: "Welcome back! You’ve successfully logged in.",
              icon: "success",
            });
            navigate("/");
          }
        }
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || "Invalid credentials. Try again.";

        setAlert(true);
        setAlertConfig({ text: message, icon: "error" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {alert && (
        <DescriptionAlerts text={alertConfig.text} icon={alertConfig.icon} />
      )}

      <div className="signin-page">
        <div className="signin-left">
          <img src={Logo} alt="APT Logo" />
        </div>

        <div className="signin-right">
          <Card className="signin-card" bordered={false}>
            <Title level={2} className="signin-title">
              Sign in
            </Title>

            <Form layout="vertical" onFinish={onFinish}>
              {/* Email */}
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email is required." },
                  { type: "email", message: "Enter a valid email." },
                ]}
              >
                <Input placeholder="Enter your email" size="large" />
              </Form.Item>

              {/* Password */}
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Password is required." }]}
              >
                <Input.Password
                  placeholder="Enter your password"
                  size="large"
                  iconRender={(visible) =>
                    visible ? (
                      <FaEyeSlash width={18} height={18} />
                    ) : (
                      <FaEye width={18} height={18} />
                    )
                  }
                />
              </Form.Item>

              <Paragraph
                className="signin-forgot"
                onClick={() => navigate("/forgotpassword")}
              >
                Forgot password?
              </Paragraph>

              <Button
                variant="default"
                size="lg"
                className="signin-btn"
                disabled={loading}
                onClick={() => {}}
                type="submit"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="signin-links">
                <Link
                  to="https://www.sendowl.com/s/digital/automated-pricing-tool-by-lafleur-leadership-books/"
                  className="link"
                >
                  Subscribe to create an account
                </Link>

                <Link to="/send-email-verification" className="link">
                  Register for free trial
                </Link>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
}
