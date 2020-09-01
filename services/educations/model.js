const mongoose = require("mongoose");
//TODO:CHECK IF USER EXISTS IN VALIDATION FUNC
const Users = require("../users/model");
const schema = mongoose.Schema(
  {
    school: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://2fmb85sdhif36p9bt4ee8dxg-wpengine.netdna-ssl.com/wp-content/themes/smarty/assets/img/tmp/placeholder.jpg",
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    description: {
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
const Experiences = mongoose.model("Educations", schema);
module.exports = Experiences;
