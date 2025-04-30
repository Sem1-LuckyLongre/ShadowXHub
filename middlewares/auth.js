const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const data = jwt.verify(token, "SECRET_KEY");
    req.user = data;
    next();
  } catch (err) {
    res.redirect("/login");
  }
}

module.exports = isLoggedIn;
