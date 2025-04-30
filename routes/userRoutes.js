const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const isLoggedIn = require("../middlewares/auth");

// Profile
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userid).populate("posts");
    if (!user) return res.redirect("/login");

    res.render("profile", { user });
  } catch (err) {
    res.redirect("/login");
  }
});

// Edit profile form
router.get("/edit-profile", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userid);
    res.render("edit-profile", { user });
  } catch {
    res.redirect("/login");
  }
});

// Handle edit
router.post("/edit-profile", isLoggedIn, async (req, res) => {
  try {
    const { name, age } = req.body;
    await userModel.findByIdAndUpdate(req.user.userid, { name, age });
    res.redirect("/edit-profile");
  } catch (err) {
    res.status(500).send("Profile update failed");
  }
});

// Change password form
router.get("/change-password", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userid);
    res.render("change-password", { user });
  } catch {
    res.redirect("/login");
  }
});

// Handle password change
router.post("/change-password", isLoggedIn, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.userid);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.redirect("/change-password");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(req.user.userid, {
      password: hashedPassword,
    });

    res.redirect("/profile");
  } catch {
    res.status(500).send("Failed to change password");
  }
});

module.exports = router;
