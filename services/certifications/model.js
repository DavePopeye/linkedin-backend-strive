const mongoose = require("mongoose");
//TODO:CHECK IF USER EXISTS IN VALIDATION FUNC
const Users = require("../users/model");
const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    canExpire: {
      type: Boolean,
      default: false,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://cdn-payscale.com/content/placeholder-images/certification-placeholder.png",
    },
    credentialId: {
      type: String,
      required: true,
    },
    credentialUrl: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  { timestamps: true }
);
const Certifications = mongoose.model("Certifications ", schema);
module.exports = Certifications;
