const express = require("express");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const { addComment, deleteComment } = require("../controllers/comment");
const {
  checkPostExists,
} = require("../middlewares/database/databaseErrorHelpers");

const router = express.Router();

router.post("/:id", [getAccessToRoute, checkPostExists], addComment);
router.delete("/:id", [getAccessToRoute], deleteComment);

module.exports = router;
