require("dotenv").config();
// it is creating folder structure for photo upload
require("./utils/files.utils")();
const http = require("http");

const express = require("express");
const cors = require("cors");
const { join } = require("path");
const app = express();
app.use(express.json());
app.use(cors());
const YAML = require("yamljs");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = YAML.load(join(__dirname, "./docs/index.yml"));

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/photo", express.static(join(__dirname, "./files/photos/")));
app.use("/users", require("./services/users"));
app.use("/experiences", require("./services/experiences"));
app.use("/educations", require("./services/educations"));
app.use("/languages", require("./services/languages"));
app.use("/certifications", require("./services/certifications"));

app.use("/posts", require("./services/posts"));

const server = http.createServer(app);

const mongoose = require("mongoose");

mongoose.connect(
  process.env.ENVIRONMENT === "dev"
    ? process.env.MONGO_STRING
    : process.env.MONGO_ATLAS_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    server.listen(process.env.PORT || 3001);
    server.on("listening", () =>
      console.log("Database Connected and Server is ready!")
    );
    server.on("error", () => console.log("Error!"));
  }
);
