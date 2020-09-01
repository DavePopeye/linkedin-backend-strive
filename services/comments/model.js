const mongoose = require("mongoose");
//TODO:CHECK IF USER EXISTS IN VALIDATION FUNC
const Users = require("../users/model");
const schema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    belongsTo: { type: mongoose.Schema.Types.ObjectId, ref: "Posts" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  { timestamps: true }
);
const Comments = mongoose.model("Comments ", schema);
module.exports = Comments;
