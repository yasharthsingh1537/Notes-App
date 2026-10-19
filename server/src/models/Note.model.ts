import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [50, "Title must be at most 50 characters long"],
    },
    content: {
      type: String,
      default: undefined,
    },
    color: {
      type: String,
      default: "#ffffff",
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a valid hex color code"],
    },
    tags: {
      type: [
        {
          type: String,
          required: [true, "Each tag is required"],
          trim: true,
          minlength: [1, "Each tag must be at least 1 character long"],
          maxlength: [8, "Each tag must be at most 8 characters long"],
        },
      ],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 5,
        message: "You can add at most 5 tags to a note",
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  { timestamps: true },
);

notesSchema.index({ userId: 1, isArchived: 1 });
notesSchema.index({ userId: 1, isPinned: 1 });

export const Note = mongoose.model("Note", notesSchema);
