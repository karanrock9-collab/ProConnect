import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUserProfile,
  getMyConnectionsRequests,
  login,
  register,
  sendConnectionRequest,
  updateProfileData,
  updateUserProfile,
  getUserProfileAndUserBasedOnUsername,
  whatAreMyConnectionRequests,
} from "../controllers/user_controller.js";
import multer from "multer";
import fs from "fs";
import {
  getUserAndProfile,
  uploadProfilePicture,
} from "../controllers/user_controller.js";

const router = Router();

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
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: stroage });
router
  .route("/upload_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/get_connection_requests").post(getMyConnectionsRequests);
router.route("/user/user_connection_request").get(whatAreMyConnectionRequests);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router
  .route("/user/get_profile_based_on_username")
  .get(getUserProfileAndUserBasedOnUsername);

export default router;
