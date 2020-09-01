const { join } = require("path");
require("dotenv").config({ path: join(__dirname, "../.env") });
const cloudinary = require("cloudinary").v2;
const { cloud_name, api_key, api_secret } = process.env;
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

module.exports = cloudinary;
