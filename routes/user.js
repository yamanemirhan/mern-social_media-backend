const express = require("express");
const {
  getUser,
  getSearchUserNames,
  follow,
  unfollow,
  cancelFollowRequest,
  acceptFollowRequest,
  dismissFollowRequest,
  editProfile,
  getFollowers,
  getFollowings,
  getSentRequests,
  getFollowerRequests,
} = require("../controllers/user");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const imageUpload = require("../middlewares/libraries/imageUpload");

const router = express.Router();

router.get("/profile", [getAccessToRoute], getUser);
router.get("/get/:search", [getAccessToRoute], getSearchUserNames);
router.post("/follow/:id", [getAccessToRoute], follow);
router.post("/unfollow/:id", [getAccessToRoute], unfollow);
router.post("/cancel/:id", [getAccessToRoute], cancelFollowRequest);
router.post("/accept/:id", [getAccessToRoute], acceptFollowRequest);
router.post("/dismiss/:id", [getAccessToRoute], dismissFollowRequest);
router.post(
  "/edit",
  [getAccessToRoute, imageUpload.single("profile_image")],
  editProfile
);
router.get("/followers/:id", [getAccessToRoute], getFollowers);
router.get("/followings/:id", [getAccessToRoute], getFollowings);
router.get("/sentRequests", [getAccessToRoute], getSentRequests);
router.get("/followerRequests", [getAccessToRoute], getFollowerRequests);

module.exports = router;
