import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu as MenuIcon,
  X,
  User,
  LogOut,
  FileText,
  Calculator,
  Home,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Logo from "@/assets/apt.png";
import "./NavBar.scss";

interface Profile {
  name?: string;
  user_status?: string;
}

interface CalculatorItem {
  key: string;
  label: string;
  path: string;
  disabled?: boolean;
  requiresSubscription?: boolean;
}

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("UserLoginTokenApt");
  const userStatus = localStorage.getItem("UserStatus");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const [subModal, setSubModal] = useState(false);
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileCalcOpen, setMobileCalcOpen] = useState(false);

  const calcDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      setProfile({ name: "M", user_status: userStatus || "ACTIVATE" });
    }
  }, [token, userStatus]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calcDropdownRef.current &&
        !calcDropdownRef.current.contains(event.target as Node)
      ) {
        setCalcDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileCalcOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const logout = () => {
    localStorage.removeItem("UserLoginTokenApt");
    localStorage.removeItem("UserStatus");
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const calculatorItems: CalculatorItem[] = [
    {
      key: "pex",
      label: "Advanced Price Exhibit",
      path: "/calculator/advanced-price-exhibit",
    },
    {
      key: "margin",
      label: "Margin Calculator",
      path: "/calculator/margin-calculator",
    },
    {
      key: "profit",
      label: "Profit Margin Calculator",
      path: "/calculator/profit-margin-calculator",
      requiresSubscription: true,
    },
    {
      key: "pcalc",
      label: "Price Calculator",
      path: "/calculator/price-calculator",
      requiresSubscription: true,
    },
    {
      key: "sell",
      label: "Selling Price Calculator",
      path: "/calculator/selling-price-calculator",
    },
    {
      key: "salecalc",
      label: "Sale Price Calculator",
      path: "/calculator/sale-price-calculator",
      requiresSubscription: true,
    },
    {
      key: "gross",
      label: "Gross Pay Calculator",
      path: "/calculator/gross-pay-calculator",
    },
    {
      key: "partner",
      label: "Partnership Pricing",
      path: "/calculator/partnership-pricing-volume-discounts",
      requiresSubscription: true,
    },
    {
      key: "profitmod",
      label: "Profitability Module",
      path: "/calculator/profitability-module",
      requiresSubscription: true,
    },
  ];

  const handleCalculatorClick = (item: CalculatorItem) => {
    const isTrial = userStatus === "ACTIVATE TRIAL";

    if (item.requiresSubscription && isTrial) {
      setSubModal(true);
      setCalcDropdownOpen(false);
    } else {
      navigate(item.path);
      setCalcDropdownOpen(false);
    }
  };

  const handleMobileCalculatorClick = (item: CalculatorItem) => {
    const isTrial = userStatus === "ACTIVATE TRIAL";

    if (item.requiresSubscription && isTrial) {
      setSubModal(true);
      setMobileOpen(false);
    } else {
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__container">
          {/* Logo */}
          <img
            src={Logo}
            alt="logo"
            className="navbar__logo"
            onClick={() => navigate("/")}
          />

          {/* Desktop Navigation */}
          <div className="navbar__menu">
            <Link
              to="/"
              className={`navbar__link ${
                isActive("/") ? "navbar__link--active" : ""
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link
              to="/calculator/hot-deals-calculator"
              className={`navbar__link navbar__link--hot ${
                isActive("/calculator/hot-deals-calculator")
                  ? "navbar__link--active"
                  : ""
              }`}
            >
              <span>HOT</span>
            </Link>

            <Link
              to="/ai-proposals"
              className={`navbar__link ${
                isActive("/ai-proposals") ? "navbar__link--active" : ""
              }`}
            >
              <Sparkles size={18} />
              <span>Ask Ceddie (AI)</span>
            </Link>

            <Link
              to="/proposals"
              className={`navbar__link ${
                isActive("/proposals") ? "navbar__link--active" : ""
              }`}
            >
              <span>Proposals</span>
            </Link>

            {/* Calculators Dropdown */}
            <div className="navbar__dropdown" ref={calcDropdownRef}>
              <button
                className={`navbar__link navbar__link--dropdown ${
                  calcDropdownOpen ? "navbar__link--open" : ""
                }`}
                onClick={() => setCalcDropdownOpen(!calcDropdownOpen)}
              >
                <Calculator size={18} />
                <span>Calculators</span>
                <ChevronDown size={16} className="navbar__chevron" />
              </button>

              {calcDropdownOpen && (
                <div className="dropdown-menu">
                  {calculatorItems.map((item) => {
                    const isTrial = userStatus === "ACTIVATE TRIAL";
                    const isDisabled = item.requiresSubscription && isTrial;

                    return (
                      <button
                        key={item.key}
                        className={`dropdown-menu__item ${
                          isDisabled ? "dropdown-menu__item--disabled" : ""
                        }`}
                        onClick={() => handleCalculatorClick(item)}
                        disabled={isDisabled}
                      >
                        {item.label}
                        {isDisabled && (
                          <span className="dropdown-menu__badge">Pro</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Auth Section */}
            {!token ? (
              <button
                className="navbar__login"
                onClick={() => navigate("/signin")}
              >
                Login
              </button>
            ) : (
              <div className="navbar__dropdown" ref={profileDropdownRef}>
                <button
                  className={`navbar__profile ${
                    profileDropdownOpen ? "navbar__profile--open" : ""
                  }`}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  {profile?.name?.charAt(0)}
                </button>

                {profileDropdownOpen && (
                  <div className="dropdown-menu dropdown-menu--right">
                    <button
                      className="dropdown-menu__item"
                      onClick={() => {
                        navigate("/profile-edit");
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      className="dropdown-menu__item"
                      onClick={() => {
                        navigate("/draft");
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <FileText size={16} />
                      Draft
                    </button>
                    <div className="dropdown-menu__divider" />
                    <button
                      className="dropdown-menu__item dropdown-menu__item--danger"
                      onClick={logout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-drawer ${mobileOpen ? "mobile-drawer--open" : ""}`}
      >
        <div className="mobile-drawer__content">
          <Link to="/" className="mobile-drawer__link">
            <Home size={20} />
            <span>Home</span>
          </Link>

          <Link
            to="/calculator/hot-deals-calculator"
            className="mobile-drawer__link mobile-drawer__link--hot"
          >
            <span>HOT</span>
          </Link>

          <Link to="/ai-proposals" className="mobile-drawer__link">
            <Sparkles size={20} />
            <span>Ask Ceddie (AI)</span>
          </Link>

          <Link to="/proposals" className="mobile-drawer__link">
            <span>Proposals</span>
          </Link>

          {/* Mobile Calculators Accordion */}
          <div className="mobile-drawer__accordion">
            <button
              className={`mobile-drawer__accordion-trigger ${
                mobileCalcOpen ? "mobile-drawer__accordion-trigger--open" : ""
              }`}
              onClick={() => setMobileCalcOpen(!mobileCalcOpen)}
            >
              <Calculator size={20} />
              <span>Calculators</span>
              <ChevronDown size={18} />
            </button>

            {mobileCalcOpen && (
              <div className="mobile-drawer__accordion-content">
                {calculatorItems.map((item) => {
                  const isTrial = userStatus === "ACTIVATE TRIAL";
                  const isDisabled = item.requiresSubscription && isTrial;

                  return (
                    <button
                      key={item.key}
                      className={`mobile-drawer__sub-link ${
                        isDisabled ? "mobile-drawer__sub-link--disabled" : ""
                      }`}
                      onClick={() => handleMobileCalculatorClick(item)}
                      disabled={isDisabled}
                    >
                      {item.label}
                      {isDisabled && (
                        <span className="mobile-drawer__badge">Pro</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Auth Section */}
          {!token ? (
            <button
              className="mobile-drawer__login"
              onClick={() => {
                navigate("/signin");
                setMobileOpen(false);
              }}
            >
              Login
            </button>
          ) : (
            <div className="mobile-drawer__profile-section">
              <div className="mobile-drawer__profile-header">
                <div className="mobile-drawer__avatar">
                  {profile?.name?.charAt(0)}
                </div>
                <span>Account</span>
              </div>
              <button
                className="mobile-drawer__link"
                onClick={() => {
                  navigate("/profile-edit");
                  setMobileOpen(false);
                }}
              >
                <User size={20} />
                <span>Profile</span>
              </button>
              <button
                className="mobile-drawer__link"
                onClick={() => {
                  navigate("/draft");
                  setMobileOpen(false);
                }}
              >
                <FileText size={20} />
                <span>Draft</span>
              </button>
              <button
                className="mobile-drawer__link mobile-drawer__link--danger"
                onClick={logout}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      {subModal && (
        <>
          <div className="modal-overlay" onClick={() => setSubModal(false)} />
          <div className="modal">
            <div className="modal__content">
              <button
                className="modal__close"
                onClick={() => setSubModal(false)}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <div className="modal__icon">
                <Sparkles size={48} />
              </div>

              <h2 className="modal__title">Subscription Required</h2>
              <p className="modal__text">
                This feature is available to premium subscribers. Upgrade your
                account to unlock all calculators and features.
              </p>

              <div className="modal__actions">
                <button
                  className="modal__button modal__button--secondary"
                  onClick={() => setSubModal(false)}
                >
                  Maybe Later
                </button>
                <a
                  href="https://www.sendowl.com/s/digital/automated-pricing-tool-by-lafleur-leadership-books/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="modal__button modal__button--primary">
                    Subscribe Now
                  </button>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;
