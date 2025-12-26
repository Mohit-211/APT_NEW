import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Drawer, Button, Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import {
  Menu as MenuIcon,
  User,
  LogOut,
  FileText,
  Calculator,
  Home,
  Sparkles,
} from "lucide-react";
import Logo from "@/assets/apt.png";
import "./NavBar.scss";

interface Profile {
  name?: string;
  user_status?: string;
}

const NavBar = () => {
  const navigate = useNavigate();
  // const { pathname } = useLocation();

  const token = localStorage.getItem("UserLoginTokenApt");
  const userStatus = localStorage.getItem("UserStatus");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const [subModal, setSubModal] = useState(false);

  useEffect(() => {
    if (token) {
      setProfile({ name: "M", user_status: userStatus || "ACTIVATE" });
    }
  }, [token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("UserLoginTokenApt");
    localStorage.removeItem("UserStatus");
    navigate("/");
  };

  const calculatorItems: MenuProps["items"] = [
    {
      key: "pex",
      label: "Advanced Price Exhibit",
      onClick: () => navigate("/calculator/advanced-price-exhibit"),
    },
    {
      key: "margin",
      label: "Margin Calculator",
      onClick: () => navigate("/calculator/margin-calculator"),
    },
    {
      key: "profit",
      label: "Profit Margin Calculator",
      disabled: userStatus === "ACTIVATE TRIAL",
      onClick: () =>
        userStatus === "ACTIVATE"
          ? navigate("/calculator/profit-margin-calculator")
          : setSubModal(true),
    },
    {
      key: "pcalc",
      label: "Price Calculator",
      disabled: userStatus === "ACTIVATE TRIAL",
      onClick: () =>
        userStatus === "ACTIVATE"
          ? navigate("/calculator/price-calculator")
          : setSubModal(true),
    },
    {
      key: "sell",
      label: "Selling Price Calculator",
      onClick: () => navigate("/calculator/selling-price-calculator"),
    },
    {
      key: "salecalc",
      label: "Sale Price Calculator",
      disabled: userStatus === "ACTIVATE TRIAL",
      onClick: () =>
        userStatus === "ACTIVATE"
          ? navigate("/calculator/sale-price-calculator")
          : setSubModal(true),
    },
    {
      key: "gross",
      label: "Gross Pay Calculator",
      onClick: () => navigate("/calculator/gross-pay-calculator"),
    },
    {
      key: "partner",
      label: "Partnership Pricing",
      disabled: userStatus === "ACTIVATE TRIAL",
      onClick: () =>
        userStatus === "ACTIVATE"
          ? navigate("/calculator/partnership-pricing-volume-discounts")
          : setSubModal(true),
    },
    {
      key: "profitmod",
      label: "Profitability Module",
      disabled: userStatus === "ACTIVATE TRIAL",
      onClick: () =>
        userStatus === "ACTIVATE"
          ? navigate("/calculator/profitability-module")
          : setSubModal(true),
    },
  ];

  const profileItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <User size={16} />,
      onClick: () => navigate("/profile-edit"),
    },
    {
      key: "draft",
      label: "Draft",
      icon: <FileText size={16} />,
      onClick: () => navigate("/draft"),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut size={16} />,
      onClick: logout,
    },
  ];

  return (
    <>
      {/* NAV WRAPPER */}
      <nav className={`NavbarSection ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <img
            src={Logo}
            alt="logo"
            className="nav-logo"
            onClick={() => navigate("/")}
          />

          {/* Desktop Menu */}
          <div className="nav-desktop">
            <Link to="/" className="nav-link">
              <Home size={16} /> Home
            </Link>

            <Link to="/calculator/hot-deals-calculator" className="nav-link">
              HOT
            </Link>

            <Link to="/ai-proposals" className="nav-link">
              <Sparkles size={16} /> Ask Ceddie (AI)
            </Link>

            <Link to="/proposals" className="nav-link">
              Proposals
            </Link>

            <Dropdown menu={{ items: calculatorItems }}>
              <span className="nav-link dropdown-trigger">
                <Calculator size={16} /> Calculators
              </span>
            </Dropdown>

            {!token ? (
              <Button className="login-btn" onClick={() => navigate("/signin")}>
                Login
              </Button>
            ) : (
              <Dropdown menu={{ items: profileItems }}>
                <div className="profile-icon">{profile?.name?.charAt(0)}</div>
              </Dropdown>
            )}
          </div>

          {/* Mobile Hamburger */}
          <MenuIcon
            className="nav-mobile-btn"
            size={32}
            onClick={() => setMobileOpen(true)}
          />
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        width="80%"
      >
        <div className="drawer-menu">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>

          <Link
            to="/calculator/hot-deals-calculator"
            onClick={() => setMobileOpen(false)}
          >
            HOT
          </Link>

          <Link to="/ai-proposals" onClick={() => setMobileOpen(false)}>
            Ask Ceddie (AI)
          </Link>

          <Link to="/proposals" onClick={() => setMobileOpen(false)}>
            Proposals
          </Link>

          <Dropdown menu={{ items: calculatorItems }} trigger={["click"]}>
            <span className="drawer-dropdown">Calculators</span>
          </Dropdown>

          {!token ? (
            <Button className="login-btn" onClick={() => navigate("/signin")}>
              Login
            </Button>
          ) : (
            <Dropdown menu={{ items: profileItems }} trigger={["click"]}>
              <div className="drawer-profile">
                <div className="profile-icon">{profile?.name?.charAt(0)}</div>
                <span>Account</span>
              </div>
            </Dropdown>
          )}
        </div>
      </Drawer>

      {/* Subscription Modal */}
      <Modal
        centered
        open={subModal}
        onCancel={() => setSubModal(false)}
        footer={null}
      >
        <h2 className="modal-title">Subscription Required</h2>
        <p>You need a subscription to access this feature.</p>

        <div className="modal-actions">
          <Button onClick={() => setSubModal(false)}>Close</Button>

          <a
            href="https://www.sendowl.com/s/digital/automated-pricing-tool-by-lafleur-leadership-books/"
            target="_blank"
          >
            <Button className="subscribe-btn" type="primary">
              Subscribe
            </Button>
          </a>
          {/*  */}
        </div>
      </Modal>
    </>
  );
};

export default NavBar;
