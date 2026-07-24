import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import postRoutes from "./routes/post_routes.js";
import userRoutes from "./routes/user_routes.js";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(postRoutes);
app.use(userRoutes);

const start = async () => {
  const connectDB = mongoose.connect(
    "mongodb+srv://kunalkhamankar9_db_user:z8pzPixrGvJUUQVc@connectnow.qfdlwto.mongodb.net/?appName=ConnectNow",
  );

  app.listen(9080, () => {
    console.log("Server is running on port 9080");
  });
};

start();
