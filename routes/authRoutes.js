const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

// Registration route
router.post("/register", async (req, res) => {
  const { username, name, age, email, password } = req.body;

  try {
    const userWithEmail = await userModel.findOne({ email });
    const userWithUsername = await userModel.findOne({ username });

    if (userWithUsername)
      return res.status(400).send({ message: "Username already exists" });
    if (userWithEmail)
      return res.status(400).send({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      username,
      name,
      age,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ email, userid: user._id }, "SECRET_KEY", {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.redirect("/login");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.redirect("/login");

    const token = jwt.sign({ email, userid: user._id }, "SECRET_KEY");
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send({ message: "Server error" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

module.exports = router;
