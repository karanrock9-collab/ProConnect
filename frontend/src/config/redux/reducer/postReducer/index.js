import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, getAllComments } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  comments: [],
  postId: "",
  connections: [],
  connectionRequest: [],
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        console.log("getAllComments fulfilled! Payload:", action.payload);
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments;
        console.log("Updated postId:", state.postId);
        console.log("Updated comments:", state.comments);
      });
  },
});

export const { reset, resetPostId } = postSlice.actions;

export default postSlice.reducer;
