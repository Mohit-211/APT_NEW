import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetProfile } from "@/utils/api/Api";

/* =========================
   TYPES
========================= */

export interface ProfileAttachment {
  file_name: string;
  file_type?: string;
}

export interface ClientProfileData {
  name: string;
  email: string;
  mobile: string;
  attachements?: ProfileAttachment[];
}

interface ClientProfileState {
  clientProfile: ClientProfileData | null;
  loading: boolean;
  error: string | null;
}

/* =========================
   INITIAL STATE
========================= */

const initialState: ClientProfileState = {
  clientProfile: null,
  loading: false,
  error: null,
};

/* =========================
   THUNK
========================= */

export const getClientProfile = createAsyncThunk<
  ClientProfileData, // Return type
  void,              // ✅ No argument needed
  { rejectValue: string }
>("clientProfile/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await GetProfile();

    if (!res?.data) {
      return rejectWithValue("Invalid profile response.");
    }

    return {
      name: res.data.name,
      email: res.data.email,
      mobile: res.data.mobile,
      attachements: res.data.attachements ?? [],
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to fetch profile"
    );
  }
});

/* =========================
   SLICE
========================= */

const clientProfileSlice = createSlice({
  name: "clientProfile",
  initialState,
  reducers: {
    resetClientProfile(state) {
      state.clientProfile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getClientProfile.fulfilled,
        (state, action: PayloadAction<ClientProfileData>) => {
          state.loading = false;
          state.clientProfile = action.payload;
        }
      )
      .addCase(getClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Unable to load profile data.";
      });
  },
});

export const { resetClientProfile } = clientProfileSlice.actions;
export default clientProfileSlice.reducer;
