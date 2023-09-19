const sendJwtToClient = (user, res) => {
  const token = user.generateJwtFromUser();
  const { JWT_COOKIE } = process.env;

  return res
    .status(200)
    .cookie("access_token", token, {
      httpOnly: true,
      sameSite: "none",
      expires: new Date(Date.now() + parseInt(JWT_COOKIE) * 1000),
      secure: true,
    })
    .json({
      success: true,
      data: "gulih0",
      message: "Successfully login",
    });
};

const getAccessTokenFromHeader = (req) => {
  return req.headers["authorization"];
};

module.exports = {
  sendJwtToClient,
  getAccessTokenFromHeader,
};
