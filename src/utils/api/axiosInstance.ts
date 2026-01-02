import axios, { AxiosError } from "axios";
import { message } from "antd";

const BASE_URL = "https://node.automatedpricingtool.io:5000/api/v1/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/* ================= REDIRECT CONTROL ================= */

const REDIRECT_KEY = "hasRedirected";

const hasAlreadyRedirected = () =>
  sessionStorage.getItem(REDIRECT_KEY) === "true";

const setRedirected = () =>
  sessionStorage.setItem(REDIRECT_KEY, "true");

const clearRedirected = () =>
  sessionStorage.removeItem(REDIRECT_KEY);

/* ================= REQUEST ================= */

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("UserLoginTokenApt");
    if (token) {
      config.headers = config.headers || {};
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */

axiosInstance.interceptors.response.use(
  (response) => {
    clearRedirected();
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const apiMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "";

    const normalizedMessage = apiMessage.toLowerCase();

    const isJwtExpired =
      normalizedMessage.includes("jwt") ||
      normalizedMessage.includes("token expired") ||
      normalizedMessage.includes("unauthorized");

    console.error("API Error:", {
      status,
      message: apiMessage,
      url: error.config?.url,
    });

    /* ===== JWT EXPIRED (500) ===== */
    if (status === 500 && isJwtExpired && !hasAlreadyRedirected()) {
      setRedirected();

      message.error("Your session has expired. Please login again.");

      localStorage.removeItem("UserLoginTokenApt");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1500);

      return Promise.reject(error);
    }

    /* ===== AUTH ERROR ===== */
    if ((status === 401 || status === 403) && !hasAlreadyRedirected()) {
      setRedirected();

      message.error("Session expired. Please login again.");

      localStorage.removeItem("UserLoginTokenApt");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1500);

      return Promise.reject(error);
    }

    /* ===== NORMAL 500 ERROR ===== */
    if (status === 500 && !isJwtExpired) {
       setRedirected();

      message.error("Session expired. Please login again.");

      localStorage.removeItem("UserLoginTokenApt");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1500);

      return Promise.reject(error);
      message.error("Server error. Please try again later.");
    }

    /* ===== NETWORK ERROR ===== */
    if (!status) {
      message.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
