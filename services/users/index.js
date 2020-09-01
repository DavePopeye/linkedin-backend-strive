const router = require("express").Router();
const Model = require("./model");
const md5 = require("md5");
const Posts = require("../posts/model");
const Experiences = require("../experiences/model");
const Certifications = require("../certifications/model");
const Educations = require("../educations/model");
const Languages = require("../languages/model");
const {
  getUser,
  generateAuthString,
  authRequired,
} = require("../../utils/auth.utils");
const multer = require("multer");
const cloudinary = require("../../utils/photo.utils");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({ cloudinary });
const parser = multer({ storage: storage });
const { generateCV } = require("../../utils/pdf.utils");
router.get("/", getUser, async (req, res) => {
  try {
    let all = await Model.find({}, { password: 0 })
      .populate("experiences")
      .populate("educations")
      .populate("languages")
      .populate("certifications");

    res.send({ data: all });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/search/:query", getUser, async (req, res) => {
  try {
    let all = await Model.find(
      {
        $or: [
          { name: { $regex: req.params.query, $options: "i" } },
          { lastName: { $regex: req.params.query, $options: "i" } },
          { email: { $regex: req.params.query, $options: "i" } },
          { username: { $regex: req.params.query, $options: "i" } },
          { title: { $regex: req.params.query, $options: "i" } },
        ],
      },
      { password: 0 }
    )
      .populate("experiences")
      .populate("educations")
      .populate("languages")
      .populate("certifications");

    res.send({ data: all });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/:id", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let single = await Model.findById(req.user._id, { password: 0 })
        .populate("experiences")
        .populate("educations")
        .populate("languages")
        .populate("certifications");
      res.send({ data: single });
    } else {
      let single = await Model.findById(req.params.id, { password: 0 })
        .populate("experiences")
        .populate("educations")
        .populate("languages")
        .populate("certifications");
      res.send({ data: single });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/", async (req, res) => {
  try {
    let newObj = await new Model({
      ...req.body,
      password: md5(req.body.password),
    }).save();
    res.send({ data: newObj.toJSON() });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/login", generateAuthString, async (req, res) => {
  try {
    res.send({ authorization: req.authorization });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.put("/:id", authRequired, async (req, res) => {
  try {
    let isExists = await Model.findById(req.params.id);
    if (isExists) {
      if (req.body.email && isExists.email === req.body.email) {
        // same email coming
        delete req.body.email;
        let update = await Model.findByIdAndUpdate(req.params.id, req.body);
        let updated = await Model.findById(req.params.id, {
          password: 0,
        }).populate("experiences");
        res.send({ data: updated.toJSON() });
      } else {
        let isMailExists = await Model.findOne({ email: req.body.email });
        if (!isMailExists) {
          let update = await Model.findByIdAndUpdate(req.params.id, req.body);
          let updated = await Model.findById(req.params.id, {
            password: 0,
          }).populate("experiences");
          res.send({ data: updated.toJSON() });
        } else {
          res.status(500).send({ message: "This mail is taken." });
        }
      }
    } else {
      res.status(404).send("not found");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
router.put(
  "/:id/photo",
  authRequired,
  parser.single("photo"),
  async (req, res) => {
    try {
      const { path } = req.file;
      let obj = await Model.findById(req.params.id);
      obj.image = path;
      let update = await Model.findByIdAndUpdate(req.params.id, obj);
      let updated = await Model.findById(req.params.id, { password: 0 });
      res.send({ data: updated.toJSON() });
    } catch (e) {
      res.send(e);
    }
  }
);

router.put(
  "/:id/cover",
  authRequired,
  parser.single("photo"),
  async (req, res) => {
    try {
      const { path } = req.file;
      let obj = await Model.findById(req.params.id);
      obj.cover = path;
      let update = await Model.findByIdAndUpdate(req.params.id, obj);
      let updated = await Model.findById(req.params.id, { password: 0 });
      res.send({ data: updated.toJSON() });
    } catch (e) {
      res.send(e);
    }
  }
);
router.delete("/:id", authRequired, async (req, res) => {
  try {
    let deleted = await Model.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (e) {
    res.status(500).send(e);
  }
});
//
router.get("/:id/posts", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let posts = await Posts.find({
        createdBy: req.user._id,
      }).populate("createdBy", { password: 0 });
      res.send({ data: posts });
    } else {
      let posts = await Posts.find({
        createdBy: req.params.id,
      }).populate("createdBy", { password: 0 });
      res.send({ data: posts });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/:id/cv", async (req, res) => {
  try {
    const user = await Model.findById(req.params.id)
      .populate("experiences")
      .populate("languages");
    if (user) {
      //console.log(user);
      let doc = await generateCV(user);
      // console.log(doc);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${
          user.name +
          " " +
          user.lastName +
          "_cv_" +
          new Date().toLocaleDateString() +
          ".pdf"
        }`
      );
      doc.pipe(res);
      doc.end();
    } else {
      res.status(404).send({ message: "User not found!" });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/:id/experiences", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let experiences = await Experiences.find({ createdBy: req.user._id });
      res.send({ data: experiences });
    } else {
      let experiences = await Experiences.find({ createdBy: req.params.id });
      res.send({ data: experiences });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/:id/certifications", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let certifications = await Certifications.find({
        createdBy: req.user._id,
      });
      res.send({ data: certifications });
    } else {
      let certifications = await Certifications.find({
        createdBy: req.params.id,
      });
      res.send({ data: certifications });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/:id/educations", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let educations = await Educations.find({
        createdBy: req.user._id,
      });
      res.send({ data: educations });
    } else {
      let educations = await Educations.find({
        createdBy: req.params.id,
      });
      res.send({ data: educations });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/:id/languages", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let languages = await Languages.find({
        createdBy: req.user._id,
      });
      res.send({ data: languages });
    } else {
      let languages = await Languages.find({
        createdBy: req.params.id,
      });
      res.send({ data: languages });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
