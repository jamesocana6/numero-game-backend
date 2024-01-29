const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies?.jwta || req.query?.token
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