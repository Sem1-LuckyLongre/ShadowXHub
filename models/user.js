const mongoose = require("mongoose");

// Recommended: handle DB connection separately in a config file.
// This file should only export the model.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 0,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post", // Capitalized to match naming convention
    },
  ],
});

// Export the User model
module.exports = mongoose.model("User", userSchema);
