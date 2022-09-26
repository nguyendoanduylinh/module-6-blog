const express = require("express");
const router = express.Router();

const User = require("../models/Users");

const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

// @route POST api/auth/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  //Check missing input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameter(s)",
    });
  }

  try {
    // Check for existing user by username
    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Check for existing user by email
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already taken",
      });
    }

    // Save to database
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    //Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({
      success: true,
      message: "User created successfully",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //Check missing input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing username and/or password.",
    });
  }

  try {
    // Check existing user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect username and/or password",
      });
    }

    // Username found
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect username and/or password",
      });
    }

    //Return token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({
      success: true,
      message: "User logged in successfully.",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

module.exports = router;
