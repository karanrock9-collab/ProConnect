import { Router } from "express";
import multer from "multer";
import Post from "../models/post_model.js";
import {
  activeCheck,
  createPost,
  deletePost,
  getAllPosts,
} from "../controllers/post_controller.js";
import {
  commentPost,
  delete_comment_of_user,
  get_comments_by_post,
  increment_likes,
} from "../controllers/user_controller.js";
import { storage } from "../cloudConfig.js";
import Image from 'next/image'


export default function Page() {
  return (
    <Image
      src="/profile.png"
      width={500}
      height={500}
      alt="Picture of the author"
    />
  )
}

const router = Router();
const upload = multer({ storage });

router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const mediaUrl = req.file?.path || req.file?.secure_url || "";

    const newPost = new Post({
      body: req.body.content || req.body.body || "",
      media: mediaUrl,
      fileType: req.file?.mimetype ? req.file.mimetype.split("/")[1] : "",
      userId: req.user?._id || null,
    });

    await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").post(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/increment_post_likes").post(increment_likes);

export default router;
