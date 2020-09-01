const router = require("express").Router();
const Model = require("./model");
const Users = require("../users/model");
const {
  getUser,
  generateAuthString,
  authRequired,
} = require("../../utils/auth.utils");
const cloudinary = require("../../utils/photo.utils");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({ cloudinary });
const multer = require("multer");
const parser = multer({ storage: storage });
router.get("/", getUser, async (req, res) => {
  try {
    let all = await Model.find({});
    res.send({ data: all });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/:id", getUser, async (req, res) => {
  try {
    if (req.params.id === "me") {
      let all = await Model.find({ createdBy: req.user._id });
      res.send({ data: all });
    } else {
      let single = await Model.findById(req.params.id);
      res.send({ data: single });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/", getUser, async (req, res) => {
  try {
    let newObj = await new Model({
      ...req.body,
      createdBy: req.user._id,
    }).save();
    let user = await Users.findById(req.user._id);
    user.certifications = [...user.certifications, newObj._id];
    let update = await Users.findByIdAndUpdate(req.user._id, user);
    let updated = await Users.findById(req.user._id);
    res.send({ data: updated });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put("/:id", getUser, async (req, res) => {
  try {
    let update = await Model.findByIdAndUpdate(req.params.id, req.body);
    let updated = await Model.findById(req.params.id);
    res.send({ data: updated });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.put("/:id/photo", getUser, parser.single("photo"), async (req, res) => {
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
});
router.delete("/:id", getUser, async (req, res) => {
  try {
    let isExists = await Model.findById(req.params.id);
    if (req.user._id.equals(isExists.createdBy)) {
      let deleted = await Model.findByIdAndDelete(req.params.id);
      res.send("Deleted");
    } else {
      res.status(403).send("Unauthorized");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
