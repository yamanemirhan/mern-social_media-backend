const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const { sendJwtToClient } = require("../helpers/authorization/tokenHelpers");
const {
  validateUserInput,
  comparePassword,
} = require("../helpers/input/inputHelpers");

const register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Successfully registered",
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!validateUserInput(email, password)) {
    return next(new CustomError("Please check your inputs", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please check your credentials", 400));
  }

  sendJwtToClient(user, res);
};

const logout = async (req, res, next) => {
  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
    })
    .json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  logout,
};
