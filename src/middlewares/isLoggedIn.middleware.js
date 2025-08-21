import jwt from "jsonwebtoken";

import sendResponse from "../utils/response.util.js";

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return sendResponse(res, "User not authorised", 401);
  }

  try {
    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return sendResponse(res, "Token expired", 401);
          }
          return sendResponse(res, "User not found", 401);
        } else {
          return decoded;
        }
      }
    );

    req.user = {
      id: decodedUser.id,
      email: decodedUser.email,
    };

    next();
  } catch (err) {
    return sendResponse(res, "Invalid or expired token", 401);
  }
};

export default isLoggedIn;
