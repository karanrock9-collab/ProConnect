import Profile from "../models/profile_model.js";

import User from "../models/user_model.js";

import bcrypt from "bcrypt";

import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import mongoose from "mongoose";
import { ConnectionReadyEvent } from "mongodb";
import { connect } from "http2";
import ConnectionRequest from "../models/connections_model.js";
import Post from "../models/post_model.js";
import Comment from "../models/comments_model.js";

const convertUserDataTOPDF = async (userdata) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("./uploads/" + outputPath);
    doc.pipe(stream);

    // Only add image if profile picture exists
    if (userdata?.userId?.profilePicture) {
      doc.image(`./uploads/${userdata.userId.profilePicture}`, {
        align: "center",
        width: 100,
      });
    }
    doc.fontSize(14).text(`Name: ${userdata?.userId?.name || "N/A"}`);
    doc.fontSize(14).text(`Username: ${userdata?.userId?.username || "N/A"}`);
    doc.fontSize(14).text(`Email: ${userdata?.userId?.email || "N/A"}`);
    doc.fontSize(14).text(`Bio: ${userdata?.bio || "N/A"}`);
    doc
      .fontSize(14)
      .text(`Current Position : ${userdata?.currentPost || "N/A"}`);

    doc.fontSize(14).text("Past Work: ");
    if (userdata?.pastWork?.length > 0) {
      userdata.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`Company Name: ${work.company || "N/A"}`);
        doc.fontSize(14).text(`Position: ${work.position || "N/A"}`);
        doc.fontSize(14).text(`Year: ${work.years || "N/A"}`);
      });
    } else {
      doc.fontSize(14).text("No past work experience listed");
    }

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({
      email,
    });

    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const profile = new Profile({
      userId: newUser._id,
    });

    await profile.save();

    return res.json({ message: "User Created" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({
      email,
    });

    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = crypto.randomBytes(64).toString("hex");

    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = req.file.filename;

    await user.save();

    return res.json({ message: "Profile Picture Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    Object.assign(user, newUserData);

    await user.save();
    return res.json({ message: "User Upadated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    console.log(`Token: ${token}`);

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture",
    );

    return res.json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token: token });

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile_to_update = await Profile.findOne({ userId: userProfile.id });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.json({ message: "Profile Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture",
    );

    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;
    console.log("downloadProfile called with user_id:", user_id);

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture",
    );

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    console.log("Generating PDF for user:", userProfile.userId.username);
    let outputPath = await convertUserDataTOPDF(userProfile);
    console.log("PDF generated at:", outputPath);
    return res.json({ message: outputPath });
  } catch (error) {
    console.error("downloadProfile error:", error);
    return res
      .status(500)
      .json({ message: "Error generating PDF", error: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, targetUserId, connectionId } = req.body;
  const targetUserIdValue = targetUserId || connectionId;

  try {
    console.log("sendConnectionRequest called with:", {
      token,
      targetUserId,
      connectionId,
      targetUserIdValue,
    });
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findOne({ _id: targetUserIdValue });

    if (!connectionUser) {
      return res.status(400).json({ message: "Connection User not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: user._id, connectionId: connectionUser._id },
        { userId: connectionUser._id, connectionId: user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    console.log("Connection request saved successfully!");
    return res.json({ message: "Request sent" });
  } catch (err) {
    console.error("sendConnectionRequest error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getMyConnectionsRequests = async (req, res) => {
  const { token } = req.body;
  console.log("getMyConnectionsRequests called with token:", token);

  try {
    const user = await User.findOne({ token });
    console.log("Found user:", user);

    if (!user) {
      console.log("User not found with token");
      return res.status(404).json({ message: "User not found" });
    }
    const connection = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");
    console.log("Found connections:", connection);

    return res.json({ connection });
  } catch (err) {
    console.error("Error getting connections:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, connectionId, action_type } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findOne({ _id: connectionId });

    if (!connection) {
      return res.status(404).json({ message: "Connection Request not found" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else if (action_type === "reject") {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.json({ message: "Request Updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, comment } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({
      _id: post_id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      userId: user._id,
      postId: post._id,
      body: comment,
    });

    await newComment.save();
    return res.status(200).json({ message: "Comment Added" });
  } catch (err) {
    console.error("commentPost error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.body;

  try {
    const post = await Post.findOne({
      _id: post_id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "name username",
    );

    return res.json({ comments: comments });
  } catch (err) {
    console.error("get_comments_by_post error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found " });
    }

    const comment = await Comment.findOne({ _id: comment_id });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.deleteOne({ _id: comment_id });

    return res.json({ message: "Comment Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const increment_likes = async (req, res) => {
  const { post_id } = req.body;

  try {
    console.log("increment_likes called with post_id:", post_id);
    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      console.log("Post not found for id:", post_id);
      return res.status(404).json({ message: "Post not found" });
    }

    post.likes = post.likes + 1;
    await post.save();

    console.log("Likes incremented, new likes count:", post.likes);
    return res.json({ message: "Likes Incremented", likes: post.likes });
  } catch (err) {
    console.error("increment_likes error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture",
    );

    return res.json({ profile: userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const whatAreMyConnectionRequests = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");
    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
