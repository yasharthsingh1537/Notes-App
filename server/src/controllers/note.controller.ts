import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { Note } from "../models/Note.model.js";

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, color, tag, isPinned, isArchived } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (isPinned !== undefined && typeof isPinned !== "boolean") {
      return res.status(400).json({
        message: "isPinned must be a boolean",
      });
    }

    if (isArchived !== undefined && typeof isArchived !== "boolean") {
      return res.status(400).json({
        message: "isArchived must be a boolean",
      });
    }

    const userId = res.locals.auth?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      ...(content !== undefined && { content }),
      ...(color !== undefined && { color }),
      ...(tag !== undefined && { tags: tag }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isArchived !== undefined && { isArchived }),
      userId,
    });

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "Note validation failed",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    return next(error);
  }
}

export async function getNotes(_req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notes = await Note.find({ userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      count: notes.length,
      notes,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNoteById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = res.locals.auth?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }
    return res.status(200).json({ note });
  } catch (error) {
    return next(error);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = res.locals.auth?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const allowedFields = ["title", "content", "color", "tags", "isPinned", "isArchived"] as const;
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (updates.isPinned !== undefined && typeof updates.isPinned !== "boolean") {
      return res.status(400).json({
        message: "isPinned must be a boolean",
      });
    }

    if (updates.isArchived !== undefined && typeof updates.isArchived !== "boolean") {
      return res.status(400).json({
        message: "isArchived must be a boolean",
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "Note validation failed",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    return next(error);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = res.locals.auth?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: id,
      userId,
    });

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
