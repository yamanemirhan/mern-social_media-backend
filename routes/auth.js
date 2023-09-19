const express = require("express");
const { register, login, logout } = require("../controllers/auth");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const {
  checkEmailExists,
} = require("../middlewares/database/databaseErrorHelpers");

const router = express.Router();

router.post("/register", register);
router.post("/login", checkEmailExists, login);
router.get("/logout", getAccessToRoute, logout);

module.exports = router;
