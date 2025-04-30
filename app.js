const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const db = require("./db/db");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

app.get("/", (req, res) => {
  if (req.cookies.token) return res.redirect("/profile");
  res.render("index");
});
app.get("/login", (req, res) => res.render("login"));

app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", userRoutes);

db().then(() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on http://localhost:3000");
  });
});
