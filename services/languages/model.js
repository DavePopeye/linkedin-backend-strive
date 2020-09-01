const mongoose = require("mongoose");
//TODO:CHECK IF USER EXISTS IN VALIDATION FUNC
const Users = require("../users/model");
const schema = mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
    },
    proficiency: {
      required: true,
      type: Number,
      validate: {
        validator: (value) => {
          if (
            parseInt(value) > 6 ||
            parseInt(value) < 0 ||
            isNaN(parseInt(value))
          ) {
            throw new Error("Language level should be between 0-6");
          }
        },
      },
    }, //
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);
const Experiences = mongoose.model("Languages ", schema);
module.exports = Experiences;
