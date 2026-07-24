import { clientServer } from "../../../config.js";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      console.log("loginUser called with:", user);
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });
      console.log("loginUser response:", response.data);

      if (response.data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", response.data.token);
        }
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }

      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      console.error("loginUser error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const request = await clientServer.post("/register", {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });
      return thunkAPI.fulfillWithValue(request.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      console.log("getAboutUser called with:", user);
      const request = await clientServer.get("/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });
      console.log("getAboutUser response:", request.data);
      return thunkAPI.fulfillWithValue(request.data);
    } catch (err) {
      console.error("getAboutUser error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      console.log("getAllUsers called");
      const request = await clientServer.get("/user/get_all_users");
      console.log("getAllUsers response:", request.data);
      return thunkAPI.fulfillWithValue(request.data);
    } catch (err) {
      console.error("getAllUsers error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      console.log("Sending connection request with:", user);
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: user.token,
          targetUserId: user.targetUserId,
        },
      );
      console.log("Connection request response:", response.data);
      thunkAPI.dispatch(getMyConnectionsRequests({ token: user.token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      console.error("Send connection request error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      console.log("Getting connections for token:", user.token);
      const request = await clientServer.get("/user/get_connection_requests", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(request.data);
    } catch (err) {
      console.error("Get connections error:", err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const getMyConnectionsRequests = createAsyncThunk(
  "user/getMyConnectionsRequests",
  async (user, thunkAPI) => {
    try {
      console.log("Getting connection requests for token:", user.token);
      const request = await clientServer.post("/user/get_connection_requests", {
        token: user.token,
      });
      console.log("Connection requests response:", request.data);
      return thunkAPI.fulfillWithValue(request.data.connection);
    } catch (err) {
      console.error("Get connection requests error:", err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const whatAreMyConnectionRequests = createAsyncThunk(
  "user/whatAreMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      console.log("Getting pending connection requests for token:", user.token);
      const request = await clientServer.get(
        "/user/user_connection_request",
        {
          params: {
            token: user.token,
          },
        },
      );
      console.log("Pending connection requests response:", request.data);
      return thunkAPI.fulfillWithValue(request.data);
    } catch (err) {
      console.error("Get pending requests error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const AcceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      console.log("Accepting connection request with:", user);
      const request = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          connectionId: user.connectionId,
          action_type: user.action, // backend uses action_type
        },
      );
      console.log("Accept connection response:", request.data);

      return thunkAPI.fulfillWithValue(request.data);
    } catch (err) {
      console.error("Accept connection error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);
