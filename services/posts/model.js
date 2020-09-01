const mongoose = require("mongoose");
//TODO:CHECK IF USER EXISTS IN VALIDATION FUNC
const Users = require("../users/model");
const Comments = require("../comments/model");
const schema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: Comments }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: Users,
    },
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", schema);
module.exports = Posts;
