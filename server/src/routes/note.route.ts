import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controller.js";

const noteRoute = Router();

noteRoute.use(authMiddleware);

noteRoute.post("/", createNote);
noteRoute.get("/", getNotes);
noteRoute.get("/:id", getNoteById);
noteRoute.put("/:id", updateNote);
noteRoute.delete("/:id", deleteNote);

export default noteRoute;
