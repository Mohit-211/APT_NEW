import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  X,
  Settings,
  Shield,
} from "lucide-react";
import { getClientProfile } from "@/app/store/slices/getClientProfileSlice";
import {
  ChangePasswordAPI,
  GetProfile,
  UserEditProfileAPI,
} from "@/utils/api/Api";
import { Image_URL } from "@/utils/constants/host";
import ProfileDummy from "@/assets/profile.png";
import Signin from "@/features/auth/Signin";
import "./Profile.scss";

// ============================================
// TYPES
// ============================================

interface ProfileData {
  name: string;
  email: string;
  mobile: string;
  attachements?: Array<{
    file_name: string;
  }>;
}

interface Toast {
  show: boolean;
  message: string;
  type: "success" | "error";
}

type TabValue = "edit" | "password";

// ============================================
// COMPONENT
// ============================================

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [isClient, setIsClient] = useState(false);
  const storedValue = localStorage.getItem("UserLoginTokenApt");
  const UserStatus = localStorage.getItem("UserStatus");

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabValue>("edit");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({
    show: false,
    message: "",
    type: "success",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize client
  useEffect(() => {
    setIsClient(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch profile
  useEffect(() => {
    if (storedValue && UserStatus !== "DEACTIVATE") {
      GetProfile()
        .then((data) => {
          setProfile(data);
          setName(data?.name || "");
          setMobile(data?.mobile || "");
        })
        .catch(console.error);
    }
  }, [storedValue, UserStatus]);

  // Load redux profile
  useEffect(() => {
    if (storedValue) {
      dispatch(getClientProfile(storedValue) as any);
    }
  }, [dispatch, storedValue]);

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(
        () => setToast((prev) => ({ ...prev, show: false })),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Show toast helper
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file", "error");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // Get profile image URL
  const getProfileImage = () => {
    if (previewUrl) return previewUrl;
    if (profile?.attachements?.length) {
      return `${Image_URL}${profile.attachements[0].file_name}`;
    }
    return ProfileDummy;
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    if (!oldPassword) newErrors.oldPassword = "Old password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!validateEditForm()) return;

    setIsLoading(true);
    try {
      const res = await UserEditProfileAPI(name, selectedImage, mobile);
      if (storedValue) {
        dispatch(getClientProfile(storedValue) as any);
      }
      setProfile(res.data);
      if (res.data?.code === 200 || res.data?.status === 200) {
        showToast("Profile updated successfully", "success");
        setSelectedImage(null);
        setPreviewUrl("");
      }
    } catch (error) {
      showToast("Failed to update profile", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      const res = await ChangePasswordAPI({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (res.data?.code === 200 || res.data?.status === 200) {
        showToast("Password changed successfully. Redirecting...", "success");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to change password",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password form
  const handleResetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  // Auth check
  if (!isClient || !storedValue) return <Signin />;

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast--${toast.type}`}>
          {toast.type === "success" ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="profile-container">
        {/* Profile Header Card */}
        <header className="profile-header">
          <div className="profile-header__avatar-section">
            <div className="profile-header__avatar">
              <img src={getProfileImage()} alt="Profile" />
              <button
                className="profile-header__avatar-edit"
                onClick={triggerFileInput}
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="visually-hidden"
              />
            </div>
          </div>
          <div className="profile-header__info">
            <h1 className="profile-header__name">{profile?.name || "User"}</h1>
            <p className="profile-header__email">{profile?.email}</p>
            <span className="profile-header__badge">
              <User size={14} />
              Active Account
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="profile-content">
          {/* Sidebar Tabs */}
          <nav className="profile-tabs">
            <button
              className={`profile-tab ${
                activeTab === "edit" ? "profile-tab--active" : ""
              }`}
              onClick={() => setActiveTab("edit")}
            >
              <Settings size={18} />
              <span className="profile-tab__text">Edit Profile</span>
            </button>
            <button
              className={`profile-tab ${
                activeTab === "password" ? "profile-tab--active" : ""
              }`}
              onClick={() => setActiveTab("password")}
            >
              <Shield size={18} />
              <span className="profile-tab__text">Change Password</span>
            </button>
          </nav>

          {/* Form Section */}
          <div className="profile-form-section">
            {activeTab === "edit" ? (
              <div className="profile-form">
                <div className="profile-form__header">
                  <h2 className="profile-form__title">Edit Profile</h2>
                  <p className="profile-form__subtitle">
                    Update your personal information
                  </p>
                </div>

                <div className="profile-form__body">
                  {/* Profile Picture Upload */}
                  <div className="form-field form-field--upload">
                    <label className="form-field__label">Profile Picture</label>
                    <div className="upload-preview">
                      <img
                        src={getProfileImage()}
                        alt="Preview"
                        className="upload-preview__image"
                      />
                      <div className="upload-preview__actions">
                        <button
                          className="btn btn--outline-sm"
                          onClick={triggerFileInput}
                        >
                          <Camera size={16} />
                          Change Photo
                        </button>
                        {(selectedImage || profile?.attachements?.length) && (
                          <span className="upload-preview__hint">
                            {selectedImage
                              ? "New image selected"
                              : "Current photo"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="form-field">
                    <label className="form-field__label">
                      <User size={16} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        errors.name ? "form-input--error" : ""
                      }`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <span className="form-field__error">{errors.name}</span>
                    )}
                  </div>

                  {/* Email Field (Disabled) */}
                  <div className="form-field">
                    <label className="form-field__label">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input form-input--disabled"
                      value={profile?.email || ""}
                      disabled
                    />
                    <span className="form-field__hint">
                      Email cannot be changed
                    </span>
                  </div>

                  {/* Phone Field */}
                  <div className="form-field">
                    <label className="form-field__label">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    <div className="phone-input-wrapper">
                      <PhoneInput
                        defaultCountry="US"
                        value={mobile}
                        onChange={(value) => setMobile(value || "")}
                        className="phone-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-form__footer">
                  <button
                    className="btn btn--primary"
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-form">
                <div className="profile-form__header">
                  <h2 className="profile-form__title">Change Password</h2>
                  <p className="profile-form__subtitle">
                    Keep your account secure
                  </p>
                </div>

                <div className="profile-form__body">
                  {/* Old Password */}
                  <div className="form-field">
                    <label className="form-field__label">
                      <Lock size={16} />
                      Current Password
                    </label>
                    <div className="input-wrapper">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        className={`form-input ${
                          errors.oldPassword ? "form-input--error" : ""
                        }`}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="input-wrapper__toggle"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.oldPassword && (
                      <span className="form-field__error">
                        {errors.oldPassword}
                      </span>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="form-field">
                    <label className="form-field__label">
                      <Lock size={16} />
                      New Password
                    </label>
                    <div className="input-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className={`form-input ${
                          errors.newPassword ? "form-input--error" : ""
                        }`}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="input-wrapper__toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <span className="form-field__error">
                        {errors.newPassword}
                      </span>
                    )}
                    <span className="form-field__hint">
                      Minimum 6 characters
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-field">
                    <label className="form-field__label">
                      <Lock size={16} />
                      Confirm New Password
                    </label>
                    <div className="input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-input ${
                          errors.confirmPassword ? "form-input--error" : ""
                        }`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="input-wrapper__toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="form-field__error">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className="profile-form__footer">
                  <button
                    className="btn btn--ghost"
                    onClick={handleResetPasswordForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
