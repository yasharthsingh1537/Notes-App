import express from "express";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/signup", signup);
authRoute.post("/login", login);
authRoute.get("/me", authMiddleware, getMe);

export default authRoute;
