const express = require("express");
const router = express.Router();

const Post = require("../models/Posts");

// @route POST api/posts
// @desc Create post
// @access Private
router.post("/", async (req, res) => {
  const { title, description, url, status } = req.body;

  //Simple validation
  if (!title) {
    return res.status(400).json({
      sucess: false,
      message: "Title is required.",
    });
  }
  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      status: status || "TO LEARN",
      user: "633158f367c2daed169f7ba3",
    });
    await newPost.save();
    res.json({
      success: true,
      message: "Happy learning!",
      post: newPost,
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
