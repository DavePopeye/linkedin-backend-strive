const mongoose = require("mongoose");
//TODO:CHECK IF pass valid IN VALIDATION FUNC
//TODO: CHECK IF USER & EMAIL NOT EXISTS
const md5 = require("md5");
const Experiences = require("../experiences/model");
const Educations = require("../educations/model");
const Languages = require("../languages/model");
const Certifications = require("../certifications/model");
const schema = mongoose.Schema(
  {
    username: {
      type: String,
      validate: {
        validator: async (value) => {
          let exists = await Users.findOne({ username: value });
          if (exists) {
            throw new Error("This Username is already taken!");
          }
        },
      },
    },
    title: {
      type: String,
    },
    bio: {
      type: String,
    },
    area: {
      type: String,
    },
    name: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: async (value) => {
          let exists = await Users.findOne({ email: value });
          if (exists) {
            throw new Error("This email is already taken!");
          }
        },
      },
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "https://api.adorable.io/avatars/default",
    },
    cover: {
      type: String,
      default: "https://miro.medium.com/max/1124/1*92adf06PCF91kCYu1nPLQg.jpeg",
    },
    birthDate: Date,
    experiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Experiences,
      },
    ],
    educations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Educations,
      },
    ],
    certifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Certifications,
      },
    ],
    languages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Languages,
      },
    ],
  },
  { timestamps: true }
);
schema.toJSON = function () {
  delete this.password;
  delete this.updatedAt;
  delete this.createdAt;
  return this;
};
schema.static("checkMail", async function (email) {
  const exists = await Users.findOne({ email });
  return !exists;
});
schema.index({ name: "text", lastName: "text", email: "text", title: "text" });
const Users = mongoose.model("Users", schema);
module.exports = Users;
