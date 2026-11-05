const AppError = require("../utils/AppError");
function notFound(req, res, next) { next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404)); }
function errorHandler(err, req, res, next) {
  let error = err;
  if (err.name === "ValidationError") error = new AppError(Object.values(err.errors).map((e) => e.message).join(", "), 400);
  if (err.name === "CastError") error = new AppError("Invalid resource identifier", 400);
  if (err.code === 11000) error = new AppError("An account or record with this value already exists", 409);
  const status = error.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: status === 500 && process.env.NODE_ENV === "production" ? "Internal server error" : error.message, code: error.code || "ERROR" });
}
module.exports = { notFound, errorHandler };
