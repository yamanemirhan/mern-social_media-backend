const express = require("express");
const router = express.Router();

const auth = require("./auth");
const user = require("./user");
const post = require("./post");
const comment = require("./comment");

// const story = require("./story");

router.use("/auth", auth);
router.use("/user", user);
router.use("/post", post);
router.use("/comment", comment);

// router.use("/story", story);

module.exports = router;
