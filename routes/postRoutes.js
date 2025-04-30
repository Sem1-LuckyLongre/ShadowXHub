const express = require("express");
const router = express.Router();
const postModel = require("../models/post");
const userModel = require("../models/user");
const isLoggedIn = require("../middlewares/auth");

// View all posts
router.get("/all-posts", isLoggedIn, async (req, res) => {
  try {
    const allPosts = await postModel.find().populate("user");
    const user = await userModel.findById(req.user.userid);
    res.render("all-posts", { allPosts, user });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Create a post
router.post("/create-post", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userid);
    const post = await postModel.create({
      user: user._id,
      content: req.body.content,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Error creating post");
  }
});

// Like/unlike a post
router.get("/like/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);

    const likeIndex = post.likes.indexOf(req.user.userid);
    if (likeIndex === -1) {
      post.likes.push(req.user.userid);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send("Failed to update like");
  }
});

// Edit post
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    const user = await userModel.findById(req.user.userid);
    res.render("edit", { post, user });
  } catch {
    res.redirect("/profile");
  }
});
router.post("/update/:id", isLoggedIn, async (req, res) => {
  try {
    await postModel.findByIdAndUpdate(req.params.id, {
      content: req.body.content,
    });
    res.redirect("/profile");
  } catch {
    res.status(500).send("Error updating post");
  }
});

// Delete post
router.get("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id).populate("user");

    if (post.user._id.toString() !== req.user.userid) {
      return res.redirect("/profile");
    }

    await postModel.findByIdAndDelete(req.params.id);
    await userModel.findByIdAndUpdate(req.user.userid, {
      $pull: { posts: req.params.id },
    });

    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete");
  }
});

module.exports = router;
