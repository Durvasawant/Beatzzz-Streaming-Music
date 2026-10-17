import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import Path from "path";
import cors from "cors";
import fs from "fs";


import connectDB from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import trackRoutes from "./routes/track.route.js";
import spotifyRoutes from "./routes/spotify.route.js";

dotenv.config();

const app = express();
const __dirname = Path.resolve();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const TMP_DIR = Path.join(__dirname, "tmp");
fs.mkdirSync(TMP_DIR, { recursive: true });

app.use(express.json());

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: TMP_DIR,
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
}));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/spotify", spotifyRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === "development"
      ? err.message
      : "Internal Server Error",
  });
});

const start = async () => {
  await connectDB(); // exit early with a helpful message if the DB is unreachable
  app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
};

start();
