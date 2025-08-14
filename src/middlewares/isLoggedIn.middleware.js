import jwt from "jsonwebtoken";
import sendResponse from "../utils/response.util.js";

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return sendResponse(res, "User not authorised", 401);
  }
  try {
    const secret = process.env.JWT_SECRET_KEY;
    const decodedUser = jwt.verify(token, secret, (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
      return sendResponse(res, "User Token Expired", 401, null);
    }
    if (err) {
      return sendResponse(res, "Invalid User Token", 401, null);
    }
    return decoded;
  });
  req.user = decodedUser;
  next();
  } catch (err) {
    return sendResponse(res, "Invalid or expired token", 401);
  }

};

export default isLoggedIn;
