import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../config.js";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (__, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error("getAllPosts error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { token, file, body } = userData;
    try {
      console.log("createPost called!", { token, file, body });
      const formData = new FormData();
      formData.append("token", token);
      if (body) formData.append("body", body);
      if (file) formData.append("media", file);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("createPost response:", response);
      if (response.status === 200) {
        return thunkAPI.fulfillWithValue("Post Uploaded");
      } else {
        return thunkAPI.rejectWithValue("Post Not Uploaded");
      }
    } catch (error) {
      console.error("createPost error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: postData.token,
          post_id: postData.post_id,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error("deletePost error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementLike",
  async (post, thunkAPI) => {
    try {
      console.log("incrementPostLike called with post_id:", post.post_id);
      const response = await clientServer.post("/increment_post_likes", {
        post_id: post.post_id,
      });
      console.log("incrementPostLike response:", response);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error("incrementPostLike error:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      console.log("getAllComments called with postData:", postData);
      const response = await clientServer.post("/get_comments", {
        post_id: postData.post_id,
      });
      console.log("getAllComments response:", response);
      return thunkAPI.fulfillWithValue({
        comments: response.data.comments || [],
        post_id: postData.post_id,
      });
    } catch (error) {
      console.error("getAllComments error:", error);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  },
);

export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      console.log("postComment called with commentData:", commentData);
      const response = await clientServer.post("/comment", {
        token: commentData.token,
        post_id: commentData.post_id,
        comment: commentData.body,
      });
      console.log("postComment response:", response);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error("postComment error:", error);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  },
);
