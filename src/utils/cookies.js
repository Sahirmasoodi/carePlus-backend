const isProduction = () => process.env.NODE_ENV === "production";
const base = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  path: "/",
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
});
function setAuthCookie(res, token) {
  res.cookie("careplus_token", token, { ...base(), maxAge: 24 * 60 * 60 * 1000 });
}
function clearAuthCookie(res) {
  res.clearCookie("careplus_token", base());
}
module.exports = { setAuthCookie, clearAuthCookie };
