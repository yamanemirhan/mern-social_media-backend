const jwt = require("jsonwebtoken");
const CustomError = require("../../helpers/error/CustomError");

const getAccessToRoute = async (req, res, next) => {
  const token = await req.cookies.access_token;
  const { JWT_SECRET_KEY } = process.env;

  if (!token) {
    return next(
      new CustomError("You are not authorized to access this route"),
      401
    );
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(
        new CustomError("You are not authorized to access this route", 401)
      );
    }
    req.user = {
      id: decoded.id,
    };
    next();
  });
};

module.exports = {
  getAccessToRoute,
};
