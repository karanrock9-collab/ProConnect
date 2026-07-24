import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  getAboutUser,
  getAllUsers,
  getConnectionsRequest,
  getMyConnectionsRequests,
  whatAreMyConnectionRequests,
  AcceptConnection,
} from "../../action/authAction";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  isTokenThere: false,
  message: "",
  profileFetched: false,
  connections: [],
  connectionRequest: [], // requests sent by user
  pendingRequests: [], // requests received by user
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "hello";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state, action) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state, action) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        ((state.isLoading = true), (state.message = "Knocking the door..."));
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Login is Successfull";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false;
        state.message = {
          message: "Registration is Successful! Please log in to continue",
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAboutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.loggedIn = true;
        state.user = action.payload.userProfile;
      })
      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles;
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connectionRequest = action.payload;
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getMyConnectionsRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyConnectionsRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connectionRequest = action.payload || [];
      })
      .addCase(getMyConnectionsRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(AcceptConnection.fulfilled, (state, action) => {
        // After accepting, refresh the connection requests
        state.message = "Connection accepted successfully!";
      })
      .addCase(AcceptConnection.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(whatAreMyConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(whatAreMyConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRequests = action.payload || [];
      })
      .addCase(whatAreMyConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      });
  },
});

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } =
  authSlice.actions;

export default authSlice.reducer;
