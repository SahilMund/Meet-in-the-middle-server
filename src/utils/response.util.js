const sendResponse = (
  res,
  message = "Success",
  statusCode = 200,
  data = null
) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
};
export default sendResponse;
