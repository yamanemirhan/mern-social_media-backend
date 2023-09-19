const CustomError = require("../../helpers/error/CustomError");
const Post = require("../../models/Post");
const User = require("../../models/User");

const checkUserExists = async (req, res, next) => {
  const id = req.params.id || req.query.id;
  const user = await User.findById({ _id: id });
  if (!user) {
    return next(new CustomError("There is no user with that id", 500));
  }
  next();
};

const checkEmailExists = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user)
    return next(new CustomError("There is no user with that email", 400));

  next();
};

const checkPostExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return next(new CustomError("There is no post with that id", 500));

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkPostExists,
  checkUserExists,
  checkEmailExists,
};
