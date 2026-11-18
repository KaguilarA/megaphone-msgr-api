import { Schema } from "mongoose";

export default {
  name: "Installation",
  model: {
    _id: { type: String },
    administrator: { type: Schema.Types.ObjectId, ref: "User" },
    completedAt: Date,
    version: { type: Number, default: 1 },
  },
};
