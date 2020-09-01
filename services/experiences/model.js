const mongoose = require("mongoose");
//TODO:CHECK IF USER EXISTS IN VALIDATION FUNC
const Users = require("../users/model");
const schema = mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    company: {
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
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcd5J_YDIyLfeZCHcsBpcuN8irwbIJ_VDl0Q&usqp=CAU",
    },
    description: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);
const Experiences = mongoose.model("Experiences", schema);
module.exports = Experiences;
