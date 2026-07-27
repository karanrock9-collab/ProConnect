import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "pro-connect",
      resource_type: file.mimetype === "application/pdf" ? "auto" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    };
  },
});

export { cloudinary, storage };
