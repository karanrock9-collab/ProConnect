import axios from "axios";

export const BASE_URL = "https://proconnect-key6.onrender.com/";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});

export const resolveMediaUrl = (mediaPath) => {
  if (!mediaPath) return "/profile.png";
  if (mediaPath.startsWith("http")) return mediaPath;
  if (mediaPath === "default.jpg" || mediaPath === "default.png") return "/profile.png";
  return `${BASE_URL}/uploads/${mediaPath}`;
};
