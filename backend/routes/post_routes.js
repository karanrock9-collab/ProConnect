import { Router } from "express";
import multer from "multer";
import fs from "fs";
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
import storage from "../cloudConfig.js";

const router = Router();
const upload = multer({ storage: storage });

router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    console.log(req.file);

    const newPost = new Post({
      content: req.body.content,

      // Cloudinary URL
      image: req.file ? req.file.path : null,

      user: req.user._id,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const stroage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: stroage });

router.route("/").get(activeCheck);

router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").post(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/increment_post_likes").post(increment_likes);

export default router;
