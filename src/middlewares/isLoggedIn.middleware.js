import jwt from "jsonwebtoken";
import sendResponse from "../utils/response.util.js";

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return sendResponse(res, "User Token Not Found", 400, null);
  }
  const secret = process.env.JWT_SECRET_KEY;
  const decodedUser = jwt.verify(token, secret, (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
      return sendResponse(res, "User Token Expired", 401, null);
    }
    if (err) {
      console.error("Token verification error:", err);
      console.log(decoded)
      return sendResponse(res, "Invalid User Token", 401, null);
    }
    return decoded;
  });
  // const user = await User.findOne({ _id: decodedUser?.id });
  // It takes some waiting time to get the user from the database
  // so we can store the all the required user data in the token itself
  // req.user = {
  //   id: decodedUser?.id,
  //   email: decodedUser?.email,
  //   role: user.role,
  // };
  req.user = decodedUser;
  next();
};
export default isLoggedIn;
