const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const user = await User.findById(req.body._id)
  const token = req.cookies?.jwta || req.query?.token || user.accessToken
  if (!token) {
    return res.status(403).json("Please sign in");
  }
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;