const express = require("express");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const imageUpload = require("../middlewares/libraries/imageUpload");
const {
  getFollowingPosts,
  createPost,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  getLikedPosts,
} = require("../controllers/post");
const {
  checkPostExists,
} = require("../middlewares/database/databaseErrorHelpers");

const router = express.Router();

router.get("/followings", getAccessToRoute, getFollowingPosts);
router.post(
  "/create",
  [getAccessToRoute, imageUpload.array("post_image")],
  createPost
);
router.get("/get/:id", getAccessToRoute, getUserPosts);
router.put(
  "/update/:id",
  getAccessToRoute,
  checkPostExists,
  imageUpload.array("post_image"),
  updatePost
);
router.delete("/delete/:id", getAccessToRoute, checkPostExists, deletePost);
router.post("/like/:id", getAccessToRoute, checkPostExists, likePost);
router.get("/likedPosts", getAccessToRoute, getLikedPosts);

module.exports = router;
