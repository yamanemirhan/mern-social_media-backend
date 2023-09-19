const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StorySchema = new Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
      default: "",
    },
    viewers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
