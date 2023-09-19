const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    images: [
      {
        type: String,
        default: "",
      },
    ],
    content: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
