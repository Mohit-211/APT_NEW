import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
// Layout
import Navbar from "@/components/layout/Navbar";
// import Footer from "@/components/layout/Footer";

// Common
import Home from "@/features/common/Home";

// Auth
import Signin from "@/features/auth/Signin";
import Signup from "@/features/auth/Signup";
import VerifyOtp from "@/features/auth/VerifyOtp";
import SendOtp from "@/features/auth/SendOtp";
import CreateAccount from "@/features/auth/CreateAccount";
import Forgot from "@/features/auth/Forgot/Forgot";

// Dashboard
import Profile from "@/features/dashboard/Profile";

// Calculator Wrapper
import Calculator from "@/features/calculators/pages/Calculator";

// Calculators - Pages
import APTSupplementProgram from "./features/calculators/APTSupplementProgram/APTSupplementProgram";
import AdvancedPrice from "@/features/calculators/components/AdvancedPrice";
import PriceCalculator from "@/features/calculators/components/PriceCalculator";
import ProfitCalculator from "@/features/calculators/components/ProfitCalculator";
import MarginCalculator from "@/features/calculators/components/MarginCalculator";
import SalePriceCalculator from "@/features/calculators/components/SalePriceCalculator";
import SellingPriceCalculator from "@/features/calculators/components/SellingPriceCalculator";
import GrossPayCalculator from "@/features/calculators/components/GrossPayCalculator";

// Proposals
import AIProposal from "@/features/proposals/pages/AIProposal";
import Proposal from "@/features/proposals/pages/Proposal";
import ProposalNew from "@/features/proposals/pages/Proposal";
import CoachingAgreement from "@/features/proposals/pages/CoachingAgreement";
import SpeakerAgreement from "@/features/proposals/pages/SpeakerAgreement";
import SpeakingAgreement from "@/features/proposals/pages/SpeakingAgreement";
import LeadershipProposal from "@/features/proposals/pages/LeadershipProposal";
import Draft from "@/features/proposals/components/Draft";
import Download from "@/features/proposals/components/Download";

// Chat
import ChatLayout from "@/features/chat/ChatLayout";
import ChatStreamComponent from "@/features/chat/ChatStreamComponent";
import EditorPage from "@/features/chat/EditorPage/EditorPage";

// API
import { checkUserStatus } from "@/utils/api/Api";

function AppContent() {
  const location = useLocation();
  const [check, setCheck] = useState(false);
  const storedToken = localStorage.getItem("UserLoginTokenApt");

  // Poll the user status every 10 minutes
  useEffect(() => {
    const updateUserStatus = () => {
      checkUserStatus()
        .then((res) => {
          const data = res?.data?.data;
          if (!data) return;

          localStorage.setItem("UserStatus", data.user_status);
          localStorage.setItem("is_active", data.is_active);

          if (data.user_status === "DEACTIVATE") {
            localStorage.removeItem("UserLoginTokenApt");
          }
        })
        .catch((error) => {
          const msg =
            error?.response?.data?.message || error?.response?.message;
          if (msg === "User Not Found" || msg === "Please authenticate") {
            setCheck(true);
            localStorage.setItem("is_active", "user");
            localStorage.removeItem("UserLoginTokenApt");
          }
        });
    };

    if (storedToken) {
      const interval = setInterval(updateUserStatus, 1000 * 60 * 10);
      return () => clearInterval(interval);
    }
  }, [storedToken]);

  // Trigger redirect on forced logout
  useEffect(() => {
    const userStatus = localStorage.getItem("UserStatus");
    const active = localStorage.getItem("is_active");

    if ((userStatus === "DEACTIVATE" || active === "user") && check) {
      window.location.href = "/";
    }
  }, [check]);

  const hideChrome = location.pathname === "/ai-proposals";

  return (
    <>
      {!hideChrome && <Navbar />}

      <div className="content_main">
        <Routes>
          <Route path="*" element={<Navigate to="/" />} />
          {/* Home */}
          <Route path="/" element={<Home />} />
          {/* Auth */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verifyotp" element={<VerifyOtp />} />
          <Route path="/send-email-verification" element={<SendOtp />} />
          {/* Correct forgot password route */}
          <Route path="/forgot" element={<Forgot />} />
          {/* Create Account */}
          <Route path="/create-account" element={<CreateAccount />} />
          {/* Dashboard */}
          <Route path="/profile-edit" element={<Profile />} />
          {/* Core Calculators */}
          <Route
            path="/calculator/hot-deals-calculator"
            element={
              <Calculator>
                <APTSupplementProgram />
              </Calculator>
            }
          />
          <Route
            path="/calculator/advanced-price-exhibit"
            element={
              <Calculator>
                <AdvancedPrice />
              </Calculator>
            }
          />
          <Route
            path="/calculator/price-calculator"
            element={
              <Calculator>
                <PriceCalculator />
              </Calculator>
            }
          />
          <Route
            path="/calculator/profit-margin-calculator"
            element={
              <Calculator>
                <ProfitCalculator />
              </Calculator>
            }
          />
          <Route
            path="/calculator/margin-calculator"
            element={
              <Calculator>
                <MarginCalculator />
              </Calculator>
            }
          />
          <Route
            path="/calculator/sale-price-calculator"
            element={
              <Calculator>
                <SalePriceCalculator />
              </Calculator>
            }
          />
          <Route
            path="/calculator/selling-price-calculator"
            element={
              <Calculator>
                <SellingPriceCalculator />
              </Calculator>
            }
          />
          <Route
            path="/calculator/gross-pay-calculator"
            element={
              <Calculator>
                <GrossPayCalculator />
              </Calculator>
            }
          />
          {/* Proposals */}
          <Route path="/proposals" element={<ProposalNew />} />
          <Route path="/proposal" element={<Proposal />} />
          <Route path="/draft" element={<Draft />} />
          <Route
            path="/create/coaching-agreement/:id"
            element={<CoachingAgreement />}
          />
          <Route
            path="/create/speaker-agreement/:id"
            element={<SpeakerAgreement />}
          />
          <Route
            path="/create/speaking-agreement/:id"
            element={<SpeakingAgreement />}
          />
          <Route
            path="/create/leadership-workshop-proposal/:id?/:name?"
            element={<LeadershipProposal />}
          />
          <Route path="/viewproposal" element={<Download />} />
          {/* Chat */}
          <Route path="/chat/layout" element={<ChatLayout />} />
          <Route path="/chat/stream" element={<ChatStreamComponent />} />
          <Route path="/proposal-editor" element={<EditorPage />} />
          {/* AI Proposal */}
          <Route path="/ai-proposals" element={<AIProposal />} />
        </Routes>
      </div>

      {!hideChrome}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
