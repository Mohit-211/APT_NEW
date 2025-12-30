import axiosInstance from "./axiosInstance";

// ============================================================================
// TYPES
// ============================================================================

export interface OTPPayload {
  email: string;
  type: "email_verification" | "forget_password";
}

export interface LoginResponse {
  token: string;
  message: string;
  data?: any;
}

export interface ProfileUpdatePayload {
  name: string;
  mobile: string;
  image?: File | null;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AIPayload {
  prompt?: string;
  title?: string;
  content?: string;
  [key: string]: any;
}

export interface ChatPayload {
  conversation_id?: number | string;
  message?: string;
  prompt?: string;
}

// ============================================================================
// AUTH / USER
// ============================================================================

export const SendOTPAPI = (email: string) =>
  axiosInstance.post("auth/otp", {
    email,
    type: "email_verification",
  });

export const ForgetSendOTPAPI = (email: string) =>
  axiosInstance.post("auth/otp", {
    email,
    type: "forget_password",
  });

export const VerifyOtpAPI = (email: string, otp: string) =>
  axiosInstance.post("auth/verify-otp", {
    email,
    otp,
    type: "email_verification",
  });

export const UserRegisterAPI = (data: any) =>
  axiosInstance.post("auth/register", data);

export const UserLoginAPI = (email: string, password: string) =>
  axiosInstance.post<LoginResponse>("auth/login", { email, password });

export const UserLogOutAPI = () => axiosInstance.get("auth/logout");

// --------- Add near other AUTH / PROFILE functions ---------

export const ForgotPassword = (
  email: string,
  otp: string,
  password: string,
  confirm_Password: string
) =>
  axiosInstance.post("auth/forgot-password", {
    email,
    otp,
    password,
    confirm_Password,
  });

export const checkUserStatus = () => axiosInstance.get("user/checkUserStatus");

// ============================================================================
// PROFILE
// ============================================================================

export const GetProfile = () =>
  axiosInstance.get("user/profile").then((res) => res.data);

export const UserEditProfileAPI = async (
  name: string,
  image: File | null,
  mobile: string
) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("mobile", mobile);

  if (image) {
    formData.append("image", image);
  }

  return axiosInstance.put("user/updateProfile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const ChangePasswordAPI = ({
  old_password,
  new_password,
  confirm_password,
}: ChangePasswordPayload) =>
  axiosInstance.post("auth/reset-password", {
    old_password,
    new_password,
    confirm_password,
  });

// ============================================================================
// CALCULATORS
// ============================================================================

export const GetCalculatorDescription = (calculator_slug: string) =>
  axiosInstance.post("calculator/getCalculatorFromSlug", { calculator_slug });

export const CalculatorViewApi = (calculator_id: number | string) =>
  axiosInstance.post("user/markCalculatorAsViewed", { calculator_id });

// ============================================================================
// PROPOSALS
// ============================================================================

export const GetAllProposal = () => axiosInstance.get("proposal/all");

export const GetProposalById = (id: number | string) =>
  axiosInstance.get(`proposal/getProposalById?id=${id}`);

export const GetProposalCategoryList = () => axiosInstance.get("category/all");

export const ProposalByCategoryApi = (
  category_slug: string,
  limit: number,
  page: number
) =>
  axiosInstance.post(
    `proposal/get-proposal-from-category?limit=${limit}&page=${page}`,
    { category_slug }
  );

export const ProposalViewApi = (proposal_id: number | string) =>
  axiosInstance.post("user/markProposalAsViewed", { proposal_id });

// ============================================================================
// CONTENT / FOOTER / BANNERS
// ============================================================================

export const GetHomePageContent = () =>
  axiosInstance.get("content/getAllContent");

export const GetBanner = () => axiosInstance.get("content/getAllBannerContent");

export const FooterContentApi = () =>
  axiosInstance.get("content/getAllSocialLogin");

// ============================================================================
// DRAFTS
// ============================================================================

export const DraftCalculationApi = (data: any) =>
  axiosInstance.post("proposal/createProposalForUserUsingCalculatorData", data);

export const GetDraftCalculationApi = () =>
  axiosInstance.get("proposal/getAllUserProposal");

export const UpdateDraft = (draft_id: number | string, data: any) =>
  axiosInstance.post(`proposal/updateUserDraft/${draft_id}`, data);

export const deleteDraft = (draft_id: number | string) =>
  axiosInstance.post("proposal/deleteUserDraft", { draft_id });

// ============================================================================
// APE CALCULATOR AI
// ============================================================================

export const getAPECalFeedback = (payload: AIPayload) =>
  axiosInstance.post("ape/analysis", payload);

export const generateAiProposal = (payload: AIPayload) =>
  axiosInstance.post("ape/proposal/ai", payload);

// ============================================================================
// AI CHAT SYSTEM
// ============================================================================

export const GetAllConversation = () =>
  axiosInstance.get("aichat/conversations");

export const PostQueryOfAI = (payload: ChatPayload) =>
  axiosInstance.post("aichat/query", payload);

export const PostconversationDetailOfAI = (payload: ChatPayload) =>
  axiosInstance.post("aichat/conversations/chats", payload);

export const DeleteConversationApi = (conversation_id: number | string) =>
  axiosInstance.delete(`aichat/conversations/remove/${conversation_id}`);

export const ChatExpend = (payload: ChatPayload) =>
  axiosInstance.post("aichat/conversations/chats/chat/details", payload);

export const ChatShorte = (payload: ChatPayload) =>
  axiosInstance.post("aichat/conversations/chats/chat/summarize", payload);

export const ChateProposalEdited = (payload: ChatPayload) =>
  axiosInstance.post("aichat/conversations/chats/message/update", payload);

export const GetBusiness = async () => {
  return await axiosInstance.get("business");
}


export const GetTemplates = async () => {
  return await axiosInstance.get("templates");
}